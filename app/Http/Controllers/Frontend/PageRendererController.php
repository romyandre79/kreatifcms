<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Inertia\Inertia;
use Illuminate\Http\Request;

class PageRendererController extends Controller
{
    public function show($slug)
    {
        $page = Page::where('slug', $slug)->where('is_published', true)->firstOrFail();
        $pageData = $page->toArray();
        $schemaService = app(\App\Services\SchemaService::class);
        $pageData['blocks'] = $schemaService->hydrateDynamicBlocks($pageData['blocks']);
        
        $reusableBlocks = \Modules\ReusableBlock\Models\Block::all()->map(function($rb) use ($schemaService) {
            $data = is_string($rb->data) ? json_decode($rb->data, true) : $rb->data;
            if (is_array($data)) {
                $rb->data = $schemaService->hydrateDynamicBlocks($data);
            }
            return $rb;
        });

        return Inertia::render('Frontend/Page', [
            'page' => $pageData,
            'reusableBlocks' => $reusableBlocks,
            'layout' => array_merge($this->getGlobalLayout($schemaService), [
                'seo' => $this->getGlobalSeo()
            ])
        ]);
    }

    public function home()
    {
        $page = Page::where('slug', 'welcome')->where('is_published', true)->first();

        if ($page) {
            $pageData = $page->toArray();
            $schemaService = app(\App\Services\SchemaService::class);
            $pageData['blocks'] = $schemaService->hydrateDynamicBlocks($pageData['blocks']);
            
            $reusableBlocks = \Modules\ReusableBlock\Models\Block::all()->map(function($rb) use ($schemaService) {
                $data = is_string($rb->data) ? json_decode($rb->data, true) : $rb->data;
                if (is_array($data)) {
                    $rb->data = $schemaService->hydrateDynamicBlocks($data);
                }
                return $rb;
            });

            return Inertia::render('Frontend/Page', [
                'page' => $pageData,
                'reusableBlocks' => $reusableBlocks,
                'layout' => array_merge($this->getGlobalLayout($schemaService), [
                    'seo' => $this->getGlobalSeo()
                ])
            ]);
        }

        return Inertia::render('Welcome', [
            'canLogin' => \Illuminate\Support\Facades\Route::has('login'),
            'canRegister' => \Illuminate\Support\Facades\Route::has('register'),
            'laravelVersion' => \Illuminate\Foundation\Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    private function getGlobalLayout($schemaService = null)
    {
        if (!$schemaService) $schemaService = app(\App\Services\SchemaService::class);
        $header = \App\Models\Setting::where('module', 'layout')->where('key', 'header')->first();
        $footer = \App\Models\Setting::where('module', 'layout')->where('key', 'footer')->first();

        $headerBlocks = $header ? json_decode($header->value, true) : [];
        $footerBlocks = $footer ? json_decode($footer->value, true) : [];

        return [
            'header' => $schemaService->hydrateDynamicBlocks($headerBlocks),
            'footer' => $schemaService->hydrateDynamicBlocks($footerBlocks),
        ];
    }

    private function getGlobalSeo()
    {
        return [
            'site_name' => \App\Models\Setting::get('seo', 'site_name', 'Kreatif CMS'),
            'title_separator' => \App\Models\Setting::get('seo', 'title_separator', ' | '),
            'google_analytics_id' => \App\Models\Setting::get('seo', 'google_analytics_id', ''),
            'default_meta_description' => \App\Models\Setting::get('seo', 'meta_description', ''),
        ];
    }

}
