<?php

use Illuminate\Support\Facades\Route;
use Modules\EditorSummernote\Http\Controllers\EditorSummernoteController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('editorsummernotes', EditorSummernoteController::class)->names('editorsummernote');
});
