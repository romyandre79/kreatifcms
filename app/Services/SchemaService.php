<?php

namespace App\Services;

use Modules\ContentType\Models\ContentType;
use Modules\ContentType\Models\ContentField;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Str;

class SchemaService
{
    protected $connection = 'secondary';

    /**
     * Create a dynamic table for a ContentType.
     */
    public function createTable(ContentType $contentType)
    {
        $this->ensureDatabaseExists();
        $tableName = $this->getTableName($contentType->slug);

        Schema::connection($this->connection)->create($tableName, function (Blueprint $table) use ($contentType) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            
            foreach ($contentType->fields as $field) {
                $this->addFieldToTable($table, $field);
            }

            $table->timestamps();
        });
    }

    /**
     * Add a field to a dynamic table.
     */
    protected function addFieldToTable(Blueprint $table, ContentField $field)
    {
        $type = $field->type;
        $name = Str::snake($field->name);

        $column = match ($type) {
            'text' => $table->string($name, $field->options['length'] ?? 255),
            'longtext' => $table->mediumText($name),
            'integer' => $table->integer($name),
            'boolean' => $table->boolean($name),
            'date' => $table->date($name),
            'json' => $table->json($name),
            'image' => $table->string($name, 255),
            'file' => $table->string($name, 255),
            'relation' => $table->unsignedBigInteger($name),
            default => $table->string($name, 255),
        };

        if (!$field->required) {
            $column->nullable();
        }

        if ($field->is_unique) {
            $column->unique();
        }

        return $column;
    }

    /**
     * Get the standardized table name.
     */
    public function getTableName(string $slug)
    {
        return 'cms_' . Str::snake($slug);
    }

    /**
     * Drop a dynamic table.
     */
    public function dropTable(string $slug)
    {
        $tableName = $this->getTableName($slug);
        Schema::connection($this->connection)->dropIfExists($tableName);
    }

    /**
     * Update a table's schema (add/remove columns).
     */
    public function updateSchema(ContentType $contentType)
    {
        $this->ensureDatabaseExists();
        $tableName = $this->getTableName($contentType->slug);
        
        Schema::connection($this->connection)->table($tableName, function (Blueprint $table) use ($contentType, $tableName) {
            $existingColumns = Schema::connection($this->connection)->getColumnListing($tableName);
            
            if (!in_array('user_id', $existingColumns)) {
                $table->unsignedBigInteger('user_id')->nullable()->after('id');
            }
            
            foreach ($contentType->fields as $field) {
                $columnName = Str::snake($field->name);
                if (!in_array($columnName, $existingColumns)) {
                    $this->addFieldToTable($table, $field);
                } else {
                    $this->addFieldToTable($table, $field)->change();
                }
            }
        });
    }

    /**
     * Ensure the secondary database exists before attempting schema operations.
     */
    protected function ensureDatabaseExists()
    {
        $database = config('database.connections.secondary.database');
        $host = config('database.connections.secondary.host');
        $port = config('database.connections.secondary.port');
        $username = config('database.connections.secondary.username');
        $password = config('database.connections.secondary.password');

        if ($database && $host && $username) {
            try {
                $pdo = new \PDO("mysql:host={$host};port={$port}", $username, $password);
                $pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
                $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning("Could not automatically create secondary database: " . $e->getMessage());
            }
        }
    }
    /**
     * Hydrate dynamic blocks with data from the secondary database.
     */
    public function hydrateDynamicBlocks($blocks)
    {
        if (!is_array($blocks)) return $blocks ?? [];
        
        if (class_exists('Modules\ContentType\Models\ContentType') && \Nwidart\Modules\Facades\Module::isEnabled('ContentType')) {
            foreach ($blocks as &$block) {
                if (!isset($block['type'])) continue;

                if ($block['type'] === 'form') {
                    $mode = $block['data']['mode'] ?? 'static';
                    $ctSlug = $block['data']['content_type'] ?? null;
                    
                    if ($mode === 'dynamic' && $ctSlug) {
                        $contentType = ContentType::with('fields')->where('slug', $ctSlug)->first();
                        if ($contentType) {
                            $fields = $contentType->fields ?? collect();
                            $block['data']['fields'] = $fields->map(function($f) {
                                $options = $f->options ?: [];
                                return [
                                    'id' => $f->id,
                                    'name' => \Illuminate\Support\Str::snake($f->name),
                                    'label' => $f->name,
                                    'type' => $f->type === 'longtext' ? 'textarea' : ($f->type === 'number' ? 'number' : 'text'),
                                    'placeholder' => $options['placeholder'] ?? '',
                                    'required' => (bool)$f->required
                                ];
                            })->toArray();
                            \Illuminate\Support\Facades\Log::info("Hydrated form fields from content type: {$ctSlug}");
                        }
                    }
                }

                if ($block['type'] === 'content_list' || $block['type'] === 'slideshow' || $block['type'] === 'timeline' || $block['type'] === 'megamenu' || $block['type'] === 'navbar') {
                    $source = $block['data']['source'] ?? ($block['type'] === 'content_list' || $block['type'] === 'timeline' ? 'dynamic' : 'manual');
                    
                    // For navbar, we check the specific megamenu_source property
                    if ($block['type'] === 'navbar' && ($block['data']['megamenu_source'] ?? '') === 'dynamic') {
                        $source = 'dynamic';
                    }

                    if ($source === 'dynamic' || $block['type'] === 'content_list') {
                        $ctSlug = ($block['type'] === 'navbar') ? ($block['data']['megamenu_content_type'] ?? null) : ($block['data']['content_type'] ?? null);
                        $limit = ($block['type'] === 'navbar') ? ($block['data']['megamenu_limit'] ?? 12) : ($block['data']['limit'] ?? 6);
                        $sortBy = 'created_at';
                        $sortDir = 'desc';
                        
                        if ($ctSlug) {
                            $tableName = $this->getTableName($ctSlug);
                            
                            try {
                                if (Schema::connection($this->connection)->hasTable($tableName)) {
                                    $cacheKey = "query_{$tableName}_" . md5(json_encode([$sortBy, $sortDir, $limit]));
                                    
                                    $queryClosure = function () use ($tableName, $sortBy, $sortDir, $limit) {
                                        return \Illuminate\Support\Facades\DB::connection($this->connection)
                                            ->table($tableName)
                                            ->orderBy($sortBy, $sortDir)
                                            ->limit($limit)
                                            ->get();
                                    };

                                    if (config('cache.stores.rediscache') && class_exists('\Nwidart\Modules\Facades\Module') && \Nwidart\Modules\Facades\Module::isEnabled('RedisCache')) {
                                        try {
                                            $ttl = (int)\App\Models\Setting::get('rediscache', 'ttl', 3600);
                                            $items = \Illuminate\Support\Facades\Cache::store('rediscache')
                                                ->tags(['content', $ctSlug])
                                                ->remember($cacheKey, $ttl, $queryClosure);
                                        } catch (\Exception $e) {
                                            \Illuminate\Support\Facades\Log::warning("RedisCache failed, falling back to direct query: " . $e->getMessage());
                                            $items = $queryClosure();
                                        }
                                    } else {
                                        $items = $queryClosure();
                                    }

                                    // Process onSelect hook if available
                                    $contentTypeDoc = ContentType::where('slug', $ctSlug)->first();
                                    if ($contentTypeDoc && !empty($contentTypeDoc->events['onSelect'])) {
                                        foreach ($items as $item) {
                                            $context = ['entry' => $item];
                                            $this->executePhpHook($contentTypeDoc->events['onSelect'], $context);
                                        }
                                    }
                                        
                                     \Illuminate\Support\Facades\Log::info("Hydrated {$block['type']} from {$ctSlug}: " . $items->count() . " items");
                                    
                                    // Transform for timeline if needed
                                    if ($block['type'] === 'timeline' && !empty($block['data']['mapping'])) {
                                        // ... mapping logic already exists ...
                                    }

                                    if ($block['type'] === 'navbar') {
                                        $block['data']['mega_menus_dynamic_items'] = $items;
                                    } else {
                                        $block['data']['items'] = $items;
                                    }
                                } else {
                                    \Illuminate\Support\Facades\Log::warning("Table not found for hydration: {$tableName}");
                                    if ($block['type'] === 'navbar') {
                                        $block['data']['mega_menus_dynamic_items'] = [];
                                    } else {
                                        $block['data']['items'] = [];
                                    }
                                }
                            } catch (\Exception $e) {
                                \Illuminate\Support\Facades\Log::error("Hydration error for {$block['type']}: " . $e->getMessage());
                                if ($block['type'] === 'navbar') {
                                    $block['data']['mega_menus_dynamic_items'] = [];
                                } else {
                                    $block['data']['items'] = [];
                                }
                            }
                        } else {
                            if ($block['type'] === 'navbar') {
                                $block['data']['mega_menus_dynamic_items'] = [];
                            } else {
                                $block['data']['items'] = [];
                            }
                        }
                    }
                }
            }
        }

        foreach ($blocks as &$block) {
            // Universal Custom PHP Hook support for all blocks
            if (!empty($block['data']['customPhp'])) {
                $context = [
                    'block' => &$block,
                    'data' => &$block['data']
                ];
                $this->executePhpHook($block['data']['customPhp'], $context);
                \Illuminate\Support\Facades\Log::info("Executed custom PHP for block: {$block['id']} ({$block['type']})");
            }
        }
        return $blocks;
    }

    /**
     * Safely execute a PHP hook for a content type.
     */
    private function executePhpHook(?string $code, array &$context)
    {
        if (empty(trim($code))) return;

        try {
            $executor = function(&$context, $code) {
                extract($context, EXTR_REFS);
                eval($code);
            };
            $executor($context, $code);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("PHP Hook Error (SchemaService): " . $e->getMessage(), [
                'exception' => $e
            ]);
        }
    }
}
