<?php

use Illuminate\Support\Facades\Route;
use Modules\Hero\Http\Controllers\HeroController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('heroes', HeroController::class)->names('hero');
});
