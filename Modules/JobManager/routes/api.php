<?php

use Illuminate\Support\Facades\Route;
use Modules\JobManager\Http\Controllers\JobManagerController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('jobmanagers', JobManagerController::class)->names('jobmanager');
});
