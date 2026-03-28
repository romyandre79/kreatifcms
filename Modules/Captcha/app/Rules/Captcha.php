<?php

namespace Modules\Captcha\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Http;
use App\Models\Setting;
use Nwidart\Modules\Facades\Module;

class Captcha implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!Module::find('Captcha') || !Module::find('Captcha')->isEnabled()) {
            return;
        }

        $secretKey = Setting::get('captcha', 'captcha_secret_key') ?: (env('RECAPTCHA_SECRET_KEY') ?: '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJBy');

        if (empty($secretKey)) {
            return;
        }

        $response = Http::withoutVerifying()
            ->asForm()
            ->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $secretKey,
                'response' => $value,
                'remoteip' => request()->ip(),
            ]);

        $responseBody = $response->json();

        if (!isset($responseBody['success']) || !$responseBody['success']) {
            $fail('The captcha verification failed. Please try again.');
        }
    }

    /**
     * Determine if the validation rule passes (for Validator::extend compatibility).
     */
    public function passes($attribute, $value)
    {
        $passed = true;
        $this->validate($attribute, $value, function ($message) use (&$passed) {
            $passed = false;
        });
        return $passed;
    }
}
