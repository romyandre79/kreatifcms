<?php

use Illuminate\Support\Facades\Route;
use Modules\SocialMediaBlock\Http\Controllers\SocialMediaBlockController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('socialmediablocks', SocialMediaBlockController::class)->names('socialmediablock');
});
