<?php

use Illuminate\Support\Facades\Route;
use Modules\SocialMediaBlock\Http\Controllers\SocialMediaBlockController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('socialmediablocks', SocialMediaBlockController::class)->names('socialmediablock');
});
