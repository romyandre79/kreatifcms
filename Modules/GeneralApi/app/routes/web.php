<?php

use Illuminate\Support\Facades\Route;
use Modules\GeneralApi\Http\Controllers\Admin\GeneralApiController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['web', 'auth'])->prefix('admin/general-api')->name('admin.general-api.')->group(function () {
    Route::get('/', [\Modules\GeneralApi\Http\Controllers\Admin\GeneralApiController::class, 'index'])->name('index');
    Route::get('/create', [\Modules\GeneralApi\Http\Controllers\Admin\GeneralApiController::class, 'create'])->name('create');
    Route::post('/', [\Modules\GeneralApi\Http\Controllers\Admin\GeneralApiController::class, 'store'])->name('store');
    Route::get('/{general_api}/edit', [\Modules\GeneralApi\Http\Controllers\Admin\GeneralApiController::class, 'edit'])->name('edit');
    Route::put('/{general_api}', [\Modules\GeneralApi\Http\Controllers\Admin\GeneralApiController::class, 'update'])->name('update');
    Route::delete('/{general_api}', [\Modules\GeneralApi\Http\Controllers\Admin\GeneralApiController::class, 'destroy'])->name('destroy');
});
