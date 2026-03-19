<?php

namespace App\Http\Controllers;

use App\Models\Page;
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
        return Inertia::render('Pages/Builder', [
            'page' => $page,
            'reusableBlocks' => \App\Models\Block::all()
        ]);
    }

    public function update(Request $request, Page $page)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|max:255|unique:pages,slug,' . $page->id,
            'blocks' => 'nullable|array',
            'is_published' => 'boolean',
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
