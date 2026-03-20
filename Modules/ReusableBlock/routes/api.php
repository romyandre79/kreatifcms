<?php

use Illuminate\Support\Facades\Route;
use Modules\ReusableBlock\Http\Controllers\ReusableBlockController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('reusableblocks', ReusableBlockController::class)->names('reusableblock');
});
