<?php

use Illuminate\Support\Facades\Route;
use Modules\EditorSummernote\Http\Controllers\EditorSummernoteController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('editorsummernotes', EditorSummernoteController::class)->names('editorsummernote');
});
