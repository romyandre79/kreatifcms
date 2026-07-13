<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

/**
 * DatabaseFactory — Driver-aware helper for cross-engine database operations.
 *
 * Supports: mysql, mariadb, pgsql, sqlsrv, oracle/oci8 (via yajra/laravel-oci8), sqlite.
 * Centralizes all engine-specific PDO DSN and CREATE DATABASE logic.
 */
class DatabaseFactory
{
    /**
     * Supported database drivers.
     */
    protected static array $supportedDrivers = ['mysql', 'mariadb', 'pgsql', 'sqlsrv', 'oracle', 'oci8', 'sqlite'];

    /**
     * Check if a driver is supported.
     */
    public static function isSupportedDriver(string $driver): bool
    {
        return in_array($driver, static::$supportedDrivers);
    }

    /**
     * Create a database if it does not exist, reading config from a named connection.
     *
     * @param string $connectionName  The Laravel database connection name (e.g., 'secondary')
     */
    public static function createDatabaseIfNotExists(string $connectionName): void
    {
        $config = config("database.connections.{$connectionName}");

        if (!$config) {
            Log::warning("DatabaseFactory: Connection '{$connectionName}' not found in config.");
            return;
        }

        $driver   = $config['driver'] ?? 'mysql';
        $host     = $config['host'] ?? '127.0.0.1';
        $port     = $config['port'] ?? static::getDefaultPort($driver);
        $username = $config['username'] ?? '';
        $password = $config['password'] ?? '';
        $database = $config['database'] ?? '';

        if (empty($database) || empty($host)) {
            return;
        }

        // SQLite is file-based, no need to create database
        if ($driver === 'sqlite') {
            return;
        }

        static::createDatabaseForDriver($driver, $host, $port, $username, $password, $database);
    }

    /**
     * Create a database for a specific driver with explicit credentials.
     *
     * @param string $driver    Database driver (mysql, mariadb, pgsql, sqlsrv, oci8)
     * @param string $host      Database host
     * @param string $port      Database port
     * @param string $username  Database username
     * @param string $password  Database password
     * @param string $database  Database name to create
     */
    public static function createDatabaseForDriver(
        string $driver,
        string $host,
        string $port,
        string $username,
        string $password,
        string $database
    ): void {
        if ($driver === 'sqlite') {
            return;
        }

        if (!static::isSupportedDriver($driver)) {
            Log::warning("DatabaseFactory: Unsupported driver '{$driver}'. Cannot auto-create database.");
            return;
        }

        try {
            $dsn = static::buildServerDsn($driver, $host, $port);
            $pdo = new \PDO($dsn, $username, $password);
            $pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);

            static::executeCreateDatabase($pdo, $driver, $database);

            Log::info("DatabaseFactory: Database '{$database}' ensured on {$driver} ({$host}:{$port}).");
        } catch (\Exception $e) {
            Log::warning("DatabaseFactory: Could not auto-create database '{$database}' on {$driver}: " . $e->getMessage());
        }
    }

    /**
     * Build a PDO DSN for connecting to the server (without specifying a database).
     */
    protected static function buildServerDsn(string $driver, string $host, string $port): string
    {
        return match ($driver) {
            'mysql', 'mariadb' => "mysql:host={$host};port={$port}",
            'pgsql'           => "pgsql:host={$host};port={$port};dbname=postgres",
            'sqlsrv'          => "sqlsrv:Server={$host},{$port}",
            'oracle', 'oci8'  => "oci:dbname=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={$host})(PORT={$port}))(CONNECT_DATA=(SERVICE_NAME=ORCL)))",
            default           => "mysql:host={$host};port={$port}",
        };
    }

    /**
     * Execute the CREATE DATABASE statement appropriate for the driver.
     */
    protected static function executeCreateDatabase(\PDO $pdo, string $driver, string $database): void
    {
        match ($driver) {
            'mysql', 'mariadb' => $pdo->exec(
                "CREATE DATABASE IF NOT EXISTS `{$database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            ),

            'pgsql' => static::createPostgresDatabase($pdo, $database),

            'sqlsrv' => $pdo->exec(
                "IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = '{$database}') CREATE DATABASE [{$database}]"
            ),

            'oracle', 'oci8' => static::createOracleSchema($pdo, $database),

            default => $pdo->exec(
                "CREATE DATABASE IF NOT EXISTS `{$database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            ),
        };
    }

    /**
     * PostgreSQL: Check if database exists before creating (no IF NOT EXISTS support in CREATE DATABASE).
     */
    protected static function createPostgresDatabase(\PDO $pdo, string $database): void
    {
        $stmt = $pdo->prepare("SELECT 1 FROM pg_database WHERE datname = :dbname");
        $stmt->execute(['dbname' => $database]);

        if (!$stmt->fetch()) {
            // PostgreSQL doesn't support parameterized DDL, but we sanitize the name
            $safeName = preg_replace('/[^a-zA-Z0-9_]/', '', $database);
            $pdo->exec("CREATE DATABASE \"{$safeName}\" ENCODING 'UTF8'");
        }
    }

    /**
     * Oracle: Create a user/schema (Oracle uses schemas instead of databases).
     * This creates a user with the database name and grants connect/resource.
     */
    protected static function createOracleSchema(\PDO $pdo, string $database): void
    {
        $safeName = preg_replace('/[^a-zA-Z0-9_]/', '', $database);
        $upperName = strtoupper($safeName);

        $stmt = $pdo->prepare("SELECT 1 FROM all_users WHERE username = :uname");
        $stmt->execute(['uname' => $upperName]);

        if (!$stmt->fetch()) {
            // Use a default password (should be changed in production)
            $pdo->exec("CREATE USER \"{$upperName}\" IDENTIFIED BY \"{$safeName}_pass\" DEFAULT TABLESPACE USERS QUOTA UNLIMITED ON USERS");
            $pdo->exec("GRANT CONNECT, RESOURCE TO \"{$upperName}\"");
            Log::info("DatabaseFactory: Oracle schema/user '{$upperName}' created.");
        }
    }

    /**
     * Get the default port for a given driver.
     */
    public static function getDefaultPort(string $driver): string
    {
        return match ($driver) {
            'mysql', 'mariadb' => '3306',
            'pgsql'           => '5432',
            'sqlsrv'          => '1433',
            'oracle', 'oci8'  => '1521',
            'sqlite'          => '',
            default           => '3306',
        };
    }

    /**
     * Get the appropriate LIKE operator for the current driver.
     * PostgreSQL requires ILIKE for case-insensitive search.
     */
    public static function likeOperator(string $connectionName = 'secondary'): string
    {
        $driver = config("database.connections.{$connectionName}.driver", 'mysql');
        return $driver === 'pgsql' ? 'ILIKE' : 'LIKE';
    }

    /**
     * Get a cross-engine compatible DATE extraction expression.
     * MySQL/PostgreSQL: DATE(column)
     * SQL Server: CAST(column AS DATE)
     * Oracle: TRUNC(column)
     */
    public static function dateExpression(string $column, string $connectionName = 'secondary'): string
    {
        $driver = config("database.connections.{$connectionName}.driver", 'mysql');

        return match ($driver) {
            'sqlsrv'          => "CAST({$column} AS DATE)",
            'oracle', 'oci8'  => "TRUNC({$column})",
            default           => "DATE({$column})",
        };
    }
}
