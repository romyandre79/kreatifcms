<?php

namespace Modules\TwoFactorAuth\Providers;

use Illuminate\Support\ServiceProvider;

class TwoFactorAuthServiceProvider extends ServiceProvider
{
    /**
     * Boot the application services.
     */
    public function boot(): void
    {
        $this->registerConfig();
        $this->registerRoutes();
        $this->loadMigrationsFrom(module_path('TwoFactorAuth', 'database/migrations'));
        $this->loadViewsFrom(module_path('TwoFactorAuth', 'resources/views'), 'twofactorauth');
    }

    /**
     * Register the service provider.
     */
    public function register(): void
    {
        //
    }

    /**
     * Register the module routes.
     */
    protected function registerRoutes(): void
    {
        \Illuminate\Support\Facades\Route::middleware('web')
            ->group(module_path('TwoFactorAuth', 'routes/web.php'));
    }

    /**
     * Register config.
     */
    protected function registerConfig(): void
    {
        $this->publishes([
            module_path('TwoFactorAuth', 'config/config.php') => config_path('twofactorauth.php'),
        ], 'config');

        $this->mergeConfigFrom(
            module_path('TwoFactorAuth', 'config/config.php'), 'twofactorauth'
        );
    }
}
