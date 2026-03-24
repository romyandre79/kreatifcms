<?php

namespace Modules\OtpService\Tests\Unit;

use Tests\TestCase;
use Modules\OtpService\Interfaces\OtpServiceInterface;
use Modules\OtpService\Services\WhatsAppOtpService;
use Modules\OtpService\Services\TelegramOtpService;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Foundation\Testing\RefreshDatabase;

class OtpServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_resolves_whatsapp_service_by_default()
    {
        $service = app(OtpServiceInterface::class);
        $this->assertInstanceOf(WhatsAppOtpService::class, $service);
    }

    public function test_it_resolves_telegram_service_when_configured()
    {
        Setting::set('otpservice', 'otp_provider', 'telegram');
        
        // Re-resolve to see the change (since it's a singleton, we might need to swap or refresh)
        // For testing purposes, we can manually bind or clear the instance if needed.
        // But app() usually works if not yet resolved.
        
        $this->app->forgetInstance(OtpServiceInterface::class);
        $service = app(OtpServiceInterface::class);
        $this->assertInstanceOf(TelegramOtpService::class, $service);
    }

    public function test_whatsapp_service_sends_correct_request()
    {
        Http::fake();
        
        Setting::set('otpservice', 'otp_provider', 'whatsapp');
        Setting::set('otpservice', 'whatsapp_api_url', 'https://api.test/send');
        Setting::set('otpservice', 'whatsapp_api_key', 'test-key');
        
        $this->app->forgetInstance(OtpServiceInterface::class);
        $service = app(OtpServiceInterface::class);
        
        $service->send('123456789', 'Hello OTP');
        
        Http::assertSent(function ($request) {
            return $request->url() === 'https://api.test/send' &&
                   $request->hasHeader('Authorization', 'Bearer test-key') &&
                   $request['number'] === '123456789' &&
                   $request['message'] === 'Hello OTP';
        });
    }

    public function test_telegram_service_sends_correct_request()
    {
        Http::fake();
        
        Setting::set('otpservice', 'otp_provider', 'telegram');
        Setting::set('otpservice', 'telegram_bot_token', 'bot123');
        
        $this->app->forgetInstance(OtpServiceInterface::class);
        $service = app(OtpServiceInterface::class);
        
        $service->send('chat_id_123', 'Hello Telegram');
        
        Http::assertSent(function ($request) {
            return $request->url() === 'https://api.telegram.org/botbot123/sendMessage' &&
                   $request['chat_id'] === 'chat_id_123' &&
                   $request['text'] === 'Hello Telegram';
        });
    }
}
