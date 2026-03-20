<?php

use Illuminate\Support\Facades\Route; 
use Modules\ReusableBlock\Http\Controllers\BlockController; 
Route::middleware(['auth', 'verified'])->group(function () { 
    Route::resource('blocks', BlockController::class); 
});
