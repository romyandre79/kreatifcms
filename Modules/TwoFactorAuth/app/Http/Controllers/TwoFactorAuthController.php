<?php

namespace Modules\TwoFactorAuth\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Modules\TwoFactorAuth\Services\TwoFactorService;
use App\Models\User;
use Illuminate\Support\Facades\Redirect;

class TwoFactorAuthController extends Controller
{
    protected $twoFactorService;

    public function __construct(TwoFactorService $twoFactorService)
    {
        $this->twoFactorService = $twoFactorService;
    }

    /**
     * Show 2FA setup page.
     */
    public function setup(Request $request)
    {
        $user = $request->user();
        
        $secret = $user->two_factor_secret ?: $this->twoFactorService->generateSecretKey();
        
        if (!$user->two_factor_secret) {
            $user->update(['two_factor_secret' => $secret]);
        }

        $qrCodeUrl = $this->twoFactorService->getQrCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        $qrCodeSvg = $this->twoFactorService->getQrCodeSvg($qrCodeUrl);

        if ($request->wantsJson()) {
            return response()->json([
                'qrCodeSvg' => $qrCodeSvg,
                'secret' => $secret,
            ]);
        }

        return Inertia::render('Profile/Edit', [
            'qrCodeSvg' => $qrCodeSvg,
            'secret' => $secret,
        ]);
    }

    /**
     * Confirm 2FA setup.
     */
    public function confirm(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $user = $request->user();

        if ($this->twoFactorService->verify($user->two_factor_secret, $request->code)) {
            $recoveryCodes = $this->twoFactorService->generateRecoveryCodes();
            
            $user->update([
                'two_factor_confirmed_at' => now(),
                'two_factor_recovery_codes' => $this->twoFactorService->encryptRecoveryCodes($recoveryCodes),
            ]);

            return Redirect::route('profile.edit')->with('status', 'Two-factor authentication enabled.');
        }

        return back()->withErrors(['code' => 'The provided code was invalid.']);
    }

    /**
     * Disable 2FA.
     */
    public function disable(Request $request)
    {
        $user = $request->user();
        
        $user->update([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ]);

        return Redirect::route('profile.edit')->with('status', 'Two-factor authentication disabled.');
    }

    /**
     * Show recovery codes to the user.
     */
    public function showRecoveryCodes(Request $request)
    {
        $user = $request->user();
        
        if (!$user->two_factor_confirmed_at) {
            return response()->json(['message' => '2FA not enabled.'], 403);
        }

        return response()->json([
            'recoveryCodes' => $this->twoFactorService->decryptRecoveryCodes($user->two_factor_recovery_codes),
        ]);
    }

    /**
     * Regenerate recovery codes.
     */
    public function regenerateRecoveryCodes(Request $request)
    {
        $user = $request->user();

        if (!$user->two_factor_confirmed_at) {
            return back()->withErrors(['message' => '2FA not enabled.']);
        }

        $recoveryCodes = $this->twoFactorService->generateRecoveryCodes();
        
        $user->update([
            'two_factor_recovery_codes' => $this->twoFactorService->encryptRecoveryCodes($recoveryCodes),
        ]);

        return back()->with('status', 'Recovery codes regenerated.');
    }

    /**
     * Show 2FA challenge page.
     */
    public function challenge(Request $request)
    {
        if (!$request->session()->has('login.id')) {
            return Redirect::route('login');
        }

        return Inertia::render('Auth/TwoFactorChallenge', [
            'status' => session('status'),
        ]);
    }

    /**
     * Verify the 2FA code during login.
     */
    public function verifyChallenge(Request $request)
    {
        $request->validate([
            'code' => 'nullable|string',
            'recovery_code' => 'nullable|string',
        ]);

        if (!$request->session()->has('login.id')) {
            return Redirect::route('login');
        }

        $user = User::findOrFail($request->session()->get('login.id'));

        if ($request->code) {
            if ($this->twoFactorService->verify($user->two_factor_secret, $request->code)) {
                $this->completeLogin($request, $user);
                return Redirect::intended(route('dashboard', absolute: false));
            }
        } elseif ($request->recovery_code) {
            $recoveryCodes = $this->twoFactorService->decryptRecoveryCodes($user->two_factor_recovery_codes);
            if (($key = array_search($request->recovery_code, $recoveryCodes)) !== false) {
                // Remove used code
                unset($recoveryCodes[$key]);
                $user->update([
                    'two_factor_recovery_codes' => $this->twoFactorService->encryptRecoveryCodes(array_values($recoveryCodes)),
                ]);
                
                $this->completeLogin($request, $user);
                return Redirect::intended(route('dashboard', absolute: false));
            }
        }

        return back()->withErrors(['code' => 'The provided code was invalid.']);
    }

    /**
     * Complete the login for the user.
     */
    protected function completeLogin(Request $request, User $user)
    {
        Auth::login($user, $request->session()->get('login.remember', false));
        $request->session()->forget(['login.id', 'login.remember']);
        $request->session()->regenerate();
    }
}
