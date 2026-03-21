<?php

use Illuminate\Support\Facades\Route;
use Modules\DatabaseManager\Http\Controllers\DatabaseManagementController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/settings/database', [DatabaseManagementController::class, 'index'])->name('settings.database.index');
    Route::get('/settings/database/backup', [DatabaseManagementController::class, 'backup'])->name('settings.database.backup');
    Route::post('/settings/database/restore', [DatabaseManagementController::class, 'restore'])->name('settings.database.restore');
    Route::post('/settings/database/reset', [DatabaseManagementController::class, 'reset'])->name('settings.database.reset');
});
