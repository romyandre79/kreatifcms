<?php

use Illuminate\Support\Facades\Route;
use Modules\LanguageSwitcher\Http\Controllers\LanguageSwitcherController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('languageswitchers', LanguageSwitcherController::class)->names('languageswitcher');
});
