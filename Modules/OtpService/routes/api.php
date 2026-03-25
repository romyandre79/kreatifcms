<?php

use Illuminate\Support\Facades\Route;
use Modules\OtpService\Http\Controllers\OtpServiceController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('otpservices', OtpServiceController::class)->names('otpservice');
});
