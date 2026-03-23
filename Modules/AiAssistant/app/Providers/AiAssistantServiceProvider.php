<?php

namespace Modules\AiAssistant\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;

class AiAssistantServiceProvider extends ServiceProvider
{
    public function boot()
    {
        $this->registerRoutes();
    }

    protected function registerRoutes()
    {
        Route::middleware(['web', 'auth'])
            ->prefix('ai-assistant')
            ->group(__DIR__ . '/../routes/web.php');
    }

    public function register()
    {
        //
    }
}
