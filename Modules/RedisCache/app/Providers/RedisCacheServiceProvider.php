<?php

namespace Modules\RedisCache\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;
use Nwidart\Modules\Traits\PathNamespace;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

class RedisCacheServiceProvider extends ServiceProvider
{
    use PathNamespace;

    protected string $name = 'RedisCache';

    protected string $nameLower = 'rediscache';

    /**
     * Boot the application events.
     */
    public function boot(): void
    {
        $this->injectRedisConfiguration();
        $this->registerCommands();
        $this->registerCommandSchedules();
        $this->registerTranslations();
        $this->registerConfig();
        $this->registerViews();
        $this->loadMigrationsFrom(module_path($this->name, 'database/migrations'));
    }

    /**
     * Register the service provider.
     */
    public function register(): void
    {
        $this->app->register(EventServiceProvider::class);
        $this->app->register(RouteServiceProvider::class);
    }

    /**
     * Dynamically inject the Redis and Cache configurations using Plugin settings.
     */
    protected function injectRedisConfiguration(): void
    {
        try {
            // Circuit Breaker: If the environment physically cannot connect to Redis, safely abort boot interception.
            if (!extension_loaded('redis') && !class_exists('Predis\Client')) {
                \Illuminate\Support\Facades\Log::warning("RedisCache Plugin disabled: Neither the 'redis' PHP PECL extension nor the 'predis/predis' composer package are installed.");
                return;
            }

            // Pull the user's plugin settings directly from the DB
            $host = \App\Models\Setting::get('rediscache', 'host', '127.0.0.1');
            $port = \App\Models\Setting::get('rediscache', 'port', 6379);
            $password = \App\Models\Setting::get('rediscache', 'password', '');
            $database = \App\Models\Setting::get('rediscache', 'database', 0);

            // Dynamically register client depending on environment
            $client = extension_loaded('redis') ? 'phpredis' : 'predis';
            config(['database.redis.client' => $client]);

            // Dynamically register a new Redis database connection
            config(['database.redis.rediscache_plugin' => [
                'host' => $host,
                'password' => empty($password) ? null : $password,
                'port' => $port,
                'database' => $database,
            ]]);

            // Register a custom explicit Cache store pointing to our new Redis cluster
            config(['cache.stores.rediscache' => [
                'driver' => 'redis',
                'connection' => 'rediscache_plugin',
                'lock_connection' => 'default',
            ]]);
        } catch (\Exception $e) {
            // Fail silently if DB is totally down during initial boot
            \Illuminate\Support\Facades\Log::warning("RedisCache Plugin config interception failed: " . $e->getMessage());
        }
    }

    /**
     * Register commands in the format of Command::class
     */
    protected function registerCommands(): void
    {
        // $this->commands([]);
    }

    /**
     * Register command Schedules.
     */
    protected function registerCommandSchedules(): void
    {
        // $this->app->booted(function () {
        //     $schedule = $this->app->make(Schedule::class);
        //     $schedule->command('inspire')->hourly();
        // });
    }

    /**
     * Register translations.
     */
    public function registerTranslations(): void
    {
        $langPath = resource_path('lang/modules/'.$this->nameLower);

        if (is_dir($langPath)) {
            $this->loadTranslationsFrom($langPath, $this->nameLower);
            $this->loadJsonTranslationsFrom($langPath);
        } else {
            $this->loadTranslationsFrom(module_path($this->name, 'lang'), $this->nameLower);
            $this->loadJsonTranslationsFrom(module_path($this->name, 'lang'));
        }
    }

    /**
     * Register config.
     */
    protected function registerConfig(): void
    {
        $configPath = module_path($this->name, config('modules.paths.generator.config.path'));

        if (is_dir($configPath)) {
            $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($configPath));

            foreach ($iterator as $file) {
                if ($file->isFile() && $file->getExtension() === 'php') {
                    $config = str_replace($configPath.DIRECTORY_SEPARATOR, '', $file->getPathname());
                    $config_key = str_replace([DIRECTORY_SEPARATOR, '.php'], ['.', ''], $config);
                    $segments = explode('.', $this->nameLower.'.'.$config_key);

                    // Remove duplicated adjacent segments
                    $normalized = [];
                    foreach ($segments as $segment) {
                        if (end($normalized) !== $segment) {
                            $normalized[] = $segment;
                        }
                    }

                    $key = ($config === 'config.php') ? $this->nameLower : implode('.', $normalized);

                    $this->publishes([$file->getPathname() => config_path($config)], 'config');
                    $this->merge_config_from($file->getPathname(), $key);
                }
            }
        }
    }

    /**
     * Merge config from the given path recursively.
     */
    protected function merge_config_from(string $path, string $key): void
    {
        $existing = config($key, []);
        $module_config = require $path;

        config([$key => array_replace_recursive($existing, $module_config)]);
    }

    /**
     * Register views.
     */
    public function registerViews(): void
    {
        $viewPath = resource_path('views/modules/'.$this->nameLower);
        $sourcePath = module_path($this->name, 'resources/views');

        $this->publishes([$sourcePath => $viewPath], ['views', $this->nameLower.'-module-views']);

        $this->loadViewsFrom(array_merge($this->getPublishableViewPaths(), [$sourcePath]), $this->nameLower);

        Blade::componentNamespace(config('modules.namespace').'\\' . $this->name . '\\View\\Components', $this->nameLower);
    }

    /**
     * Get the services provided by the provider.
     */
    public function provides(): array
    {
        return [];
    }

    private function getPublishableViewPaths(): array
    {
        $paths = [];
        foreach (config('view.paths') as $path) {
            if (is_dir($path.'/modules/'.$this->nameLower)) {
                $paths[] = $path.'/modules/'.$this->nameLower;
            }
        }

        return $paths;
    }
}
