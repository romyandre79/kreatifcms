<?php

namespace App\Http\Controllers;

use App\Models\SidebarMenu;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SidebarMenuController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $menus = SidebarMenu::with('children')
            ->whereNull('parent_id')
            ->orderBy('order')
            ->get();

        $allMenus = SidebarMenu::orderBy('order')->get();

        return Inertia::render('SidebarMenus/Index', [
            'menus' => $menus,
            'allMenus' => $allMenus,
            'parents' => SidebarMenu::whereNull('parent_id')->orderBy('order')->get()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if ($request->has('parent_id') && ($request->input('parent_id') === '' || $request->input('parent_id') === 'null')) {
            $request->merge(['parent_id' => null]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'route_name' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:255',
            'parent_id' => 'nullable|exists:sidebar_menus,id',
            'permission_required' => 'nullable|string|max:255',
            'plugin_alias' => 'nullable|string|max:255',
            'order' => 'required|integer',
            'is_active' => 'required|boolean',
        ]);

        SidebarMenu::create($validated);

        return redirect()->route('sidebar-menus.index')->with('success', 'Menu item created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SidebarMenu $sidebarMenu)
    {
        if ($request->has('parent_id') && ($request->input('parent_id') === '' || $request->input('parent_id') === 'null')) {
            $request->merge(['parent_id' => null]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'route_name' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:255',
            'parent_id' => 'nullable|exists:sidebar_menus,id',
            'permission_required' => 'nullable|string|max:255',
            'plugin_alias' => 'nullable|string|max:255',
            'order' => 'required|integer',
            'is_active' => 'required|boolean',
        ]);

        // Prevent setting itself as parent
        if ($validated['parent_id'] == $sidebarMenu->id) {
            $validated['parent_id'] = null;
        }

        $validated['order'] = (int)$validated['order'];

        $sidebarMenu->update($validated);

        return redirect()->route('sidebar-menus.index')->with('success', 'Menu item updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SidebarMenu $sidebarMenu)
    {
        // Re-assign children to have null parent_id
        SidebarMenu::where('parent_id', $sidebarMenu->id)->update(['parent_id' => null]);

        $sidebarMenu->delete();

        return redirect()->route('sidebar-menus.index')->with('success', 'Menu item deleted successfully.');
    }
}
