<?php

use Illuminate\Support\Facades\Route;
use Modules\EmailTemplates\Http\Controllers\EmailTemplatesController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('emailtemplates', EmailTemplatesController::class)->names('emailtemplates');
});
