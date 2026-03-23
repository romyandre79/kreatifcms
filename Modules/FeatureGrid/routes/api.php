<?php

use Illuminate\Support\Facades\Route;
use Modules\FeatureGrid\Http\Controllers\FeatureGridController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('featuregrids', FeatureGridController::class)->names('featuregrid');
});
