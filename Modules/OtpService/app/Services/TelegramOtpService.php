<?php

namespace Modules\OtpService\Services;

use Modules\OtpService\Interfaces\OtpServiceInterface;
use Illuminate\Support\Facades\Http;
use App\Models\Setting;

class TelegramOtpService implements OtpServiceInterface
{
    public function send(string $to, string $message): bool
    {
        $botToken = Setting::get('otpservice', 'telegram_bot_token');

        if (!$botToken) {
            return false;
        }

        try {
            $url = "https://api.telegram.org/bot{$botToken}/sendMessage";
            $response = Http::post($url, [
                'chat_id' => $to,
                'text' => $message,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Telegram OTP failed: " . $e->getMessage());
            return false;
        }
    }
}
