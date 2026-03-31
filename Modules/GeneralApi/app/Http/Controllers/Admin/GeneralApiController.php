<?php

namespace Modules\GeneralApi\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\GeneralApi\Models\GeneralApi;
use Inertia\Inertia;

class GeneralApiController extends Controller
{
    public function index()
    {
        $apis = GeneralApi::latest()->get();
        return Inertia::render('GeneralApi/Admin/Index', [
            'apis' => $apis
        ]);
    }

    public function create()
    {
        return Inertia::render('GeneralApi/Admin/Edit', [
            'api' => new GeneralApi([
                'type' => 'bridge',
                'method' => 'GET',
                'target_method' => 'GET',
                'is_active' => true,
            ])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:general_apis,slug',
            'type' => 'required|in:bridge,custom',
            'method' => 'required|string',
            'target_url' => 'nullable|url',
            'target_method' => 'required|string',
            'headers' => 'nullable|array',
            'payload_mapping' => 'nullable|array',
            'php_code' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        GeneralApi::create($validated);

        return redirect()->route('admin.general-api.index')->with('message', 'API Endpoint created successfully.');
    }

    public function edit(GeneralApi $generalApi)
    {
        return Inertia::render('GeneralApi/Admin/Edit', [
            'api' => $generalApi
        ]);
    }

    public function update(Request $request, GeneralApi $generalApi)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:general_apis,slug,' . $generalApi->id,
            'type' => 'required|in:bridge,custom',
            'method' => 'required|string',
            'target_url' => 'nullable|url',
            'target_method' => 'required|string',
            'headers' => 'nullable|array',
            'payload_mapping' => 'nullable|array',
            'php_code' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $generalApi->update($validated);

        return redirect()->route('admin.general-api.index')->with('message', 'API Endpoint updated successfully.');
    }

    public function destroy(GeneralApi $generalApi)
    {
        $generalApi->delete();
        return redirect()->back()->with('message', 'API Endpoint deleted successfully.');
    }
}
