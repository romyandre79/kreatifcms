<?php

use Illuminate\Support\Facades\Route;
use Modules\Seo\Http\Controllers\SeoController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/seo', [SeoController::class, 'index'])->name('seo.index');
    Route::post('/seo/settings', [SeoController::class, 'updateSettings'])->name('seo.settings.update');
});
