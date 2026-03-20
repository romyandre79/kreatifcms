<?php

use Illuminate\Support\Facades\Route;
use Modules\Slideshow\Http\Controllers\SlideshowController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('slideshows', SlideshowController::class)->names('slideshow');
});
