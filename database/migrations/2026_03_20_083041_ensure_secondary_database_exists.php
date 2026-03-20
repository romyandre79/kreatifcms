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
                Log::warning("Could not automatically create secondary database during migration: " . $e->getMessage());
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Don't drop database in down() to prevent accidental data loss
    }
};
