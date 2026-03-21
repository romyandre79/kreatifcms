<?php

use Illuminate\Support\Facades\Route;
use Modules\Navbar\Http\Controllers\NavbarController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('navbars', NavbarController::class)->names('navbar');
});
