<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $captchaConfigured = false;
        if (class_exists('\Nwidart\Modules\Facades\Module')) {
            $module = \Nwidart\Modules\Facades\Module::find('Captcha');
            if ($module && $module->isEnabled()) {
                $siteKey = \App\Models\Setting::get('captcha', 'captcha_site_key');
                $secretKey = \App\Models\Setting::get('captcha', 'captcha_secret_key');
                if ($siteKey && $secretKey) {
                    $captchaConfigured = true;
                }
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'permissions' => $request->user() ? $request->user()->allPermissions() : [],
            ],
            'content_types' => $request->user() 
                ? \App\Models\ContentType::all(['id', 'name', 'slug'])->filter(fn($type) => $request->user()->hasPermission($type->slug, 'read'))->values()
                : [],
            'ziggy' => fn () => [
                ...(new \Tighten\Ziggy\Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'plugins' => function () {
                if (!class_exists('\Nwidart\Modules\Facades\Module')) {
                    return [];
                }
                $modules = \Nwidart\Modules\Facades\Module::all();
                $plugins = [];
                foreach ($modules as $module) {
                    $plugins[] = [
                        'name' => $module->getName(),
                        'alias' => $module->getLowerName(),
                        'type' => $module->get('plugin_type', 'system'),
                        'enabled' => $module->isEnabled(),
                        'meta' => $module->get('block_meta', []),
                    ];
                }
                return $plugins;
            },
            'captcha_site_key' => $captchaConfigured ? \App\Models\Setting::get('captcha', 'captcha_site_key') : null,
        ];
    }
}
