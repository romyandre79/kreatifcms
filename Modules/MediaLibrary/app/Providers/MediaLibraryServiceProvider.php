<?php

namespace Modules\MediaLibrary\Providers;

use Illuminate\Support\ServiceProvider;
use Nwidart\Modules\Traits\PathNamespace;

class MediaLibraryServiceProvider extends ServiceProvider
{
    use PathNamespace;

    protected string $name = 'MediaLibrary';

    protected string $nameLower = 'medialibrary';

    public function boot(): void
    {
        $this->registerConfig();
    }

    public function register(): void
    {
        $this->app->register(EventServiceProvider::class);
    }

    protected function registerConfig(): void
    {
        $this->publishes([
            module_path($this->name, 'config/config.php') => config_path($this->nameLower.'.php'),
        ], 'config');
        
        $configPath = module_path($this->name, 'config/config.php');
        if (file_exists($configPath)) {
            $this->mergeConfigFrom($configPath, $this->nameLower);
        }
    }
}
