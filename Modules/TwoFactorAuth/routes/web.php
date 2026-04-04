<?php

use Illuminate\Support\Facades\Route;
use Modules\TwoFactorAuth\Http\Controllers\TwoFactorAuthController;

Route::middleware(['web', 'auth'])->group(function () {
    Route::get('user/two-factor-auth', [TwoFactorAuthController::class, 'setup'])->name('two-factor.setup');
    Route::post('user/two-factor-auth', [TwoFactorAuthController::class, 'confirm'])->name('two-factor.confirm');
    Route::delete('user/two-factor-auth', [TwoFactorAuthController::class, 'disable'])->name('two-factor.disable');
    Route::get('user/two-factor-recovery-codes', [TwoFactorAuthController::class, 'showRecoveryCodes'])->name('two-factor.recovery-codes');
    Route::post('user/two-factor-recovery-codes', [TwoFactorAuthController::class, 'regenerateRecoveryCodes'])->name('two-factor.recovery-codes.regenerate');
});

Route::middleware(['web'])->group(function () {
    Route::get('two-factor-challenge', [TwoFactorAuthController::class, 'challenge'])->name('two-factor.challenge');
    Route::post('two-factor-challenge', [TwoFactorAuthController::class, 'verifyChallenge'])->name('two-factor.challenge.verify');
});
