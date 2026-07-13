<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        \App\Services\DatabaseFactory::createDatabaseIfNotExists('secondary');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Don't drop database in down() to prevent accidental data loss
    }
};
