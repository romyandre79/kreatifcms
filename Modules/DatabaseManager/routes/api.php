<?php

use Illuminate\Support\Facades\Route;
use Modules\DatabaseManager\Http\Controllers\DatabaseManagerController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('databasemanagers', DatabaseManagerController::class)->names('databasemanager');
});
