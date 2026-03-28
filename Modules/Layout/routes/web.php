<?php

use Illuminate\Support\Facades\Route;
use Modules\Layout\Http\Controllers\LayoutController;

Route::middleware(['auth', 'verified', 'permission:layouts,read'])->group(function () {
    Route::get('/admin/layouts', [LayoutController::class, 'index'])->name('layouts.index');
    Route::post('/admin/layouts', [LayoutController::class, 'update'])->name('layouts.update')->middleware('permission:layouts,update');
});
