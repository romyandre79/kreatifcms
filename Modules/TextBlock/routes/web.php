<?php

use Illuminate\Support\Facades\Route;
use Modules\TextBlock\Http\Controllers\TextBlockController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('textblocks', TextBlockController::class)->names('textblock');
});
