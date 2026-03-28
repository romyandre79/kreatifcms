<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Permission;
use Modules\ContentType\Models\ContentType;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Nwidart\Modules\Facades\Module;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $roles = Role::withCount('users')->get();

        return Inertia::render('Roles/Index', [
            'roles' => $roles
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $name = $request->input('name', 'New Role ' . Str::random(4));

        $role = Role::create([
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => $request->input('description', ''),
        ]);

        return redirect()->route('roles.edit', $role->id)->with('success', 'Role created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Role $role)
    {
        return redirect()->route('roles.edit', $role->id);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Role $role)
    {
        $role->load(['permissions'])->loadCount('users');
        $contentTypes = [];
        if (class_exists('Modules\ContentType\Models\ContentType') && Module::isEnabled('ContentType')) {
            $contentTypes = ContentType::all();
        }
        
        $modules = Module::allEnabled();
        $plugins = [];
        foreach ($modules as $module) {
            $plugins[] = [
                'name' => $module->getName(),
                'alias' => $module->getLowerName(),
            ];
        }

        return Inertia::render('Roles/Edit', [
            'role' => $role,
            'contentTypes' => $contentTypes,
            'plugins' => $plugins
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'permissions' => 'required|array',
        ]);

        DB::transaction(function () use ($role, $validated) {
            $role->update([
                'name' => $validated['name'],
                'description' => $validated['description'],
            ]);

            // Sync permissions
            $role->permissions()->delete();
            foreach ($validated['permissions'] as $perm) {
                if ($perm['enabled']) {
                    $role->permissions()->create([
                        'name' => $perm['name'],
                        'content_type' => $perm['content_type'] ?? null,
                        'action' => $perm['action'],
                        'enabled' => true,
                    ]);
                }
            }
        });

        return redirect()->back()->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        if ($role->slug === 'super-admin') {
            return redirect()->back()->with('error', 'Super Admin role cannot be deleted.');
        }

        $role->delete();

        return redirect()->route('roles.index')->with('success', 'Role deleted successfully.');
    }
}
