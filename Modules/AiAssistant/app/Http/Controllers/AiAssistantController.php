<?php

namespace Modules\AiAssistant\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\AiAssistant\Services\AiService;
use Modules\AiAssistant\Services\AiPluginService;
use Modules\AiAssistant\Models\AiModel;
use Modules\AiAssistant\Models\AiConversation;
use Modules\AiAssistant\Models\AiMessage;
use App\Models\Page;
use App\Services\PermissionService;
use Modules\AiAssistant\Services\ScraperService;
use Modules\Layout\Models\Layout;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AiAssistantController extends Controller
{
    protected $aiService;
    protected $pluginService;

    public function __construct(AiService $aiService, AiPluginService $pluginService)
    {
        $this->aiService = $aiService;
        $this->pluginService = $pluginService;
    }

    public function settings()
    {
        try {
            $models = AiModel::orderBy('is_default', 'desc')->orderBy('is_active', 'desc')->orderBy('name')->get();
            $stats = $this->aiService->getQuickStats();
            
            $config = [
                'providers' => [
                    ['value' => 'openai', 'label' => 'OpenAI (ChatGPT)'],
                    ['value' => 'gemini', 'label' => 'Google Gemini'],
                    ['value' => 'ollama', 'label' => 'Ollama (Local)'],
                ]
            ];

            return Inertia::render('AiAssistant::Settings', [
                'models' => $models,
                'stats' => $stats,
                'config' => $config
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Error in AiAssistantController@settings: " . $e->getMessage());
            return Inertia::render('AiAssistant::Settings', [
                'models' => [],
                'stats' => ['total_requests' => 0, 'total_tokens' => 0, 'top_models' => []],
                'config' => ['global' => [], 'providers' => []],
                'error' => 'Failed to load settings.'
            ]);
        }
    }

    /**
     * Get models automatically from cache or live API
     */
    protected function getAutoModels($provider)
    {
        $cacheKey = "ai_models_cache_{$provider}";
        
        // Return cached models if available
        if ($cached = \Illuminate\Support\Facades\Cache::get($cacheKey)) {
            return $cached;
        }

        // Hardcoded fallbacks
        $fallbacks = [
            'openai' => [
                ['id' => 'gpt-4o', 'name' => 'GPT-4o (Latest)'],
                ['id' => 'gpt-4o-mini', 'name' => 'GPT-4o Mini'],
            ],
            'gemini' => [
                ['id' => 'gemini-1.5-flash', 'name' => 'Gemini 1.5 Flash'],
                ['id' => 'gemini-1.5-pro', 'name' => 'Gemini 1.5 Pro'],
                ['id' => 'gemini-2.0-flash-exp', 'name' => 'Gemini 2.0 Flash (Exp)'],
            ],
            'ollama' => [
                ['id' => 'llama3.1', 'name' => 'Llama 3.1'],
                ['id' => 'llama3', 'name' => 'Llama 3'],
            ]
        ];

        // Attempt live fetch if we have an API key/base URL
        try {
            $apiKey = match($provider) {
                'openai' => \App\Models\Setting::get('aiassistant', 'openai_api_key'),
                'gemini' => \App\Models\Setting::get('aiassistant', 'gemini_api_key'),
                default => null
            };
            $baseUrl = $provider === 'ollama' ? \App\Models\Setting::get('aiassistant', 'ollama_base_url') : null;

            if ($apiKey || $baseUrl) {
                $liveModels = $this->aiService->listModels($provider, $apiKey, $baseUrl);
                if (!empty($liveModels)) {
                    // Cache for 24 hours
                    \Illuminate\Support\Facades\Cache::put($cacheKey, $liveModels, now()->addDay());
                    return $liveModels;
                }
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("Auto-fetch failed for {$provider}: " . $e->getMessage());
        }

        return $fallbacks[$provider] ?? [];
    }

    public function listModels()
    {
        return response()->json(AiModel::where('is_active', true)->get());
    }

    public function setDefault(AiModel $model)
    {
        // Reset all models to not default
        AiModel::query()->update(['is_default' => false]);
        
        // Set this model as default
        $model->update(['is_default' => true]);

        return redirect()->back()->with('message', "{$model->name} set as system default.");
    }

    public function fetchAvailableModels(Request $request)
    {
        $request->validate([
            'provider' => 'required|string',
            'api_key' => 'nullable|string',
            'base_url' => 'nullable|string',
        ]);

        $models = $this->aiService->listAvailableModels(
            $request->provider,
            $request->api_key,
            $request->base_url
        );

        return response()->json($models);
    }

    public function getHistory()
    {
        $userId = auth()->id();
        \Illuminate\Support\Facades\Log::info("Fetching chat history for User ID: {$userId}");

        $conversation = AiConversation::where('user_id', $userId)
            ->with(['messages' => function($q) {
                $q->orderBy('created_at', 'asc');
            }])
            ->orderBy('updated_at', 'desc')
            ->first();

        if (!$conversation) {
            \Illuminate\Support\Facades\Log::info("No conversation found for User ID: {$userId}");
            return response()->json([
                'conversation_id' => null,
                'messages' => [
                    ['role' => 'assistant', 'content' => 'Hello! I am your AI Assistant. How can I help you manage your CMS today?']
                ]
            ]);
        }

        \Illuminate\Support\Facades\Log::info("Found conversation ID: {$conversation->id} with " . $conversation->messages->count() . " messages.");

        return response()->json([
            'conversation_id' => $conversation->id,
            'messages' => $conversation->messages->map(function($m) {
                return [
                    'role' => $m->role,
                    'content' => $m->content
                ];
            })
        ]);
    }

    public function chat(Request $request)
    {
        $request->validate([
            'messages' => 'required|array',
            'messages.*.role' => 'required|string|in:user,assistant,system',
            'messages.*.content' => 'required|string',
            'model_id' => 'nullable|integer',
            'conversation_id' => 'nullable|integer',
        ]);

        try {
            // Find or create conversation
            $conversationId = $request->conversation_id;
            if (!$conversationId) {
                $conversation = AiConversation::create([
                    'user_id' => auth()->id(),
                    'title' => substr($request->messages[count($request->messages) - 1]['content'], 0, 50),
                    'last_model_id' => $request->model_id
                ]);
                $conversationId = $conversation->id;
            } else {
                $conversation = AiConversation::findOrFail($conversationId);
                // Update last used model and touch to update timestamp
                $conversation->touch();
                if ($request->model_id) {
                    $conversation->update(['last_model_id' => $request->model_id]);
                }
            }

            // Save user message (the LAST one in the array passed by frontend)
            $allMessages = $request->messages;
            $userMsg = end($allMessages);
            AiMessage::create([
                'ai_conversation_id' => $conversationId,
                'role' => 'user',
                'content' => $userMsg['content']
            ]);

            // Get AI Response
            $response = $this->aiService->chat($request->messages, $request->model_id);

            // Save AI message
            AiMessage::create([
                'ai_conversation_id' => $conversationId,
                'role' => 'assistant',
                'content' => $response
            ]);

            return response()->json([
                'content' => $response,
                'conversation_id' => $conversationId
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function storeModel(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'provider' => 'required|string|in:openai,gemini,ollama',
            'model_name' => 'required|string|max:255',
            'api_key' => 'nullable|string',
            'base_url' => 'nullable|string',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
        ]);

        if ($request->is_default) {
            AiModel::query()->update(['is_default' => false]);
        }

        AiModel::create($validated);

        return redirect()->back()->with('message', 'AI Model added successfully.');
    }

    public function updateModel(Request $request, AiModel $model)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'provider' => 'required|string|in:openai,gemini,ollama',
            'model_name' => 'required|string|max:255',
            'api_key' => 'nullable|string',
            'base_url' => 'nullable|string',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
        ]);

        if ($request->is_default) {
            AiModel::where('id', '!=', $model->id)->update(['is_default' => false]);
        }

        $model->update($validated);

        return redirect()->back()->with('message', 'AI Model updated successfully.');
    }

    public function deleteModel(AiModel $model)
    {
        $model->delete();
        return redirect()->back()->with('message', 'AI Model deleted successfully.');
    }

    public function createPlugin(Request $request)
    {
        $request->validate([
            'plugin_name' => 'required|string|regex:/^[a-zA-Z0-9_]+$/',
            'files' => 'required|array',
            'files.*.path' => 'required|string',
            'files.*.content' => 'required|string',
        ]);

        try {
            $this->pluginService->scaffold($request->plugin_name, $request->files);
            
            return response()->json([
                'message' => "Plugin '{$request->plugin_name}' has been created and registered successfully.",
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function storePageFromAi(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'blocks' => 'nullable|array',
            'header_blocks' => 'nullable|array',
            'footer_blocks' => 'nullable|array',
            'theme_data' => 'nullable|array',
            'meta_title' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'layout_id' => 'nullable|exists:layouts,id',
            'layout_name' => 'nullable|string',
            'fonts_to_install' => 'nullable|array' // NEW: Bulk font installation
        ]);

        // 0. Handle Bulk Font Installation via ScraperService
        $font_results = [];
        if (!empty($request->fonts_to_install)) {
            $scraper = app(ScraperService::class);
            foreach ($request->fonts_to_install as $font) {
                if (!empty($font['url']) && !empty($font['font_name'])) {
                    $res = $scraper->downloadFont($font['url'], $font['font_name']);
                    $font_results[] = [
                        'name' => $font['font_name'],
                        'success' => $res ? true : false,
                        'file' => $res
                    ];
                }
            }
        }

        $title = $request->title;
        
        // 1. Handle Layout Creation/Selection
        $layoutId = $request->layout_id; // Priority 1: Direct ID
        
        // Priority 2: Searching by Name if no ID provided
        if (!$layoutId && $request->filled('layout_name')) {
            $existingLayout = Layout::where('name', 'like', '%' . $request->layout_name . '%')->first();
            if ($existingLayout) {
                $layoutId = $existingLayout->id;
            }
        }

        // Priority 3: Create NEW Layout only if design data is provided and no existing layout was targeted
        if (!$layoutId && ($request->filled('header_blocks') || $request->filled('footer_blocks') || $request->filled('theme_data'))) {
            $layout = Layout::create([
                'name' => 'Layout for ' . $title,
                'header_blocks' => $request->header_blocks ?? [],
                'footer_blocks' => $request->footer_blocks ?? [],
                'theme_data' => $request->theme_data ?? [],
                'access_type' => 'general',
                'roles' => [],
                'is_default' => false
            ]);
            $layoutId = $layout->id;
        }

        // 2. Handle Page Creation
        $slug = Str::slug($title);
        $count = Page::where('slug', 'like', $slug . '%')->count();
        if ($count > 0) {
            $slug .= '-' . ($count + 1);
        }

        $page = Page::create([
            'title' => $title,
            'slug' => $slug,
            'blocks' => $request->blocks ?? [],
            'meta_title' => $request->meta_title ?? $title,
            'meta_description' => $request->meta_description ?? '',
            'layout_id' => $layoutId, // Link to the new layout
            'is_published' => false,
        ]);

        // Grant permissions
        $permissionService = app(PermissionService::class);
        $permissionService->grantSuperAdminPermissions($page->slug, 'Pages');

        // 3. Generate CSS file for the layout if it was created
        if ($layoutId) {
            $this->generateLayoutCss(Layout::find($layoutId));
        }

        return response()->json([
            'success' => true,
            'message' => $layoutId 
                ? "Unified design (Page + Layout) '{$title}' has been created successfully!"
                : "Page '{$title}' has been created successfully!",
            'page_id' => $page->id,
            'layout_id' => $layoutId,
            'url' => route('pages.edit', $page->id),
            'layout_url' => $layoutId ? route('layouts.edit', $layoutId) : null,
            'font_results' => $font_results // NEW: Detailed font status
        ]);
    }

    private function generateLayoutCss($layout)
    {
        $theme = $layout->theme_data ?? [];
        $css = "/* Layout CSS: {$layout->name} (AI Generated) */\n\n";

        // Inject font-faces for ALL custom fonts available
        $customFontsPath = public_path('fonts/custom');
        if (file_exists($customFontsPath)) {
            $files = scandir($customFontsPath);
            foreach ($files as $file) {
                if ($file === '.' || $file === '..') continue;
                $ext = pathinfo($file, PATHINFO_EXTENSION);
                if (in_array($ext, ['ttf', 'woff', 'woff2', 'otf'])) {
                    $fontSlug = pathinfo($file, PATHINFO_FILENAME);
                    $fontName = Str::title(str_replace(['-', '_'], ' ', $fontSlug));
                    $format = $ext === 'woff2' ? 'woff2' : ($ext === 'woff' ? 'woff' : 'truetype');
                    $url = "/fonts/custom/{$file}";
                    
                    $css .= "@font-face {\n";
                    $css .= "    font-family: '{$fontName}';\n";
                    $css .= "    src: url('{$url}') format('{$format}');\n";
                    $css .= "    font-weight: normal;\n";
                    $css .= "    font-style: normal;\n";
                    $css .= "    font-display: swap;\n";
                    $css .= "}\n\n";
                }
            }
        }

        $fontFamily = $theme['fontFamily'] ?? 'Inter';
        $fontSize = $theme['fontSize'] ?? '16';
        $primary = $theme['primaryColor'] ?? '#4f46e5';
        $secondary = $theme['secondaryColor'] ?? '#10b981';

        $css .= ":root {\n";
        $css .= "    --primary-color: {$primary};\n";
        $css .= "    --secondary-color: {$secondary};\n";
        $css .= "    --base-font-size: {$fontSize}px;\n";
        $css .= "    --font-family: '{$fontFamily}', sans-serif;\n";
        $css .= "}\n\n";

        $css .= "body { font-family: var(--font-family) !important; font-size: var(--base-font-size); }\n";

        if (!empty($theme['customCss'])) {
            $css .= "\n/* Custom CSS */\n" . $theme['customCss'] . "\n";
        }

        file_put_contents(public_path("layouts/layout-{$layout->id}.css"), $css);
    }
}
