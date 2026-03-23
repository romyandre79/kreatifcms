<?php

use Illuminate\Support\Facades\Route;
use Modules\ContentList\Http\Controllers\ContentListController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('contentlists', ContentListController::class)->names('contentlist');
});
