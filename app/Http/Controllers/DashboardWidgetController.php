<?php

namespace App\Http\Controllers;

use App\Models\DashboardWidget;
use App\Models\ContentType;
use App\Services\SchemaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class DashboardWidgetController extends Controller
{
    protected $schemaService;

    public function __construct(SchemaService $schemaService)
    {
        $this->schemaService = $schemaService;
    }

    public function index()
    {
        $widgets = DashboardWidget::where('user_id', Auth::id())
            ->orderBy('order')
            ->get()
            ->map(function ($widget) {
                return $this->getWidgetData($widget);
            });

        return response()->json($widgets);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string',
            'content_type_id' => 'nullable|exists:content_types,id',
            'aggregate_function' => 'nullable|string',
            'aggregate_field' => 'nullable|string',
            'group_by_field' => 'nullable|string',
            'settings' => 'nullable|array',
            'width' => 'nullable|integer|min:1|max:12',
        ]);

        $validated['user_id'] = Auth::id();
        $validated['order'] = DashboardWidget::where('user_id', Auth::id())->count();

        $widget = DashboardWidget::create($validated);

        return response()->json($this->getWidgetData($widget));
    }

    public function update(Request $request, DashboardWidget $widget)
    {
        if ($widget->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'type' => 'nullable|string',
            'content_type_id' => 'nullable|exists:content_types,id',
            'aggregate_function' => 'nullable|string',
            'aggregate_field' => 'nullable|string',
            'group_by_field' => 'nullable|string',
            'settings' => 'nullable|array',
            'order' => 'nullable|integer',
            'width' => 'nullable|integer|min:1|max:12',
        ]);

        $widget->update($validated);

        return response()->json($this->getWidgetData($widget));
    }

    public function destroy(DashboardWidget $widget)
    {
        if ($widget->user_id !== Auth::id()) {
            abort(403);
        }
        
        $widget->delete();
        return response()->noContent();
    }

    protected function getWidgetData($widget)
    {
        $data = null;

        if ($widget->content_type_id) {
            $contentType = ContentType::find($widget->content_type_id);
            if ($contentType) {
                $tableName = $this->schemaService->getTableName($contentType->slug);
                $query = DB::connection('secondary')->table($tableName);

                if ($widget->type === 'stats') {
                    if ($widget->aggregate_function === 'count') {
                        $data = $query->count();
                    } elseif ($widget->aggregate_function && $widget->aggregate_field) {
                        $func = $widget->aggregate_function;
                        $data = $query->$func($widget->aggregate_field);
                    }
                } elseif ($widget->type === 'chart') {
                    if ($widget->group_by_field) {
                        $data = $query->select($widget->group_by_field, DB::raw('count(*) as total'))
                            ->groupBy($widget->group_by_field)
                            ->get();
                    } else {
                        // Default to count by created_at if no group by
                        $data = $query->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as total'))
                            ->groupBy('date')
                            ->orderBy('date')
                            ->get();
                    }
                }
            }
        }

        $widget->data = $data;
        return $widget;
    }
}
