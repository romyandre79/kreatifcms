<?php

namespace Modules\ReusableBlock\Http\Controllers;

use Modules\ReusableBlock\Models\Block;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BlockController extends Controller
{
    public function index()
    {
        $blocks = Block::latest()->get();
        return Inertia::render('Blocks/Index', [
            'blocks' => $blocks
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string',
        ]);

        $validated['data'] = [];

        $block = Block::create($validated);

        return redirect()->route('blocks.edit', $block->id)->with('success', 'Block created successfully.');
    }

    public function edit(Block $block)
    {
        return Inertia::render('Blocks/Builder', [
            'block' => $block
        ]);
    }

    public function update(Request $request, Block $block)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'data' => 'nullable|array',
        ]);

        if ($request->has('data')) {
            $validated['data'] = $request->input('data') ?: [];
        }

        $block->update($validated);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Block saved successfully', 'block' => $block]);
        }

        return redirect()->back()->with('success', 'Block updated successfully.');
    }

    public function destroy(Block $block)
    {
        $block->delete();
        return redirect()->route('blocks.index')->with('success', 'Block deleted successfully.');
    }
}
