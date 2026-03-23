<?php

namespace App\Http\Controllers;

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

        $headerBlocks = $header ? json_decode($header->value, true) : [];
        $footerBlocks = $footer ? json_decode($footer->value, true) : [];

        return Inertia::render('Layout/Editor', [
            'headerBlocks' => $schemaService->hydrateDynamicBlocks($headerBlocks),
            'footerBlocks' => $schemaService->hydrateDynamicBlocks($footerBlocks),
            'reusableBlocks' => Block::all()->map(function($rb) use ($schemaService) {
                if (isset($rb->data) && is_array($rb->data)) {
                    $rb->data = $schemaService->hydrateDynamicBlocks($rb->data);
                }
                return $rb;
            }),
            'contentTypes' => \App\Models\ContentType::with('fields')->get()
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'header' => 'nullable|array',
            'footer' => 'nullable|array',
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

        return redirect()->back()->with('success', 'Global layout updated successfully.');
    }
}
