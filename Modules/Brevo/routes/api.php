<?php

use Illuminate\Support\Facades\Route;
use Modules\Brevo\Http\Controllers\WebhookController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::prefix('brevo/webhook')->group(function () {
    Route::post('/inbound', [WebhookController::class, 'inboundEmail']);
    Route::post('/status', [WebhookController::class, 'statusUpdate']);
});
