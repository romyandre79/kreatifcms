<?php

namespace Modules\DataGrid\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\SchemaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Modules\DataGrid\Models\DataGrid;
use Modules\ContentType\Models\ContentType;
use App\Models\Permission;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class DataGridDataController extends Controller
{
    protected $schemaService;
    protected $connection = 'secondary';

    public function __construct(SchemaService $schemaService)
    {
        $this->schemaService = $schemaService;
    }

    public function config(string $slug)
    {
        // For block-only config, this might not be needed, but we keep it for backward compatibility or direct queries.
        $dataGrid = DataGrid::with('contentType.fields')->where('slug', $slug)->firstOrFail();
        
        if (!$this->checkPermission($dataGrid->contentType->slug, 'read')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($dataGrid);
    }

    public function fetchGeneric(string $contentTypeSlug, Request $request)
    {
        $contentType = ContentType::where('slug', $contentTypeSlug)->firstOrFail();
        
        // Authorization Check
        if (!$this->checkPermission($contentType->slug, 'read')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $tableName = $this->schemaService->getTableName($contentType->slug);
        $query = DB::connection($this->connection)->table($tableName);

        // Sorting
        if ($request->has('sort')) {
            $sorts = is_array($request->sort) ? $request->sort : json_decode($request->sort, true);
            if ($sorts) {
                foreach ($sorts as $sort) {
                    $query->orderBy($sort['selector'], $sort['desc'] ? 'desc' : 'asc');
                }
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Filtering
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm, $contentType) {
                foreach ($contentType->fields as $field) {
                    if (in_array($field->type, ['text', 'longtext', 'string'])) {
                        $q->orWhere(Str::snake($field->name), 'LIKE', "%{$searchTerm}%");
                    }
                }
            });
        }

        $perPage = $request->input('perPage', 15);
        $results = $query->paginate($perPage);

        return response()->json($results);
    }

    public function fetch(string $slug, Request $request)
    {
        $dataGrid = DataGrid::where('slug', $slug)->first();
        if ($dataGrid) {
            return $this->fetchGeneric($dataGrid->contentType->slug, $request);
        }
        
        // If it's not a grid slug, maybe it's a content type slug directly?
        return $this->fetchGeneric($slug, $request);
    }


    public function executeAction(string $slug, string $buttonIndex, Request $request)
    {
        $dataGrid = DataGrid::where('slug', $slug)->firstOrFail();
        $button = $dataGrid->buttons[$buttonIndex] ?? null;

        if (!$button) {
            return response()->json(['error' => 'Button not found'], 404);
        }

        // Authorization Check for button
        $actionName = $button['action_id'] ?? null;
        if ($actionName && !$this->checkPermission($dataGrid->contentType->slug, $actionName)) {
            return response()->json(['error' => 'Unauthorized for this action'], 403);
        }

        $entryId = $request->input('id');
        $context = [
            'id' => $entryId,
            'request' => $request->all(),
            'user' => Auth::user(),
            'grid' => $dataGrid
        ];

        if (!empty($button['php'])) {
            return $this->executePhpHook($button['php'], $context);
        }

        return response()->json(['success' => true]);
    }

    protected function checkPermission($contentTypeSlug, $action)
    {
        $user = Auth::user();
        if (!$user) return false;

        // Super admin bypass if needed, but here we check the Permission table
        return Permission::where('role_id', $user->role_id)
            ->where('content_type', $contentTypeSlug)
            ->where('action', $action)
            ->where('enabled', true)
            ->exists();
    }

    private function executePhpHook(?string $code, array &$context)
    {
        if (empty(trim($code))) return response()->json(['success' => true]);

        try {
            $executor = function(&$context, $code) {
                extract($context, EXTR_REFS);
                return eval($code);
            };
            $result = $executor($context, $code);
            
            return response()->json([
                'success' => true,
                'result' => $result
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function exportCsv(string $slug, Request $request)
    {
        $contentType = ContentType::where('slug', $slug)->firstOrFail();
        if (!$this->checkPermission($contentType->slug, 'read')) {
            abort(403);
        }

        $tableName = $this->schemaService->getTableName($contentType->slug);
        $rows = DB::connection($this->connection)->table($tableName)->get();
        
        $columns = json_decode($request->input('columns', '[]'), true);
        if (empty($columns)) {
            $columns = $contentType->fields->map(fn($f) => ['key' => $f->name, 'label' => $f->name])->toArray();
        }

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename={$slug}_export_" . date('Y-m-d') . ".csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use ($rows, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, array_column($columns, 'label'));

            foreach ($rows as $row) {
                $item = [];
                foreach ($columns as $col) {
                    $key = $col['key'];
                    $val = $row->{$key} ?? '';
                    $item[] = is_array($val) ? json_encode($val) : $val;
                }
                fputcsv($file, $item);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportPrint(string $slug, Request $request)
    {
        $contentType = ContentType::where('slug', $slug)->firstOrFail();
        if (!$this->checkPermission($contentType->slug, 'read')) {
            abort(403);
        }

        $tableName = $this->schemaService->getTableName($contentType->slug);
        $rows = DB::connection($this->connection)->table($tableName)->get();
        
        $columns = json_decode($request->input('columns', '[]'), true);
        if (empty($columns)) {
            $columns = $contentType->fields->map(fn($f) => ['key' => $f->name, 'label' => $f->name])->toArray();
        }

        return view('datagrid::print', [
            'title' => $contentType->name,
            'rows' => $rows,
            'columns' => $columns
        ]);
    }
}
