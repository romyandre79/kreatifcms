<?php

namespace Modules\Layout\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\SchemaService;
use Modules\ReusableBlock\Models\Block;
use Modules\Layout\Models\Layout;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LayoutController extends Controller
{
    public function index()
    {
        return Inertia::render('Layout/Index', [
            'layouts' => Layout::all()
        ]);
    }

    public function create()
    {
        return Inertia::render('Layout/Editor', [
            'layout' => new Layout([
                'name' => 'New Layout',
                'header_blocks' => [],
                'footer_blocks' => [],
                'theme_data' => [
                    'primaryColor' => '#4f46e5',
                    'secondaryColor' => '#10b981',
                    'fontFamily' => 'Inter',
                    'fontSize' => '16'
                ],
                'access_type' => 'general',
                'roles' => []
            ]),
            'reusableBlocks' => Block::all(),
            'roles' => \DB::table('roles')->pluck('name'),
            'contentTypes' => (class_exists('Modules\ContentType\Models\ContentType') && \Nwidart\Modules\Facades\Module::isEnabled('ContentType'))
                ? \Modules\ContentType\Models\ContentType::with('fields')->get()
                : []
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'header_blocks' => 'nullable|array',
            'footer_blocks' => 'nullable|array',
            'theme_data' => 'nullable|array',
            'access_type' => 'required|in:general,authenticated,role',
            'roles' => 'nullable|array',
            'is_default' => 'boolean'
        ]);

        if ($validated['is_default'] ?? false) {
            Layout::where('is_default', true)->update(['is_default' => false]);
        }

        $layout = Layout::create([
            'name' => $validated['name'],
            'header_blocks' => $validated['header_blocks'] ?? [],
            'footer_blocks' => $validated['footer_blocks'] ?? [],
            'theme_data' => $validated['theme_data'] ?? [],
            'access_type' => $validated['access_type'],
            'roles' => $validated['roles'] ?? [],
            'is_default' => $validated['is_default'] ?? false,
        ]);

        return redirect()->route('layouts.index')->with('success', 'Layout created successfully.');
    }

    public function edit(Layout $layout)
    {
        $schemaService = app(SchemaService::class);
        
        return Inertia::render('Layout/Editor', [
            'layout' => $layout,
            'headerBlocks' => $schemaService->hydrateDynamicBlocks($layout->header_blocks ?? []),
            'footerBlocks' => $schemaService->hydrateDynamicBlocks($layout->footer_blocks ?? []),
            'themeData' => $layout->theme_data ?? [],
            'reusableBlocks' => Block::all()->map(function($rb) use ($schemaService) {
                if (isset($rb->data) && is_array($rb->data)) {
                    $rb->data = $schemaService->hydrateDynamicBlocks($rb->data);
                }
                return $rb;
            }),
            'roles' => \DB::table('roles')->pluck('name'),
            'contentTypes' => (class_exists('Modules\ContentType\Models\ContentType') && \Nwidart\Modules\Facades\Module::isEnabled('ContentType'))
                ? \Modules\ContentType\Models\ContentType::with('fields')->get()
                : []
        ]);
    }

    public function update(Request $request, Layout $layout)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'header_blocks' => 'nullable|array',
            'footer_blocks' => 'nullable|array',
            'theme_data' => 'nullable|array',
            'access_type' => 'required|in:general,authenticated,role',
            'roles' => 'nullable|array',
            'is_default' => 'boolean'
        ]);

        if ($validated['is_default'] ?? false) {
            Layout::where('is_default', true)->where('id', '!=', $layout->id)->update(['is_default' => false]);
        }

        $layout->update([
            'name' => $validated['name'],
            'header_blocks' => $validated['header_blocks'] ?? [],
            'footer_blocks' => $validated['footer_blocks'] ?? [],
            'theme_data' => $validated['theme_data'] ?? [],
            'access_type' => $validated['access_type'],
            'roles' => $validated['roles'] ?? [],
            'is_default' => $validated['is_default'] ?? false,
        ]);

        return redirect()->back()->with('success', 'Layout updated successfully.');
    }

    public function destroy(Layout $layout)
    {
        if ($layout->is_default) {
            return redirect()->back()->with('error', 'Cannot delete the default layout.');
        }

        $layout->delete();
        return redirect()->route('layouts.index')->with('success', 'Layout deleted successfully.');
    }
}
