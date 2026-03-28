<?php

namespace Modules\Layout\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\SchemaService;
use Modules\ReusableBlock\Models\Block;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LayoutController extends Controller
{
    public function index()
    {
        $schemaService = app(SchemaService::class);
        $header = Setting::where('module', 'layout')->where('key', 'header')->first();
        $footer = Setting::where('module', 'layout')->where('key', 'footer')->first();
        $theme = Setting::where('module', 'layout')->where('key', 'theme')->first();

        $headerBlocks = $header ? json_decode($header->value, true) : [];
        $footerBlocks = $footer ? json_decode($footer->value, true) : [];
        $themeData = $theme ? json_decode($theme->value, true) : [
            'primaryColor' => '#4f46e5',
            'secondaryColor' => '#10b981',
            'fontFamily' => 'Inter',
            'fontSize' => '16'
        ];

        return Inertia::render('Layout/Editor', [
            'headerBlocks' => $schemaService->hydrateDynamicBlocks($headerBlocks),
            'footerBlocks' => $schemaService->hydrateDynamicBlocks($footerBlocks),
            'themeData' => $themeData,
            'reusableBlocks' => Block::all()->map(function($rb) use ($schemaService) {
                if (isset($rb->data) && is_array($rb->data)) {
                    $rb->data = $schemaService->hydrateDynamicBlocks($rb->data);
                }
                return $rb;
            }),
            'contentTypes' => (class_exists('Modules\ContentType\Models\ContentType') && \Nwidart\Modules\Facades\Module::isEnabled('ContentType'))
                ? \Modules\ContentType\Models\ContentType::with('fields')->get()
                : []
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'header' => 'nullable|array',
            'footer' => 'nullable|array',
            'theme' => 'nullable|array',
        ]);

        if ($request->has('header')) {
            Setting::updateOrCreate(
                ['module' => 'layout', 'key' => 'header'],
                ['value' => json_encode($request->input('header'))]
            );
        }

        if ($request->has('footer')) {
            Setting::updateOrCreate(
                ['module' => 'layout', 'key' => 'footer'],
                ['value' => json_encode($request->input('footer'))]
            );
        }

        if ($request->has('theme')) {
            Setting::updateOrCreate(
                ['module' => 'layout', 'key' => 'theme'],
                ['value' => json_encode($request->input('theme'))]
            );
        }

        return redirect()->back()->with('success', 'Global layout and theme updated successfully.');
    }
}
