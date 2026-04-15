<?php

namespace Modules\ContentType\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\ContentType\Models\ContentType;
use App\Services\SchemaService;
use App\Services\PermissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ContentTypeController extends Controller
{
    protected $schemaService;
    protected $permissionService;

    public function __construct(SchemaService $schemaService, PermissionService $permissionService)
    {
        $this->schemaService = $schemaService;
        $this->permissionService = $permissionService;
    }

    public function index(Request $request)
    {
        $contentTypes = ContentType::with('fields')->get();

        if ($request->routeIs('api.*')) {
            return response()->json($contentTypes);
        }

        return \Inertia\Inertia::render('ContentType::ContentTypes/Index', [
            'contentTypes' => $contentTypes
        ]);
    }

    public function create()
    {
        return \Inertia\Inertia::render('ContentType::ContentTypes/Create', [
            'allContentTypes' => ContentType::with('fields')->get(),
            'isPhpEventHooksEnabled' => class_exists('\Nwidart\Modules\Facades\Module') && (\Nwidart\Modules\Facades\Module::find('PhpEventHooks')?->isEnabled() ?? false)
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'events' => 'nullable|array',
            'events.onSelect' => 'nullable|string',
            'events.onInsert' => 'nullable|string',
            'events.onUpdate' => 'nullable|string',
            'events.onDelete' => 'nullable|string',
            'fields' => 'required|array|min:1',
            'fields.*.name' => 'required|string|max:255',
            'fields.*.type' => 'required|string|in:text,longtext,integer,boolean,date,json,relation,image,file',
            'fields.*.required' => 'boolean',
            'fields.*.is_unique' => 'boolean',
            'fields.*.options' => 'nullable|array',
        ]);

        $contentType = ContentType::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'type' => $request->input('type', 'collection'),
            'events' => $validated['events'] ?? null,
        ]);

        foreach ($validated['fields'] as $index => $field) {
            $contentType->fields()->create([
                'name' => $field['name'],
                'type' => $field['type'],
                'required' => $field['required'] ?? false,
                'is_unique' => $field['is_unique'] ?? false,
                'is_translatable' => $field['is_translatable'] ?? false,
                'description' => $field['description'] ?? null,
                'options' => $field['options'] ?? null,
                'sort_order' => $index,
            ]);
        }

        // Dynamically create the table
        $this->schemaService->createTable($contentType);

        // Grant permissions to Super Admin
        $groupName = ($contentType->type === 'collection' || !$contentType->type) ? 'Collection Types' : 'Single Types';
        $this->permissionService->grantSuperAdminPermissions($contentType->slug, $groupName);

        if ($request->routeIs('api.*')) {
            return response()->json($contentType->load('fields'), 201);
        }

        return redirect()->route('content-types.index');
    }

    public function edit(ContentType $contentType)
    {
        return \Inertia\Inertia::render('ContentType::ContentTypes/Edit', [
            'contentType' => $contentType->load('fields'),
            'allContentTypes' => ContentType::with('fields')->get(),
            'isPhpEventHooksEnabled' => class_exists('\Nwidart\Modules\Facades\Module') && (\Nwidart\Modules\Facades\Module::find('PhpEventHooks')?->isEnabled() ?? false)
        ]);
    }

    public function update(Request $request, ContentType $contentType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'events' => 'nullable|array',
            'events.onSelect' => 'nullable|string',
            'events.onInsert' => 'nullable|string',
            'events.onUpdate' => 'nullable|string',
            'events.onDelete' => 'nullable|string',
            'fields' => 'required|array|min:1',
            'fields.*.id' => 'nullable', // Use this to distinguish existing vs new
            'fields.*.isNew' => 'nullable|boolean',
            'fields.*.name' => 'required|string|max:255',
            'fields.*.type' => 'required|string|in:text,longtext,integer,boolean,date,json,relation,image,file',
            'fields.*.required' => 'boolean',
            'fields.*.is_unique' => 'boolean',
            'fields.*.options' => 'nullable|array',
        ]);

        $contentType->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'type' => $request->input('type', $contentType->type),
            'events' => $validated['events'] ?? null,
        ]);

        foreach ($validated['fields'] as $index => $fieldData) {
            if (isset($fieldData['isNew']) && $fieldData['isNew']) {
                $contentType->fields()->create([
                    'name' => $fieldData['name'],
                    'type' => $fieldData['type'],
                    'required' => $fieldData['required'] ?? false,
                    'is_unique' => $fieldData['is_unique'] ?? false,
                    'is_translatable' => $fieldData['is_translatable'] ?? false,
                    'options' => $fieldData['options'] ?? null,
                    'sort_order' => $index,
                ]);
            } else {
                // Allow updating 'required' and 'description'
                // Also allow 'type' update specifically for text -> longtext
                $field = \Modules\ContentType\Models\ContentField::where('id', $fieldData['id'])
                    ->where('content_type_id', $contentType->id)
                    ->first();
                if ($field) {
                    $newType = $fieldData['type'];
                    $canUpdateType = ($field->type === 'text' && $newType === 'longtext');
                    
                    $field->update([
                        'type' => $canUpdateType ? $newType : $field->type,
                        'required' => $fieldData['required'] ?? false,
                        'is_unique' => $fieldData['is_unique'] ?? false,
                        'is_translatable' => $fieldData['is_translatable'] ?? false,
                        'description' => $fieldData['description'] ?? null,
                        'options' => $fieldData['options'] ?? null,
                        'sort_order' => $index,
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
