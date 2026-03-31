<?php

namespace Modules\GeneralApi\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Modules\GeneralApi\Models\GeneralApi;
use App\Models\Setting;

class GeneralApiHandlerController extends Controller
{
    /**
     * Entry point for custom API requests.
     */
    public function handle(Request $request, string $slug)
    {
        $api = GeneralApi::where('slug', $slug)->where('is_active', true)->first();

        if (!$api) {
            return response()->json(['error' => 'API Endpoint not found or inactive.'], 404);
        }

        // Check if incoming method matches
        if ($api->method !== 'ANY' && $request->method() !== $api->method) {
            return response()->json(['error' => 'Method not allowed.'], 405);
        }

        try {
            if ($api->type === 'bridge') {
                return $this->handleBridge($request, $api);
            } else {
                return $this->handleCustom($request, $api);
            }
        } catch (\Exception $e) {
            Log::error("GeneralApi Error [{$slug}]: " . $e->getMessage());
            return response()->json(['error' => 'Internal Server Error.', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Handle Bridge Mode (Safe)
     */
    protected function handleBridge(Request $request, GeneralApi $api)
    {
        $client = Http::withHeaders($api->headers ?? []);

        $method = strtoupper($api->target_method ?: $request->method());
        $url = $api->target_url;

        // Build payload from mapping or pass through
        $payload = $request->all();
        if ($api->payload_mapping) {
            $mappedPayload = [];
            foreach ($api->payload_mapping as $target => $source) {
                $mappedPayload[$target] = $request->input($source);
            }
            $payload = $mappedPayload;
        }

        $response = match ($method) {
            'GET' => $client->get($url, $payload),
            'POST' => $client->post($url, $payload),
            'PUT' => $client->put($url, $payload),
            'DELETE' => $client->delete($url, $payload),
            default => $client->get($url, $payload),
        };

        if ($response->failed()) {
            return response()->json([
                'error' => 'Target API request failed.',
                'status' => $response->status(),
                'body' => $response->json() ?: $response->body()
            ], $response->status());
        }

        return response()->json($response->json());
    }

    /**
     * Handle Custom Mode (PHP Script)
     */
    protected function handleCustom(Request $request, GeneralApi $api)
    {
        // Global Safe Mode Check
        $isSafeMode = Setting::get('generalapi', 'safe_mode', false);
        if ($isSafeMode) {
            return response()->json(['error' => 'Custom PHP execution is disabled by global Safe Mode.'], 403);
        }

        $phpCode = $api->php_code;

        // Provide context variables to the script
        $context = [
            'request' => $request,
            'params' => $request->all(),
            'headers' => $request->headers->all(),
        ];

        // Use output buffering to capture any echo/print
        ob_start();
        
        try {
            // This is where eval() happens. 
            // We pass $request and $params into the scope.
            $result = eval('?>' . $phpCode);
            
            $output = ob_get_clean();

            if ($result instanceof \Illuminate\Http\JsonResponse || $result instanceof \Illuminate\Http\Response) {
                return $result;
            }

            if (is_array($result) || is_object($result)) {
                return response()->json($result);
            }

            if ($output) {
                return response($output);
            }

            return response()->json($result);
        } catch (\Throwable $e) {
            ob_end_clean();
            throw $e;
        }
    }
}
