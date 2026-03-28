<?php

namespace Modules\Layout\Providers;

use Illuminate\Support\ServiceProvider;
use Nwidart\Modules\Traits\PathNamespace;

class LayoutServiceProvider extends ServiceProvider
{
    use PathNamespace;

    protected string $name = 'Layout';

    protected string $nameLower = 'layout';

    /**
     * Boot the application events.
     */
    public function boot(): void
    {
    }

    /**
     * Register the service provider.
     */
    public function register(): void
    {
        $this->app->register(RouteServiceProvider::class);
    }
}
