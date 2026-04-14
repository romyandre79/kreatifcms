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
        $query = Page::where('slug', $slug);
        
        // If not logged in, only show published pages
        if (!auth()->check()) {
            $query->where('is_published', true);
        }
        
        $page = $query->firstOrFail();
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
            'layout' => array_merge($this->getPageLayout($page, $schemaService), [
                'seo' => $this->getGlobalSeo()
            ])
        ]);
    }

    public function home()
    {
        $homeSlug = \App\Models\Setting::get('general', 'home_page_slug', 'welcome');
        $query = Page::where('slug', $homeSlug);

        // If not logged in, only show published home page
        if (!auth()->check()) {
            $query->where('is_published', true);
        }

        $page = $query->first();

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
                'layout' => array_merge($this->getPageLayout($page, $schemaService), [
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

    private function getPageLayout($page, $schemaService = null)
    {
        if (!$schemaService) $schemaService = app(\App\Services\SchemaService::class);
        
        $layout = null;
        if ($page->layout_id) {
            $layout = \Modules\Layout\Models\Layout::find($page->layout_id);
            if ($layout && !$this->checkLayoutAccess($layout)) {
                $layout = null; // Revert to default if no access
            }
        }
        
        if (!$layout) {
            $layout = \Modules\Layout\Models\Layout::where('is_default', true)->first();
            if ($layout && !$this->checkLayoutAccess($layout)) {
                $layout = null;
            }
        }

        if (!$layout) {
            $layout = \Modules\Layout\Models\Layout::first();
        }

        if (!$layout) {
            return ['header' => [], 'footer' => [], 'theme' => []];
        }

        return [
            'id' => $layout->id,
            'header' => $schemaService->hydrateDynamicBlocks($layout->header_blocks ?: []),
            'footer' => $schemaService->hydrateDynamicBlocks($layout->footer_blocks ?: []),
            'theme' => $layout->theme_data ?: []
        ];
    }

    private function checkLayoutAccess($layout)
    {
        if ($layout->access_type === 'general') return true;
        
        if (!auth()->check()) return false;

        if ($layout->access_type === 'authenticated') return true;

        if ($layout->access_type === 'role') {
            $user = auth()->user();
            if (!$user->role) return false;
            
            $allowedRoles = $layout->roles ?: [];
            return in_array($user->role->name, $allowedRoles);
        }

        return true;
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
