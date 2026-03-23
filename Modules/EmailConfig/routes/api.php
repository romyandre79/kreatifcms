<?php

use Illuminate\Support\Facades\Route;
use Modules\EmailConfig\Http\Controllers\EmailConfigController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('emailconfigs', EmailConfigController::class)->names('emailconfig');
});
