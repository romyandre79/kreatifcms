<?php

use Illuminate\Support\Facades\Route;
use Modules\MegaMenu\Http\Controllers\MegaMenuController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('megamenus', MegaMenuController::class)->names('megamenu');
});
