<?php

use Illuminate\Support\Facades\Route;
use Modules\DataGrid\Http\Controllers\DataGridController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('datagrids', DataGridController::class)->names('datagrids');
    Route::get('datagrids/{slug}/data', [\Modules\DataGrid\Http\Controllers\DataGridDataController::class, 'fetch'])->name('datagrids.data');
    Route::get('datagrids/{slug}/config', [\Modules\DataGrid\Http\Controllers\DataGridDataController::class, 'config'])->name('datagrids.config');
    Route::post('datagrids/{slug}/action/{buttonIndex}', [\Modules\DataGrid\Http\Controllers\DataGridDataController::class, 'executeAction'])->name('datagrids.action');
    Route::get('datagrids/{slug}/export/csv', [\Modules\DataGrid\Http\Controllers\DataGridDataController::class, 'exportCsv'])->name('datagrids.export.csv');
    Route::get('datagrids/{slug}/export/print', [\Modules\DataGrid\Http\Controllers\DataGridDataController::class, 'exportPrint'])->name('datagrids.export.print');
});


