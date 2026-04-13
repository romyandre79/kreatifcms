<?php

use Illuminate\Support\Facades\Route;
use Modules\DataGrid\Http\Controllers\DataGridController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('datagrids', DataGridController::class)->names('datagrid');
});
