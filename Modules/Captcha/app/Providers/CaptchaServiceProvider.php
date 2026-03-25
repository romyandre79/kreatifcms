<?php

namespace Modules\Captcha\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Validator;
use Modules\Captcha\Rules\Captcha;

class CaptchaServiceProvider extends ServiceProvider
{
    /**
     * Boot the application events.
     */
    public function boot(): void
    {
        Validator::extend('captcha', function ($attribute, $value, $parameters, $validator) {
            return (new Captcha())->passes($attribute, $value);
        });
    }

    /**
     * Register the service provider.
     */
    public function register(): void
    {
        //
    }
}
