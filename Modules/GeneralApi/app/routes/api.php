<?php

use Illuminate\Support\Facades\Route;
use Modules\GeneralApi\Http\Controllers\GeneralApiHandlerController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| These routes are for the custom endpoints.
*/

Route::prefix('v1/custom')->group(function () {
    Route::any('/{slug}', [GeneralApiHandlerController::class, 'handle'])->name('general-api.custom.handle');
});
