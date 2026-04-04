<?php

namespace Modules\GeneralApi\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;

class GeneralApiServiceProvider extends ServiceProvider
{
    protected string $name = 'GeneralApi';

    protected string $nameLower = 'generalapi';

    public function boot(): void
    {
        $this->registerRoutes();
        
        // Load migrations if they were in the module (we put it in global, but good for future)
        $this->loadMigrationsFrom(module_path($this->name, 'database/migrations'));
    }

    public function register(): void
    {
        //
    }

    protected function registerRoutes(): void
    {
        // Admin Web Routes
        Route::middleware(['web', 'auth'])
            ->group(module_path($this->name, 'app/routes/web.php'));

        // Custom API Routes
        Route::middleware(['api'])
            ->prefix('api')
            ->group(module_path($this->name, 'app/routes/api.php'));
    }
}
