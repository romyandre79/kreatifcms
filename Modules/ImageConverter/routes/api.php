<?php

use Illuminate\Support\Facades\Route;
use Modules\ImageConverter\Http\Controllers\ImageConverterController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('imageconverters', ImageConverterController::class)->names('imageconverter');
});
