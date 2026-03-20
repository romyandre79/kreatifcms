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
        
        return Inertia::render('Frontend/Page', [
            'page' => $page,
            'reusableBlocks' => \App\Models\Block::all(),
            'layout' => $this->getGlobalLayout()
        ]);
    }

    public function home()
    {
        $page = Page::where('slug', 'welcome')->where('is_published', true)->first();

        if ($page) {
            return Inertia::render('Frontend/Page', [
                'page' => $page,
                'reusableBlocks' => \App\Models\Block::all(),
                'layout' => $this->getGlobalLayout()
            ]);
        }

        return Inertia::render('Welcome', [
            'canLogin' => \Illuminate\Support\Facades\Route::has('login'),
            'canRegister' => \Illuminate\Support\Facades\Route::has('register'),
            'laravelVersion' => \Illuminate\Foundation\Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    private function getGlobalLayout()
    {
        $header = \App\Models\Setting::where('module', 'layout')->where('key', 'header')->first();
        $footer = \App\Models\Setting::where('module', 'layout')->where('key', 'footer')->first();

        return [
            'header' => $header ? json_decode($header->value, true) : [],
            'footer' => $footer ? json_decode($footer->value, true) : [],
        ];
    }
}
