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
                $captchaConfigured = true;
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'permissions' => $request->user() ? $request->user()->allPermissions() : [],
            ],
            'content_types' => function() use ($request) {
                $isContentEnabled = class_exists('Modules\ContentType\Models\ContentType') && 
                                   ($module = \Nwidart\Modules\Facades\Module::find('ContentType')) && 
                                   $module->isEnabled();
                
                if (!$isContentEnabled) {
                    return [];
                }
                return $request->user() 
                    ? \Modules\ContentType\Models\ContentType::all(['id', 'name', 'slug'])->filter(fn($type) => $request->user()->hasPermission($type->slug, 'read'))->values()
                    : [];
            },
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
            'captcha_site_key' => $captchaConfigured ? (\App\Models\Setting::get('captcha', 'captcha_site_key') ?: (env('RECAPTCHA_SITE_KEY') ?: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI')) : null,
            'layout' => function() {
                $isLayoutEnabled = class_exists('\Nwidart\Modules\Facades\Module') && 
                                  ($module = \Nwidart\Modules\Facades\Module::find('Layout')) && 
                                  $module->isEnabled();
                
                if (!$isLayoutEnabled) {
                    return [
                        'header' => [],
                        'footer' => [],
                        'theme' => [
                            'primaryColor' => '#4f46e5',
                            'secondaryColor' => '#10b981',
                            'fontFamily' => 'Inter',
                            'fontSize' => '16'
                        ]
                    ];
                }

                return [
                    'header' => \App\Models\Setting::where('module', 'layout')->where('key', 'header')->first()?->value ? json_decode(\App\Models\Setting::where('module', 'layout')->where('key', 'header')->first()->value, true) : [],
                    'footer' => \App\Models\Setting::where('module', 'layout')->where('key', 'footer')->first()?->value ? json_decode(\App\Models\Setting::where('module', 'layout')->where('key', 'footer')->first()->value, true) : [],
                    'theme' => \App\Models\Setting::where('module', 'layout')->where('key', 'theme')->first()?->value ? json_decode(\App\Models\Setting::where('module', 'layout')->where('key', 'theme')->first()->value, true) : [
                        'primaryColor' => '#4f46e5',
                        'secondaryColor' => '#10b981',
                        'fontFamily' => 'Inter',
                        'fontSize' => '16'
                    ],
                ];
            },
        ];
    }
}
