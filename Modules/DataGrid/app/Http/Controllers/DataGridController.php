<?php

namespace Modules\DataGrid\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DataGridController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $dataGrids = DataGrid::with('contentType')->get();

        return \Inertia\Inertia::render('DataGrid::DataGrids/Index', [
            'dataGrids' => $dataGrids,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $contentTypes = \Modules\ContentType\Models\ContentType::with('fields')->get();
        $roles = \App\Models\Role::all();

        return \Inertia\Inertia::render('DataGrid::DataGrids/Editor', [
            'contentTypes' => $contentTypes,
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request) 
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:data_grids',
            'content_type_id' => 'required|exists:content_types,id',
            'settings' => 'required|array',
            'buttons' => 'nullable|array',
        ]);

        DataGrid::create($validated);

        return redirect()->route('datagrids.index')->with('success', 'DataGrid created successfully');
    }

    /**
     * Show the specified resource.
     */
    public function show($id)
    {
        $dataGrid = DataGrid::with('contentType.fields')->findOrFail($id);
        
        return \Inertia\Inertia::render('DataGrid::DataGrids/Show', [
            'dataGrid' => $dataGrid,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $dataGrid = DataGrid::findOrFail($id);
        $contentTypes = \Modules\ContentType\Models\ContentType::with('fields')->get();
        $roles = \App\Models\Role::all();

        return \Inertia\Inertia::render('DataGrid::DataGrids/Editor', [
            'dataGrid' => $dataGrid,
            'contentTypes' => $contentTypes,
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id) 
    {
        $dataGrid = DataGrid::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:data_grids,slug,'.$id,
            'content_type_id' => 'required|exists:content_types,id',
            'settings' => 'required|array',
            'buttons' => 'nullable|array',
        ]);

        $dataGrid->update($validated);

        return redirect()->route('datagrids.index')->with('success', 'DataGrid updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id) 
    {
        $dataGrid = DataGrid::findOrFail($id);
        $dataGrid->delete();

        return redirect()->route('datagrids.index')->with('success', 'DataGrid deleted successfully');
    }
}

