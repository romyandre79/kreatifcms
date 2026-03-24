<?php

namespace Modules\OtpService\Services;

use Modules\OtpService\Interfaces\OtpServiceInterface;
use Illuminate\Support\Facades\Http;
use App\Models\Setting;

class WhatsAppOtpService implements OtpServiceInterface
{
    public function send(string $to, string $message): bool
    {
        $apiUrl = Setting::get('otpservice', 'whatsapp_api_url');
        $apiKey = Setting::get('otpservice', 'whatsapp_api_key');
        $sender = Setting::get('otpservice', 'whatsapp_sender_number');

        if (!$apiUrl || !$apiKey) {
            return false;
        }

        try {
            // This is a generic implementation. Specific API structures may vary.
            // Using a common pattern for WhatsApp Gateways.
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->post($apiUrl, [
                'sender' => $sender,
                'number' => $to,
                'message' => $message,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("WhatsApp OTP failed: " . $e->getMessage());
            return false;
        }
    }
}
