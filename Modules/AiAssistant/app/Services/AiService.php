<?php

namespace Modules\AiAssistant\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Setting;

class AiService
{
    protected $module = 'aiassistant';

    /**
     * Get the system prompt for the AI assistant.
     */
    protected function getSystemPrompt()
    {
        $modules = [
            'AiAssistant', 'Captcha', 'ContentList', 'DatabaseManager', 'EditorSummernote',
            'EmailConfig', 'EmailTemplates', 'FeatureGrid', 'Hero', 'ImageBlock',
            'ImageConverter', 'Navbar', 'RedisCache', 'ReusableBlock', 'Security',
            'Seo', 'Slideshow', 'TextBlock', 'TimelineBlock', 'VideoBlock', 'FormBlock'
        ];

        $context = "You are the official AI Assistant for KreatifCMS.\n";
        $context .= "System Context:\n";
        $context .= "- Framework: Laravel 12, Inertia.js (React 18), Tailwind CSS.\n";
        $context .= "- Architecture: Modular (nwidart/laravel-modules).\n";
        $context .= "- Goal: Assist admins in managing content and designing layouts.\n\n";

        $context .= "DESIGN CAPABILITIES:\n";
        $context .= "You can generate UNIFIED designs that combine both 'Page Builder' blocks and 'Layout Editor' settings. When asked to replicate a site or create a new design, provide a single JSON containing all relevant fields.\n\n";

        $context .= "UNIFIED JSON SCHEMA:\n";
        $context .= "{\n";
        $context .= "  \"title\": \"Page Title\",\n";
        $context .= "  \"layout_name\": \"Optional: name of an existing layout to link to\",\n";
        $context .= "  \"fonts_to_install\": [{\"font_name\": \"Name\", \"url\": \"URL\"}, ...], // NEW: Bulk Install\n";
        $context .= "  \"blocks\": [BLOCK_OBJECT, ...],\n";
        $context .= "  \"header_blocks\": [BLOCK_OBJECT, ...],\n";
        $context .= "  \"footer_blocks\": [BLOCK_OBJECT, ...],\n";
        $context .= "  \"theme_data\": {\n";
        $context .= "    \"primaryColor\": \"#Hex\", \"secondaryColor\": \"#Hex\",\n";
        $context .= "    \"fontFamily\": \"Inter|Roboto|Outfit\", \"fontSize\": \"16\",\n";
        $context .= "    \"customCss\": \" /* CSS to replicate brand styling */ \"\n";
        $context .= "  },\n";
        $context .= "  \"meta_title\": \"\", \"meta_description\": \"\"\n";
        $context .= "}\n\n";

        $context .= "PLUGIN SCAFFOLDING GUIDELINES:\n";
        $context .= "- Essential files: 'module.json', 'app/Providers/NameServiceProvider.php', 'routes/web.php'.\n";
        $context .= "- Use 'Modules\\Name' as the root namespace.\n";
        $context .= "- module.json must include: name, alias, description, version, providers (list the service provider).\n";
        $context .= "- Be technical and implement the requested logic fully (API, Backend, Logic).\n\n";

        $context .= "BLOCK_OBJECT Types & Examples:\n";
        $context .= "- hero: { \"type\": \"hero\", \"data\": { \"title\": \"\", \"subtitle\": \"\", \"bgImage\": \"\", \"buttonText\": \"\", \"buttonLink\": \"\" } }\n";
        $context .= "- text: { \"type\": \"text\", \"data\": { \"content\": \"HTML string\", \"align\": \"left|center|right\" } }\n";
        $context .= "- feature_grid: { \"type\": \"feature_grid\", \"data\": { \"title\": \"\", \"columns\": 3, \"items\": [{ \"id\": \"unique\", \"title\": \"\", \"desc\": \"\", \"image\": \"\" }] } }\n";
        $context .= "- slideshow: { \"type\": \"slideshow\", \"data\": { \"items\": [{ \"id\": \"unq\", \"type\": \"image\", \"image\": \"\" }] } }\n";
        $context .= "- form: { \"type\": \"form\", \"data\": { \"title\": \"\", \"fields\": [{ \"id\": \"unq\", \"label\": \"\", \"name\": \"\", \"type\": \"text|email|textarea\", \"required\": true }] } }\n";
        $context .= "- social_media: { \"type\": \"social_media\", \"data\": { \"links\": [{ \"id\": \"unq\", \"icon\": \"Facebook|Twitter|Instagram\", \"url\": \"\" }] } }\n";
        $context .= "- timeline: { \"type\": \"timeline\", \"data\": { \"items\": [{ \"id\": \"unq\", \"title\": \"\", \"content\": \"\" }] } }\n\n";

        $context .= "DESIGN CLONING & FONT AUTOMATION:\n";
        $context .= "- VERY IMPORTANT: Be extremely brief. Do NOT explain how cloning works unless asked.\n";
        $context .= "- If the user mentions a URL or asks to replicate a site, immediately provide the 'scan' action block.\n";
        $context .= "- To offer a scan or installation, you MUST include a JSON block with the 'cloner_action' key (no explanation needed):\n";
        $context .= "  - Scan Offer: { \"cloner_action\": \"scan\", \"url\": \"https://example.com\" }\n";
        $context .= "  - Font Installation: { \"cloner_action\": \"install_font\", \"font_name\": \"Name\", \"url\": \"URL_TO_FONT_FILE\" }\n";
        $context .= "- Example Response: 'I can scan this URL for you. { \"cloner_action\": \"scan\", \"url\": \"...\" }'\n\n";

        $context .= "INSTRUCTIONS:\n";
        $context .= "- If a 'custom_styles_hint' is provided in the scan result, ALWAYS include it in 'theme_data.customCss'.\n";
        $context .= "- Use 'Plus Jakarta Sans' as the default fontFamily for premium/e-commerce designs.\n";
        $context .= "- Use 'generateId()' notation for any nested item 'id' fields.\n";
        $context .= "- For Hero and Slideshow, assume empty strings for images unless requested otherwise.\n";
        $context .= "- ALWAYS wrap the JSON structure within a markdown code block labeled 'json'.\n";
        $context .= "- Even if you are reviewing or suggesting improvements to a JSON provided by the user, you MUST output the complete, corrected JSON in your response so the 'Apply/Create' buttons are available to the user.\n";
        $context .= "- Be creative with content but stick to the schemas.";

        return $context;
    }

    /**
     * Send a chat message to the configured AI provider.
     */
    public function chat(array $messages, $modelId = null)
    {
        $aiModel = null;

        if ($modelId) {
            $aiModel = \Modules\AiAssistant\Models\AiModel::find($modelId);
        }

        // If no model ID provided or not found, look for the system default model
        if (!$aiModel) {
            $aiModel = \Modules\AiAssistant\Models\AiModel::where('is_default', true)->first();
        }

        // Fallback to global settings if no specific/default model found
        if ($aiModel) {
            $provider = $aiModel->provider;
        } else {
            $provider = Setting::get($this->module, 'ai_provider', 'gemini');
        }

        return match ($provider) {
            'ollama' => $this->chatWithOllama($messages, $aiModel),
            'gemini' => $this->chatWithGemini($messages, $aiModel),
            'openai' => $this->chatWithOpenAI($messages, $aiModel),
            default => throw new \Exception("Unsupported AI provider: {$provider}"),
        };
    }

    protected function logUsage($aiModelId, $prompt, $completion, $total)
    {
        if (!$aiModelId) return; // Only log for registered models

        try {
            \Modules\AiAssistant\Models\AiUsage::create([
                'ai_model_id' => $aiModelId,
                'prompt_tokens' => $prompt,
                'completion_tokens' => $completion,
                'total_tokens' => $total,
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to log AI usage: " . $e->getMessage());
        }
    }

    protected function chatWithOllama(array $messages, $aiModel = null)
    {
        $baseUrl = $aiModel ? $aiModel->base_url : Setting::get($this->module, 'ollama_base_url', 'http://localhost:11434');
        $model = $aiModel ? $aiModel->model_name : Setting::get($this->module, 'ollama_model', 'llama3-70b');

        // Inject system prompt
        array_unshift($messages, ['role' => 'system', 'content' => $this->getSystemPrompt()]);

        $response = Http::withoutVerifying()->post("{$baseUrl}/api/chat", [
            'model' => $model,
            'messages' => $messages,
            'stream' => false,
        ]);

        if ($response->failed()) {
            throw new \Exception("Ollama API Error: " . ($response->json('error') ?? $response->body()));
        }

        // Ollama usage info varies, but we can try to extract it if available
        if ($aiModel) {
            $this->logUsage($aiModel->id, 0, 0, 0); // Ollama is local, usage tracking is less critical but we log the event
        }

        return $response->json('message.content');
    }

    protected function chatWithGemini(array $messages, $aiModel = null)
    {
        $apiKey = $aiModel ? $aiModel->api_key : Setting::get($this->module, 'gemini_api_key');
        $modelName = $aiModel ? $aiModel->model_name : Setting::get($this->module, 'gemini_model');
        
        // Ensure we have a valid model name if setting is empty
        if (empty($modelName)) {
            $modelName = 'gemini-1.5-flash';
        }

        if (!$apiKey) {
            throw new \Exception("Gemini API Key is not configured.");
        }

        // Normalisasi model name (trim dan ensure models/ prefix)
        $modelName = trim($modelName);
        $modelPath = str_starts_with($modelName, 'models/') ? $modelName : "models/{$modelName}";
        
        // Convert messages to Gemini format
        $contents = [];
        foreach ($messages as $msg) {
            $contents[] = [
                'role' => $msg['role'] === 'assistant' ? 'model' : 'user',
                'parts' => [['text' => $msg['content']]],
            ];
        }

        // Selalu gunakan v1beta untuk dukungan fitur terbaik (seperti system_instruction)
        $apiVersion = 'v1beta';
        $isGemini15 = str_contains($modelName, '1.5') || str_contains($modelName, '2.0') || str_contains($modelName, 'flash') || str_contains($modelName, 'pro');

        $url = "https://generativelanguage.googleapis.com/{$apiVersion}/{$modelPath}:generateContent?key={$apiKey}";
        
        $payload = [];

        // Letakkan system_instruction di urutan pertama (paling atas)
        if ($isGemini15) {
            $payload['system_instruction'] = [
                'role' => 'system',
                'parts' => [['text' => $this->getSystemPrompt()]]
            ];
        }

        $payload['contents'] = $contents;

        // Fallback untuk model lama (Non-1.5)
        if (!$isGemini15) {
            array_unshift($payload['contents'], [
                'role' => 'user',
                'parts' => [['text' => "SYSTEM INSTRUCTION: " . $this->getSystemPrompt()]]
            ]);
            array_unshift($payload['contents'], [
                'role' => 'model',
                'parts' => [['text' => "I understand and will follow these instructions."]]
            ]);
        }
        
        // DEBUG: Lihat JSON mentah yang terkirim
        \Illuminate\Support\Facades\Log::info("Gemini Final Payload: " . json_encode($payload));
        
        $response = Http::withoutVerifying()->post($url, $payload);

        if ($response->failed()) {
            throw new \Exception("Gemini API Error: " . ($response->json('error.message') ?? $response->body()));
        }

        // Log Usage
        if ($aiModel && $usage = $response->json('usageMetadata')) {
            $this->logUsage(
                $aiModel->id,
                $usage['promptTokenCount'] ?? 0,
                $usage['candidatesTokenCount'] ?? 0,
                $usage['totalTokenCount'] ?? 0
            );
        }

        return $response->json('candidates.0.content.parts.0.text');
    }

    protected function chatWithOpenAI(array $messages, $aiModel = null)
    {
        $apiKey = $aiModel ? $aiModel->api_key : Setting::get($this->module, 'openai_api_key');
        $model = $aiModel ? $aiModel->model_name : Setting::get($this->module, 'openai_model', 'gpt-4o');

        if (!$apiKey) {
            throw new \Exception("OpenAI API Key is not configured.");
        }

        // Inject system prompt
        array_unshift($messages, ['role' => 'system', 'content' => $this->getSystemPrompt()]);

        $response = Http::withoutVerifying()->withToken($apiKey)->post("https://api.openai.com/v1/chat/completions", [
            'model' => $model,
            'messages' => $messages,
        ]);

        if ($response->failed()) {
            throw new \Exception("OpenAI API Error: " . ($response->json('error.message') ?? $response->body()));
        }

        // Log Usage
        if ($aiModel && $usage = $response->json('usage')) {
            $this->logUsage(
                $aiModel->id,
                $usage['prompt_tokens'] ?? 0,
                $usage['completion_tokens'] ?? 0,
                $usage['total_tokens'] ?? 0
            );
        }

        return $response->json('choices.0.message.content');
    }

    public function listAvailableModels(string $provider, ?string $apiKey = null, ?string $baseUrl = null)
    {
        return match ($provider) {
            'ollama' => $this->listOllamaModels($baseUrl ?? Setting::get($this->module, 'ollama_base_url')),
            'gemini' => $this->listGeminiModels($apiKey ?? Setting::get($this->module, 'gemini_api_key')),
            'openai' => $this->listOpenAIModels($apiKey ?? Setting::get($this->module, 'openai_api_key')),
            default => [],
        };
    }

    protected function listGeminiModels(?string $apiKey)
    {
        if (!$apiKey) return [];

        try {
            $versions = ['v1', 'v1beta'];
            $allModels = [];

            foreach ($versions as $version) {
                $apiUrl = "https://generativelanguage.googleapis.com/{$version}/models?key={$apiKey}";
                $response = Http::withoutVerifying()->get($apiUrl);
                
                if ($response->successful()) {
                    $models = $response->json('models') ?? [];
                    
                    foreach ($models as $model) {
                        $id = str_replace('models/', '', $model['name']);
                        $isTextModel = str_contains($id, 'gemini') || str_contains($id, 'gemma') || str_contains($id, 'learnlm');

                        if ($isTextModel) {
                            $allModels[$id] = [
                                'id' => $id,
                                'name' => $model['displayName'] ?? $id,
                                'description' => $model['description'] ?? '',
                            ];
                        }
                    }
                }
            }

            return array_values($allModels);
        } catch (\Exception $e) {
            Log::error("Gemini ListModels Error: " . $e->getMessage());
            return [];
        }
    }

    protected function listOpenAIModels(?string $apiKey)
    {
        if (!$apiKey) return [];

        try {
            $response = Http::withoutVerifying()->withToken($apiKey)->get("https://api.openai.com/v1/models");
            if ($response->failed()) return [];

            return collect($response->json('data'))->filter(function ($model) {
                // Filter for common chat models (gpt-*)
                return str_starts_with($model['id'], 'gpt-');
            })->map(function ($model) {
                return [
                    'id' => $model['id'],
                    'name' => strtoupper($model['id']),
                    'description' => $model['owned_by'] ?? 'OpenAI',
                ];
            })->values()->toArray();
        } catch (\Exception $e) {
            Log::error("OpenAI ListModels Error: " . $e->getMessage());
            return [];
        }
    }

    protected function listOllamaModels(?string $baseUrl)
    {
        if (!$baseUrl) return [];

        try {
            $response = Http::withoutVerifying()->get("{$baseUrl}/api/tags");
            if ($response->failed()) return [];

            return collect($response->json('models'))->map(function ($model) {
                return [
                    'id' => $model['name'],
                    'name' => $model['name'],
                    'description' => "Local Ollama Model (" . ($model['details']['parameter_size'] ?? 'unknown') . ")",
                ];
            })->values()->toArray();
        } catch (\Exception $e) {
            Log::error("Ollama ListModels Error: " . $e->getMessage());
            return [];
        }
    }

    public function getQuickStats()
    {
        return \Modules\AiAssistant\Models\AiUsage::with('aiModel')
            ->get()
            ->groupBy('ai_model_id')
            ->map(function ($items) {
                $first = $items->first();
                return [
                    'model_id' => $first->ai_model_id,
                    'model_name' => $first->aiModel->name ?? 'Deleted Model',
                    'provider' => $first->aiModel->provider ?? 'Unknown',
                    'total_tokens' => $items->sum('total_tokens'),
                    'requests' => $items->count(),
                    'last_used' => $items->max('created_at'),
                ];
            })->toArray();
    }

    public function getUsageStats($period = 'month')
    {
        $query = \Modules\AiAssistant\Models\AiUsage::with('aiModel');

        if ($period === 'today') {
            $query->whereDate('created_at', now());
        } elseif ($period === 'week') {
            $query->where('created_at', '>=', now()->startOfWeek());
        } else {
            $query->where('created_at', '>=', now()->startOfMonth());
        }

        return $query->get()->groupBy('ai_model_id')->map(function ($items) {
            $first = $items->first();
            return [
                'model_name' => $first->aiModel->name ?? 'Deleted Model',
                'provider' => $first->aiModel->provider ?? 'Unknown',
                'total_tokens' => $items->sum('total_tokens'),
                'requests' => $items->count(),
                'last_used' => $items->max('created_at'),
            ];
        });
    }
}
