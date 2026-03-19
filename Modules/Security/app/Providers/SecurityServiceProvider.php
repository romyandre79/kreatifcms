<?php

namespace Modules\Security\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use App\Models\Setting;

class SecurityServiceProvider extends ServiceProvider
{
    /**
     * Boot the application services.
     */
    public function boot(): void
    {
        $this->registerConfig();

        RateLimiter::for('api', function (Request $request) {
            $limit = Setting::get('security', 'api_rate_limit', config('security.api_rate_limit', 60));
            return Limit::perMinute($limit)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('login', function (Request $request) {
            $limit = Setting::get('security', 'login_rate_limit', config('security.login_rate_limit', 5));
            return Limit::perMinute($limit)->by($request->ip());
        });
    }

    /**
     * Register the service provider.
     */
    public function register(): void
    {
        //
    }

    /**
     * Register config.
     */
    protected function registerConfig(): void
    {
        $this->publishes([
            module_path('Security', 'config/config.php') => config_path('security.php'),
        ], 'config');

        $this->mergeConfigFrom(
            module_path('Security', 'config/config.php'), 'security'
        );
    }
}
