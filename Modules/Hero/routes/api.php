<?php

use Illuminate\Support\Facades\Route;
use Modules\Hero\Http\Controllers\HeroController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('heroes', HeroController::class)->names('hero');
});
