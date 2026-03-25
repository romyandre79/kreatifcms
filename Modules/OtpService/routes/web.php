<?php

use Illuminate\Support\Facades\Route;
use Modules\OtpService\Http\Controllers\OtpServiceController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('otpservices', OtpServiceController::class)->names('otpservice');
});
