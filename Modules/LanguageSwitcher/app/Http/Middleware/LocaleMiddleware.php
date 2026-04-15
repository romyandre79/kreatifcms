<?php

namespace Modules\LanguageSwitcher\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Modules\LanguageSwitcher\Models\Language;

class LocaleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if (Session::has('locale')) {
            App::setLocale(Session::get('locale'));
        } else {
            // Set default from database
            $default = Language::getDefault();
            if ($default) {
                App::setLocale($default->code);
                Session::put('locale', $default->code);
            }
        }

        return $next($request);
    }
}
