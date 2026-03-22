<?php

use Illuminate\Support\Facades\Route;
use Modules\EmailTemplates\Http\Controllers\EmailTemplatesController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('email-templates', EmailTemplatesController::class);
});
