<?php

use Illuminate\Support\Facades\Route;
use Modules\Brevo\Http\Controllers\BrevoController;

Route::middleware(['auth', 'verified'])->prefix('admin')->group(function () {
    Route::get('/brevo', [BrevoController::class, 'index'])->name('brevo.index');
    Route::resource('brevo/campaigns', BrevoController::class)->names('brevo')->except(['index']);
});
