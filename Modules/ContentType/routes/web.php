<?php

use Illuminate\Support\Facades\Route;
use Modules\ContentType\Http\Controllers\ContentTypeController;
use Modules\ContentType\Http\Controllers\ContentEntryController;
use Modules\ContentType\Http\Controllers\SchemaSyncController;

Route::middleware(['auth', 'verified'])->group(function () {
    // CMS Builder Routes
    Route::middleware(['permission:content-types,read'])->group(function () {
        Route::get('/builder/content-types', [ContentTypeController::class, 'index'])->name('content-types.index');
        Route::get('/builder/content-types/create', [ContentTypeController::class, 'create'])->name('content-types.create')->middleware('permission:content-types,create');
        Route::post('/builder/content-types', [ContentTypeController::class, 'store'])->name('content-types.store')->middleware('permission:content-types,create');
        Route::get('/builder/content-types/{contentType}/edit', [ContentTypeController::class, 'edit'])->name('content-types.edit')->middleware('permission:content-types,update');
        Route::put('/builder/content-types/{contentType}', [ContentTypeController::class, 'update'])->name('content-types.update')->middleware('permission:content-types,update');
        Route::delete('/builder/content-types/{contentType}', [ContentTypeController::class, 'destroy'])->name('content-types.destroy')->middleware('permission:content-types,delete');
        Route::post('/builder/content-types/{contentType}/push', [SchemaSyncController::class, 'push'])->name('content-types.push')->middleware('permission:content-types,publish');
    });

    // CMS Content Entry Routes
    Route::middleware(['permission:content-types,read'])->group(function () {
        Route::get('/builder/content-data', [ContentEntryController::class, 'dataManager'])->name('content-types.data.index');
    });
    
    // Dynamic permissions for content entries
    Route::group(['prefix' => 'content', 'as' => 'content-entries.'], function () {
        Route::get('/{slug}', [ContentEntryController::class, 'index'])->name('index');
        Route::get('/{slug}/create', [ContentEntryController::class, 'create'])->name('create');
        Route::post('/{slug}', [ContentEntryController::class, 'store'])->name('store');
        Route::get('/{slug}/{id}/edit', [ContentEntryController::class, 'edit'])->name('edit');
        Route::put('/{slug}/{id}', [ContentEntryController::class, 'update'])->name('update');
        Route::get('/{slug}/{id}/history', [ContentEntryController::class, 'history'])->name('history');
    });
});
