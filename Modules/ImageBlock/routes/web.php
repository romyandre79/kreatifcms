<?php

use Illuminate\Support\Facades\Route;
use Modules\ImageBlock\Http\Controllers\ImageBlockController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('imageblocks', ImageBlockController::class)->names('imageblock');
});
