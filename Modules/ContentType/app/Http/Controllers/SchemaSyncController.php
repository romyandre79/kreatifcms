<?php

namespace Modules\ContentType\Http\Controllers;

use Modules\ContentType\Models\ContentType;
use App\Services\SchemaService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SchemaSyncController extends Controller
{
    protected $schemaService;

    public function __construct(SchemaService $schemaService)
    {
        $this->schemaService = $schemaService;
    }

    /**
     * Push a content type schema to a remote server.
     */
    public function push(ContentType $contentType)
    {
        $targetUrl = env('CMS_SYNC_TARGET_URL');
        $syncToken = env('CMS_SYNC_TOKEN');

        if (!$targetUrl || !$syncToken) {
            return response()->json(['error' => 'Sync target or token not configured in .env'], 400);
        }

        $payload = [
            'sync_token' => $syncToken,
            'content_type' => [
                'name' => $contentType->name,
                'slug' => $contentType->slug,
                'description' => $contentType->description,
                'type' => $contentType->type,
                'fields' => $contentType->fields->toArray(),
            ]
        ];

        try {
            $response = Http::post($targetUrl . '/api/sync/receive', $payload);

            if ($response->successful()) {
                return response()->json(['message' => 'Schema pushed successfully']);
            }

            return response()->json(['error' => 'Failed to push schema', 'details' => $response->json()], $response->status());
        } catch (\Exception $e) {
            Log::error('Schema sync failed: ' . $e->getMessage());
            return response()->json(['error' => 'Sync request failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Receive and apply a content type schema from a remote server.
     */
    public function receive(Request $request)
    {
        $validated = $request->validate([
            'sync_token' => 'required|string',
            'content_type' => 'required|array',
            'content_type.name' => 'required|string',
            'content_type.slug' => 'required|string',
            'content_type.fields' => 'required|array',
        ]);

        if ($validated['sync_token'] !== env('CMS_SYNC_TOKEN')) {
            return response()->json(['error' => 'Invalid sync token'], 401);
        }

        $data = $validated['content_type'];

        // Find or create the ContentType
        $contentType = ContentType::firstOrNew(['slug' => $data['slug']]);
        $contentType->name = $data['name'];
        $contentType->description = $data['description'] ?? null;
        $contentType->type = $data['type'] ?? 'collection';
        $contentType->save();

        // Sync fields
        $existingFieldIds = [];
        foreach ($data['fields'] as $fieldData) {
            $field = $contentType->fields()->updateOrCreate(
                ['name' => $fieldData['name']],
                [
                    'type' => $fieldData['type'],
                    'required' => $fieldData['required'] ?? false,
                    'description' => $fieldData['description'] ?? null,
                    'options' => $fieldData['options'] ?? null,
                ]
            );
            $existingFieldIds[] = $field->id;
        }

        // Optional: Remove fields not in the incoming payload? 
        // For safety, we'll keep them but log it.
        
        // Update physical schema
        $this->schemaService->updateSchema($contentType->load('fields'));

        return response()->json(['message' => 'Schema updated successfully']);
    }
}
