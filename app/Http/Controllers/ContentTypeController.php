<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ContentType;
use App\Services\SchemaService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ContentTypeController extends Controller
{
    protected $schemaService;

    public function __construct(SchemaService $schemaService)
    {
        $this->schemaService = $schemaService;
    }

    public function index(Request $request)
    {
        $contentTypes = ContentType::with('fields')->get();

        if ($request->routeIs('api.*')) {
            return response()->json($contentTypes);
        }

        return \Inertia\Inertia::render('ContentTypes/Index', [
            'contentTypes' => $contentTypes
        ]);
    }

    public function create()
    {
        return \Inertia\Inertia::render('ContentTypes/Create', [
            'allContentTypes' => ContentType::with('fields')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'fields' => 'required|array|min:1',
            'fields.*.name' => 'required|string|max:255',
            'fields.*.type' => 'required|string|in:text,longtext,integer,boolean,date,json,relation',
            'fields.*.required' => 'boolean',
            'fields.*.options' => 'nullable|array',
        ]);

        $contentType = ContentType::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'type' => $request->input('type', 'collection'),
        ]);

        foreach ($validated['fields'] as $field) {
            $contentType->fields()->create([
                'name' => $field['name'],
                'type' => $field['type'],
                'required' => $field['required'] ?? false,
                'description' => $field['description'] ?? null,
                'options' => $field['options'] ?? null,
            ]);
        }

        // Dynamically create the table
        $this->schemaService->createTable($contentType);

        if ($request->routeIs('api.*')) {
            return response()->json($contentType->load('fields'), 201);
        }

        return redirect()->route('content-types.index');
    }

    public function edit(ContentType $contentType)
    {
        return \Inertia\Inertia::render('ContentTypes/Edit', [
            'contentType' => $contentType->load('fields'),
            'allContentTypes' => ContentType::with('fields')->get()
        ]);
    }

    public function update(Request $request, ContentType $contentType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'fields' => 'required|array|min:1',
            'fields.*.id' => 'nullable', // Use this to distinguish existing vs new
            'fields.*.isNew' => 'nullable|boolean',
            'fields.*.name' => 'required|string|max:255',
            'fields.*.type' => 'required|string|in:text,longtext,integer,boolean,date,json,relation',
            'fields.*.required' => 'boolean',
            'fields.*.options' => 'nullable|array',
        ]);

        $contentType->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'type' => $request->input('type', $contentType->type),
        ]);

        foreach ($validated['fields'] as $fieldData) {
            if (isset($fieldData['isNew']) && $fieldData['isNew']) {
                $contentType->fields()->create([
                    'name' => $fieldData['name'],
                    'type' => $fieldData['type'],
                    'required' => $fieldData['required'] ?? false,
                    'options' => $fieldData['options'] ?? null,
                ]);
            } else {
                // Allow updating 'required' and 'description'
                // Also allow 'type' update specifically for text -> longtext
                $field = $contentType->fields()->find($fieldData['id']);
                if ($field) {
                    $newType = $fieldData['type'];
                    $canUpdateType = ($field->type === 'text' && $newType === 'longtext');
                    
                    $field->update([
                        'type' => $canUpdateType ? $newType : $field->type,
                        'required' => $fieldData['required'] ?? false,
                        'description' => $fieldData['description'] ?? null,
                        'options' => $fieldData['options'] ?? null,
                    ]);
                }
            }
        }

        // Sync schema (add new columns)
        $this->schemaService->updateSchema($contentType->load('fields'));

        if ($request->routeIs('api.*')) {
            return response()->json($contentType->load('fields'));
        }

        return redirect()->route('content-types.index');
    }

    public function show(ContentType $contentType)
    {
        return $contentType->load('fields');
    }

    public function destroy(Request $request, ContentType $contentType)
    {
        $this->schemaService->dropTable($contentType->slug);
        $contentType->delete();

        if ($request->routeIs('api.*')) {
            return response()->noContent();
        }

        return redirect()->route('content-types.index');
    }
}
