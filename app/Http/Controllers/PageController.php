<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Services\SchemaService;
use Modules\ReusableBlock\Models\Block;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PageController extends Controller
{
    public function index()
    {
        $pages = Page::latest()->get();
        return Inertia::render('Pages/Index', [
            'pages' => $pages
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

        Page::create($validated);

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
            'contentTypes' => \App\Models\ContentType::with('fields')->get()
        ]);
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
        ]);

        if (isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['slug']);
        }

        // If blocks are passed, update them; otherwise, keep existing if not explicitly null (unless expected)
        if ($request->has('blocks')) {
            $validated['blocks'] = $request->input('blocks') ?: [];
        }

        $page->update($validated);

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
}
