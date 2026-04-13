<?php

namespace Modules\FormBlock\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\ContentType\Models\ContentType;
use Modules\ContentType\Http\Controllers\ContentEntryController;
use App\Services\SchemaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Modules\Captcha\Rules\Captcha;
use Illuminate\Support\Facades\Validator;

class FormController extends Controller
{
    protected $schemaService;

    public function __construct(SchemaService $schemaService)
    {
        $this->schemaService = $schemaService;
    }

    public function submit(Request $request)
    {
        $mode = $request->input('mode', 'static');
        
        if ($mode === 'dynamic') {
            return $this->handleDynamicSubmit($request);
        }

        return $this->handleStaticSubmit($request);
    }

    protected function handleStaticSubmit(Request $request)
    {
        $fields = $request->input('fields', []);
        $data = $request->input('data', []);
        
        // Check if captcha is required
        $hasCaptcha = false;
        foreach ($fields as $field) {
            if (isset($field['type']) && $field['type'] === 'captcha') {
                $hasCaptcha = true;
                break;
            }
        }

        if ($hasCaptcha) {
            $validator = Validator::make($data, [
                'captcha_token' => ['required', new Captcha],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Captcha validation failed.',
                    'errors' => $validator->errors()
                ], 422);
            }
        }

        // Log submission for now
        Log::info('Static Form Submission', [
            'form_name' => $request->input('form_name'),
            'data' => $data
        ]);

        return response()->json([
            'success' => true,
            'message' => $request->input('success_message', 'Thank you for your submission!')
        ]);
    }

    protected function handleDynamicSubmit(Request $request)
    {
        $contentTypeSlug = $request->input('content_type');
        if (!$contentTypeSlug) {
            return response()->json(['success' => false, 'message' => 'No content type specified.'], 422);
        }

        $fields = $request->input('fields', []);
        $dynamicData = $request->input('data', []);

        // Check if captcha is required
        $hasCaptcha = false;
        foreach ($fields as $field) {
            if (isset($field['type']) && $field['type'] === 'captcha') {
                $hasCaptcha = true;
                break;
            }
        }

        if ($hasCaptcha) {
            $validator = Validator::make($dynamicData, [
                'captcha_token' => ['required', new Captcha],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Captcha validation failed.',
                    'errors' => $validator->errors()
                ], 422);
            }
        }

        // Bridge to ContentEntryController@store logic
        // We can manually replicate the store logic to avoid redirect issues and customize the response
        $entryController = app(ContentEntryController::class);
        
        try {
            // We need to wrap the data because ContentEntryController expects fields as top-level request inputs
            $dynamicData = $request->input('data', []);
            $request->merge($dynamicData);
            
            // Execute the store method but catch the response
            // ContentEntryController::store returns a redirect or json response
            $response = $entryController->store($request, $contentTypeSlug);
            
            return response()->json([
                'success' => true,
                'message' => $request->input('success_message', 'Entry created successfully!')
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Dynamic Form Submission Error: ' . $e->getMessage());
            return response()->json([
                'success' => false, 
                'message' => 'There was an error processing your submission.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
