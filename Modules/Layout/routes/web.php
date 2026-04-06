<?php

use Illuminate\Support\Facades\Route;
use Modules\Layout\Http\Controllers\LayoutController;

Route::middleware(['auth', 'verified', 'permission:layouts,read'])->group(function () {
    Route::resource('/admin/layouts', LayoutController::class)->names('layouts')->middleware('permission:layouts,update');
});
