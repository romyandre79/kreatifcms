<?php

use Illuminate\Support\Facades\Route;
use Modules\FeatureGrid\Http\Controllers\FeatureGridController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('featuregrids', FeatureGridController::class)->names('featuregrid');
});
