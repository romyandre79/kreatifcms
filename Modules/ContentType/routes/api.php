<?php

use Illuminate\Support\Facades\Route;
use Modules\ContentType\Http\Controllers\ContentTypeController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('contenttypes', ContentTypeController::class)->names('contenttype');
});
