<?php

namespace App\Http\Controllers;

use App\Models\ContentType;
use App\Services\SchemaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ContentEntryController extends Controller
{
    protected $schemaService;
    protected $connection = 'secondary';

    public function __construct(SchemaService $schemaService)
    {
        $this->schemaService = $schemaService;
    }

    /**
     * Display the data manager dashboard.
     */
    public function dataManager()
    {
        $contentTypes = ContentType::with('fields')->get();

        return \Inertia\Inertia::render('ContentEntries/DataManager', [
            'contentTypes' => $contentTypes,
        ]);
    }

    /**
     * Display a listing of entries for a specific content type.
     */
    public function index(string $contentTypeSlug)
    {
        $contentType = ContentType::with('fields')->where('slug', $contentTypeSlug)->firstOrFail();
        $tableName = $this->schemaService->getTableName($contentType->slug);

        $entries = DB::connection($this->connection)->table($tableName)->get();

        if (request()->routeIs('api.*')) {
            return response()->json($entries);
        }

        return \Inertia\Inertia::render('ContentEntries/Index', [
            'contentType' => $contentType,
            'entries' => $entries,
            'slug' => $contentTypeSlug
        ]);
    }

    public function create(string $contentTypeSlug)
    {
        $contentType = ContentType::with('fields')->where('slug', $contentTypeSlug)->firstOrFail();
        $availableRelationships = $this->getAvailableRelationships($contentType);

        return \Inertia\Inertia::render('ContentEntries/Create', [
            'contentType' => $contentType,
            'slug' => $contentTypeSlug,
            'availableRelationships' => $availableRelationships
        ]);
    }

    /**
     * Store a new entry.
     */
    public function store(Request $request, string $contentTypeSlug)
    {
        $contentType = ContentType::with('fields')->where('slug', $contentTypeSlug)->firstOrFail();
        $tableName = $this->schemaService->getTableName($contentType->slug);

        $rules = [];
        foreach ($contentType->fields as $field) {
            $fieldName = Str::snake($field->name);
            $fieldRule = ($field->required ? 'required' : 'nullable');
            if ($field->is_unique) {
                $fieldRule .= "|unique:secondary.{$tableName},{$fieldName}";
            }
            if ($field->type === 'relation') {
                $fieldRule .= '|integer';
            }
            $rules[$fieldName] = $fieldRule;
        }

        $validated = $request->validate($rules);
        $validated['user_id'] = Auth::id();
        $validated['created_at'] = now();
        $validated['updated_at'] = now();

        $id = DB::connection($this->connection)->table($tableName)->insertGetId($validated);

        \App\Models\AuditLog::create([
            'user_id' => Auth::id(),
            'content_type' => $contentTypeSlug,
            'row_id' => $id,
            'action' => 'created',
            'new_values' => $validated,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        if ($request->routeIs('api.*')) {
            return response()->json(['message' => 'Entry created successfully'], 201);
        }

        return redirect()->route('content-entries.index', $contentTypeSlug);
    }

    public function edit(string $contentTypeSlug, int $id)
    {
        $contentType = ContentType::with('fields')->where('slug', $contentTypeSlug)->firstOrFail();
        $tableName = $this->schemaService->getTableName($contentType->slug);
        $availableRelationships = $this->getAvailableRelationships($contentType);

        $entry = DB::connection($this->connection)->table($tableName)->where('id', $id)->first();

        return \Inertia\Inertia::render('ContentEntries/Edit', [
            'contentType' => $contentType,
            'entry' => $entry,
            'slug' => $contentTypeSlug,
            'availableRelationships' => $availableRelationships
        ]);
    }

    /**
     * Display a specific entry.
     */
    public function show(string $contentTypeSlug, int $id)
    {
        $contentType = ContentType::where('slug', $contentTypeSlug)->firstOrFail();
        $tableName = $this->schemaService->getTableName($contentType->slug);

        $entry = DB::connection($this->connection)->table($tableName)->where('id', $id)->first();

        if (!$entry) {
            return response()->json(['message' => 'Entry not found'], 404);
        }

        return response()->json($entry);
    }

    /**
     * Update an entry.
     */
    public function update(Request $request, string $contentTypeSlug, int $id)
    {
        $contentType = ContentType::with('fields')->where('slug', $contentTypeSlug)->firstOrFail();
        $tableName = $this->schemaService->getTableName($contentType->slug);

        $rules = [];
        foreach ($contentType->fields as $field) {
            $fieldName = Str::snake($field->name);
            $fieldRule = ($field->required ? 'required' : 'nullable');
            if ($field->is_unique) {
                $fieldRule .= "|unique:secondary.{$tableName},{$fieldName},{$id}";
            }
            if ($field->type === 'relation') {
                $fieldRule .= '|integer';
            }
            $rules[$fieldName] = $fieldRule;
        }

        $validated = $request->validate($rules);
        $oldEntry = DB::connection($this->connection)->table($tableName)->where('id', $id)->first();
        
        $validated['user_id'] = Auth::id();
        $validated['updated_at'] = now();

        DB::connection($this->connection)
            ->table($tableName)
            ->where('id', $id)
            ->update($validated);

        \App\Models\AuditLog::create([
            'user_id' => Auth::id(),
            'content_type' => $contentTypeSlug,
            'row_id' => $id,
            'action' => 'updated',
            'old_values' => (array)$oldEntry,
            'new_values' => $validated,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        if ($request->routeIs('api.*')) {
            return response()->json(['message' => 'Entry updated successfully']);
        }

        return redirect()->route('content-entries.index', $contentTypeSlug);
    }

    /**
     * Delete an entry.
     */
    public function destroy(string $contentTypeSlug, int $id)
    {
        $contentType = ContentType::with('fields')->where('slug', $contentTypeSlug)->firstOrFail();
        $tableName = $this->schemaService->getTableName($contentType->slug);

        // Check Relationship Restraints (Restrict)
        // Find other content types that have a relation field pointing to this one
        $dependents = \App\Models\ContentField::where('type', 'relation')
            ->whereJsonContains('options->target_id', (string)$contentType->id)
            ->get();

        foreach ($dependents as $field) {
            $dependentCt = $field->contentType;
            $dependentTable = $this->schemaService->getTableName($dependentCt->slug);
            $foreignKey = Str::snake($field->name);
            
            $count = DB::connection($this->connection)->table($dependentTable)->where($foreignKey, $id)->count();
            
            if ($count > 0) {
                $onDelete = $field->options['on_delete'] ?? 'restrict';
                if ($onDelete === 'restrict') {
                    $message = "Cannot delete because there are linked records in '{$dependentCt->name}'";
                    if (request()->routeIs('api.*') || !request()->hasSession()) {
                        return response()->json(['error' => $message], 422);
                    }
                    return back()->with('error', $message);
                } else if ($onDelete === 'cascade') {
                    DB::connection($this->connection)->table($dependentTable)->where($foreignKey, $id)->delete();
                }
            }
        }

        $oldEntry = DB::connection($this->connection)->table($tableName)->where('id', $id)->first();

        DB::connection($this->connection)
            ->table($tableName)
            ->where('id', $id)
            ->delete();

        \App\Models\AuditLog::create([
            'user_id' => Auth::id(),
            'content_type' => $contentTypeSlug,
            'row_id' => $id,
            'action' => 'deleted',
            'old_values' => (array)$oldEntry,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        if (request()->routeIs('api.*')) {
            return response()->noContent();
        }

        return redirect()->route('content-entries.index', $contentTypeSlug);
    }

    protected function getAvailableRelationships($contentType)
    {
        $available = [];
        foreach ($contentType->fields as $field) {
            if ($field->type === 'relation' && isset($field->options['target_id'])) {
                $targetCt = ContentType::with('fields')->find($field->options['target_id']);
                if ($targetCt) {
                    $targetTable = $this->schemaService->getTableName($targetCt->slug);
                    
                    // Use configured display_field or fallback to heuristic
                    $displayField = $field->options['display_field'] ?? null;
                    
                    if (!$displayField) {
                        $textFields = $targetCt->fields->where('type', 'text')->pluck('name')->map(fn($n) => Str::snake($n))->toArray();
                        if (in_array('name', $textFields)) $displayField = 'name';
                        elseif (in_array('title', $textFields)) $displayField = 'title';
                        elseif (!empty($textFields)) $displayField = $textFields[0];
                        else $displayField = 'id';
                    }

                    $available[Str::snake($field->name)] = DB::connection($this->connection)
                        ->table($targetTable)
                        ->select(['id', $displayField . ' as label'])
                        ->get();
                }
            }
        }
        return $available;
    }

    /**
     * Get history for a specific entry.
     */
    public function history(string $contentTypeSlug, int $id)
    {
        $logs = \App\Models\AuditLog::with('user')
            ->where('content_type', $contentTypeSlug)
            ->where('row_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($logs);
    }
}
