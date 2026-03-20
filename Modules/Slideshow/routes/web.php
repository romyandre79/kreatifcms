<?php

use Illuminate\Support\Facades\Route;
use Modules\Slideshow\Http\Controllers\SlideshowController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('slideshows', SlideshowController::class)->names('slideshow');
});
