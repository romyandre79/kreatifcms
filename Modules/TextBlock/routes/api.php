<?php

use Illuminate\Support\Facades\Route;
use Modules\TextBlock\Http\Controllers\TextBlockController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('textblocks', TextBlockController::class)->names('textblock');
});
