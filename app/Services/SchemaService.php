<?php

namespace App\Services;

use App\Models\ContentType;
use App\Models\ContentField;
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
            'text' => $table->string($name),
            'longtext' => $table->text($name),
            'integer' => $table->integer($name),
            'boolean' => $table->boolean($name),
            'date' => $table->date($name),
            'json' => $table->json($name),
            'relation' => $table->unsignedBigInteger($name),
            default => $table->string($name),
        };

        if (!$field->required) {
            $column->nullable();
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
        
        foreach ($blocks as &$block) {
            if (isset($block['type']) && $block['type'] === 'content_list') {
                $ctSlug = $block['data']['content_type'] ?? null;
                $limit = $block['data']['limit'] ?? 6;
                $sortBy = $block['data']['sort_by'] ?? 'created_at';
                $sortDir = $block['data']['sort_dir'] ?? 'desc';
                
                if ($ctSlug) {
                    $tableName = $this->getTableName($ctSlug);
                    
                    try {
                        if (Schema::connection($this->connection)->hasTable($tableName)) {
                            $items = \Illuminate\Support\Facades\DB::connection($this->connection)
                                ->table($tableName)
                                ->orderBy($sortBy, $sortDir)
                                ->limit($limit)
                                ->get();
                                
                            $block['data']['items'] = $items;
                        } else {
                            $block['data']['items'] = [];
                        }
                    } catch (\Exception $e) {
                        $block['data']['items'] = [];
                    }
                } else {
                    $block['data']['items'] = [];
                }
            }
        }
        return $blocks;
    }
}
