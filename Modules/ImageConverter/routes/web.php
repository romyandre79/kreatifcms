<?php

use Illuminate\Support\Facades\Route;
use Modules\ImageConverter\Http\Controllers\ImageConverterController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('imageconverters', ImageConverterController::class)->names('imageconverter');
});
