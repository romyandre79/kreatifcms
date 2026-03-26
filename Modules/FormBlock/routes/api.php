<?php

use Illuminate\Support\Facades\Route;
use Modules\FormBlock\Http\Controllers\FormController;

Route::post('/form/submit', [FormController::class, 'submit'])->name('form.submit');
