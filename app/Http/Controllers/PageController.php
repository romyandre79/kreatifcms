<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Services\SchemaService;
use App\Services\PermissionService;
use Modules\ReusableBlock\Models\Block;
use Modules\Layout\Models\Layout;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PageController extends Controller
{
    public function index()
    {
        $pages = Page::latest()->get();
        return Inertia::render('Pages/Index', [
            'pages' => $pages,
            'homePageSlug' => \App\Models\Setting::get('general', 'home_page_slug', 'welcome')
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:pages,slug',
        ]);

        $validated['slug'] = Str::slug($validated['slug']);
        $validated['blocks'] = [];
        $validated['is_published'] = false;

        $page = Page::create($validated);

        // Grant permissions to Super Admin
        $permissionService = app(PermissionService::class);
        $permissionService->grantSuperAdminPermissions($page->slug, 'Pages');

        return redirect()->route('pages.index')->with('success', 'Page created successfully.');
    }

    public function edit(Page $page)
    {
        $schemaService = app(SchemaService::class);
        $page->blocks = $schemaService->hydrateDynamicBlocks($page->blocks ?: []);

        return Inertia::render('Pages/Builder', [
            'page' => $page,
            'reusableBlocks' => Block::all()->map(function($rb) use ($schemaService) {
                if (isset($rb->data) && is_array($rb->data)) {
                    $rb->data = $schemaService->hydrateDynamicBlocks($rb->data);
                }
                return $rb;
            }),
            'contentTypes' => (class_exists('Modules\ContentType\Models\ContentType') && \Nwidart\Modules\Facades\Module::isEnabled('ContentType'))
                ? \Modules\ContentType\Models\ContentType::with('fields')->get()
                : [],
            'layout' => $this->getPageLayout($page, $schemaService),
            'layouts' => Layout::select('id', 'name', 'is_default')->get()
        ]);
    }

    private function getPageLayout($page, $schemaService)
    {
        $layout = null;
        if ($page->layout_id) {
            $layout = Layout::find($page->layout_id);
        }
        
        if (!$layout) {
            $layout = Layout::where('is_default', true)->first() ?: Layout::first();
        }
        
        if (!$layout) {
            return ['header' => [], 'footer' => []];
        }

        return [
            'id' => $layout->id,
            'header' => $schemaService->hydrateDynamicBlocks($layout->header_blocks ?: []),
            'footer' => $schemaService->hydrateDynamicBlocks($layout->footer_blocks ?: []),
            'theme' => $layout->theme_data ?: []
        ];
    }

    public function update(Request $request, Page $page)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|max:255|unique:pages,slug,' . $page->id,
            'blocks' => 'nullable|array',
            'is_published' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
            'og_image' => 'nullable|string',
            'layout_id' => 'nullable|exists:layouts,id',
        ]);

        if (isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['slug']);
        }

        // If blocks are passed, update them; otherwise, keep existing if not explicitly null (unless expected)
        if ($request->has('blocks')) {
            $validated['blocks'] = $request->input('blocks') ?: [];
        }

        $page->update($validated);
        
        $schemaService = app(SchemaService::class);
        $page->blocks = $schemaService->hydrateDynamicBlocks($page->blocks ?: []);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Page saved successfully', 'page' => $page]);
        }

        return redirect()->back()->with('success', 'Page updated successfully.');
    }

    public function destroy(Page $page)
    {
        $page->delete();
        return redirect()->route('pages.index')->with('success', 'Page deleted successfully.');
    }

    public function setHome(Page $page)
    {
        if (!$page->is_published) {
            return redirect()->back()->with('error', 'Page must be published to be set as home page.');
        }

        \App\Models\Setting::set('general', 'home_page_slug', $page->slug);
        
        return redirect()->back()->with('success', "Page '{$page->title}' set as home page.");
    }
}
