<?php

use Illuminate\Support\Facades\Route;
use Modules\Navbar\Http\Controllers\NavbarController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('navbars', NavbarController::class)->names('navbar');
});
