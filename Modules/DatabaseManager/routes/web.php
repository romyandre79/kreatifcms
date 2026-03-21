<?php

use Illuminate\Support\Facades\Route;
use Modules\DatabaseManager\Http\Controllers\DatabaseManagerController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('databasemanagers', DatabaseManagerController::class)->names('databasemanager');
});
