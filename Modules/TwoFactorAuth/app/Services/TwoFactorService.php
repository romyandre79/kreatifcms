<?php

namespace Modules\TwoFactorAuth\Services;

use PragmaRX\Google2FA\Google2FA;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class TwoFactorService
{
    protected $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    /**
     * Generate a new secret key.
     */
    public function generateSecretKey(): string
    {
        return $this->google2fa->generateSecretKey();
    }

    /**
     * Generate a QR code URL.
     */
    public function getQrCodeUrl(string $company, string $holder, string $secret): string
    {
        return $this->google2fa->getQRCodeUrl($company, $holder, $secret);
    }

    /**
     * Generate a QR code SVG.
     */
    public function getQrCodeSvg(string $url): string
    {
        $renderer = new ImageRenderer(
            new RendererStyle(200),
            new SvgImageBackEnd()
        );
        $writer = new Writer($renderer);
        return $writer->writeString($url);
    }

    /**
     * Verify the 2FA code.
     */
    public function verify(string $secret, string $code): bool
    {
        return $this->google2fa->verifyKey($secret, $code);
    }

    /**
     * Generate recovery codes.
     */
    public function generateRecoveryCodes(int $count = 8): array
    {
        $codes = [];
        for ($i = 0; $i < $count; $i++) {
            $codes[] = Str::random(10) . '-' . Str::random(10);
        }
        return $codes;
    }

    /**
     * Hash recovery codes for storage.
     */
    public function encryptRecoveryCodes(array $codes): string
    {
        return json_encode(array_map(fn($code) => encrypt($code), $codes));
    }

    /**
     * Decrypt recovery codes for checking.
     */
    public function decryptRecoveryCodes(string $encrypted): array
    {
        $codes = json_decode($encrypted, true);
        if (!$codes) return [];
        return array_map(fn($code) => decrypt($code), $codes);
    }
}
