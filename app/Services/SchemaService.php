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
}
