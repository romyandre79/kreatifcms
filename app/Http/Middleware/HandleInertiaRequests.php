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
                            'fontSize' => '16',
                            'customStyles' => [],
                            'customCss' => '',
                        ]
                    ];
                }

                return [
                    'header' => \App\Models\Setting::where('module', 'layout')->where('key', 'header')->first()?->value ? json_decode(\App\Models\Setting::where('module', 'layout')->where('key', 'header')->first()->value, true) : [],
                    'footer' => \App\Models\Setting::where('module', 'layout')->where('key', 'footer')->first()?->value ? json_decode(\App\Models\Setting::where('module', 'layout')->where('key', 'footer')->first()->value, true) : [],
                    'theme' => (() => {
                        $existing = \App\Models\Setting::where('module', 'layout')->where('key', 'theme')->first()?->value;
                        $settings = $existing ? json_decode($existing, true) : [];
                        
                        $defaults = [
                            'primaryColor' => '#4f46e5',
                            'secondaryColor' => '#10b981',
                            'fontFamily' => 'Inter',
                            'fontSize' => '16',
                            'customStyles' => [
                                [
                                    'id' => 'style_body',
                                    'name' => 'Body Style',
                                    'selector' => 'body',
                                    'fontFamily' => 'Inter',
                                    'fontSize' => '16',
                                    'textColor' => '#111827',
                                    'bgColor' => '#ffffff',
                                ],
                                [
                                    'id' => 'style_h1',
                                    'name' => 'Heading 1',
                                    'selector' => 'h1',
                                    'fontFamily' => 'Inter',
                                    'fontSize' => '40',
                                    'textColor' => '#111827',
                                    'bgColor' => 'transparent',
                                ]
                            ],
                            'customCss' => '',
                        ];

                        // If customStyles is missing but old body/h1 settings exist, migrate them
                        if (!isset($settings['customStyles'])) {
                            $settings['customStyles'] = $defaults['customStyles'];
                            if (isset($settings['bodyTextColor'])) $settings['customStyles'][0]['textColor'] = $settings['bodyTextColor'];
                            if (isset($settings['bodyBgColor'])) $settings['customStyles'][0]['bgColor'] = $settings['bodyBgColor'];
                            if (isset($settings['h1FontSize'])) $settings['customStyles'][1]['fontSize'] = $settings['h1FontSize'];
                            if (isset($settings['h1TextColor'])) $settings['customStyles'][1]['textColor'] = $settings['h1TextColor'];
                        }

                        return array_merge($defaults, $settings);
                    })(),
                ];
            },
        ];
    }
}
