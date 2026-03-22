<?php

use Illuminate\Support\Facades\Route;
use Modules\EmailConfig\Http\Controllers\EmailConfigController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('emailconfigs', EmailConfigController::class)->names('emailconfig');
});
