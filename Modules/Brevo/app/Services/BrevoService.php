<?php

namespace Modules\Brevo\Services;

use Illuminate\Support\Facades\Http;
use App\Models\Setting;

class BrevoService
{
    protected string $apiKey;
    protected string $baseUrl = 'https://api.brevo.com/v3';

    public function __construct()
    {
        $this->apiKey = Setting::get('brevo', 'api_key', '');
    }

    public function isConfigured(): bool
    {
        return !empty($this->apiKey);
    }

    /**
     * Get the authenticated HTTP client.
     */
    protected function client()
    {
        return Http::withHeaders([
            'api-key' => $this->apiKey,
            'accept' => 'application/json',
            'content-type' => 'application/json',
        ])->baseUrl($this->baseUrl)
          ->timeout(5); // 5 second timeout
    }

    /**
     * Send a transactional email.
     */
    public function sendEmail(string $to, string $subject, string $htmlContent, array $sender = null)
    {
        $sender = $sender ?: [
            'name' => Setting::get('brevo', 'sender_name', config('mail.from.name')),
            'email' => Setting::get('brevo', 'sender_email', config('mail.from.address')),
        ];

        return $this->client()->post('/smtp/email', [
            'sender' => $sender,
            'to' => [['email' => $to]],
            'subject' => $subject,
            'htmlContent' => $htmlContent,
        ]);
    }

    /**
     * Create and send a WhatsApp marketing campaign.
     */
    public function createWhatsAppCampaign(string $name, string $templateId, array $recipients)
    {
        return $this->client()->post('/whatsappCampaigns', [
            'name' => $name,
            'templateId' => $templateId,
            'recipients' => ['lists' => $recipients],
            'scheduledAt' => now()->addMinutes(1)->toIso8601String(),
        ]);
    }

    /**
     * Create and send an Email marketing campaign.
     */
    public function createEmailCampaign(string $name, string $subject, string $htmlContent, array $recipients)
    {
        $sender = [
            'name' => Setting::get('brevo', 'sender_name', config('mail.from.name')),
            'email' => Setting::get('brevo', 'sender_email', config('mail.from.address')),
        ];

        return $this->client()->post('/emailCampaigns', [
            'name' => $name,
            'subject' => $subject,
            'sender' => $sender,
            'htmlContent' => $htmlContent,
            'recipients' => ['lists' => $recipients],
        ]);
    }

    /**
     * Get basic account statistics.
     */
    public function getAccountStats()
    {
        return $this->client()->get('/account');
    }
}
