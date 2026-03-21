<?php

use Illuminate\Support\Facades\Route;
use Modules\RedisCache\Http\Controllers\RedisCacheController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('rediscaches', RedisCacheController::class)->names('rediscache');
});
