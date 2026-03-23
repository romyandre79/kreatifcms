<?php

use Illuminate\Support\Facades\Route;
use Modules\ContentList\Http\Controllers\ContentListController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('contentlists', ContentListController::class)->names('contentlist');
});
