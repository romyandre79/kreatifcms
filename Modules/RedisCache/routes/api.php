<?php

use Illuminate\Support\Facades\Route;
use Modules\RedisCache\Http\Controllers\RedisCacheController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('rediscaches', RedisCacheController::class)->names('rediscache');
});
