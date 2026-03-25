<?php

namespace Modules\AiAssistant\Services;

use Illuminate\Support\Facades\Http;
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
            'Seo', 'Slideshow', 'TextBlock'
        ];

        $context = "You are the official AI Assistant for KreatifCMS.\n";
        $context .= "Project Info:\n";
        $context .= "- Framework: Laravel 12\n";
        $context .= "- Frontend: Inertia.js with React 18, Tailwind CSS\n";
        $context .= "- Architecture: Modular (using nwidart/laravel-modules)\n";
        $context .= "- Modules installed: " . implode(', ', $modules) . "\n\n";
        $context .= "Your goal is to assist the admin user in managing the system, creating content, and configuring modules. ";
        $context .= "Be helpful, concise, and technical when needed.";

        return $context;
    }

    /**
     * Send a chat message to the configured AI provider.
     */
    public function chat(array $messages)
    {
        $provider = Setting::get($this->module, 'ai_provider', 'gemini');

        return match ($provider) {
            'ollama' => $this->chatWithOllama($messages),
            'gemini' => $this->chatWithGemini($messages),
            'openai' => $this->chatWithOpenAI($messages),
            default => throw new \Exception("Unsupported AI provider: {$provider}"),
        };
    }

    protected function chatWithOllama(array $messages)
    {
        $baseUrl = Setting::get($this->module, 'ollama_base_url', 'http://localhost:11434');
        $model = Setting::get($this->module, 'ollama_model', 'llama3-70b');

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

        return $response->json('message.content');
    }

    protected function chatWithGemini(array $messages)
    {
        $apiKey = Setting::get($this->module, 'gemini_api_key');
        // Use verified model from the available list for this key
        $model = Setting::get($this->module, 'gemini_model', 'gemini-2.0-flash');

        if (!$apiKey) {
            throw new \Exception("Gemini API Key is not configured.");
        }

        // Convert messages to Gemini format
        $contents = [];
        foreach ($messages as $msg) {
            $contents[] = [
                'role' => $msg['role'] === 'assistant' ? 'model' : 'user',
                'parts' => [['text' => $msg['content']]],
            ];
        }

        // Use v1beta for systemInstruction support
        $response = Http::withoutVerifying()->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}", [
            'contents' => $contents,
            'systemInstruction' => [
                'parts' => [['text' => $this->getSystemPrompt()]]
            ]
        ]);

        if ($response->failed()) {
            throw new \Exception("Gemini API Error: " . ($response->json('error.message') ?? $response->body()));
        }

        return $response->json('candidates.0.content.parts.0.text');
    }

    protected function chatWithOpenAI(array $messages)
    {
        $apiKey = Setting::get($this->module, 'openai_api_key');
        $model = Setting::get($this->module, 'openai_model', 'gpt-4o');

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

        return $response->json('choices.0.message.content');
    }
}
