<?php

use App\Http\Controllers\ContentTypeController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('throttle:api')->group(function () {
    Route::apiResource('content-types', ContentTypeController::class)->names([
        'index' => 'api.content-types.index',
        'store' => 'api.content-types.store',
        'show' => 'api.content-types.show',
        'update' => 'api.content-types.update',
        'destroy' => 'api.content-types.destroy',
    ]);

    Route::name('api.')->group(function () {
        Route::apiResource('users', App\Http\Controllers\UserController::class);
        Route::apiResource('roles', App\Http\Controllers\RoleController::class)->only(['index']);
    });
});

// Generic CMS Content Entry Routes (Protected by JWT)
Route::prefix('content')->name('api.content.')->middleware(['auth:api', 'throttle:api'])->group(function () {
    Route::get('{contentTypeSlug}', [App\Http\Controllers\ContentEntryController::class, 'index'])->name('index');
    Route::post('{contentTypeSlug}', [App\Http\Controllers\ContentEntryController::class, 'store'])->name('store');
    Route::get('{contentTypeSlug}/{id}', [App\Http\Controllers\ContentEntryController::class, 'show'])->name('show');
    Route::put('{contentTypeSlug}/{id}', [App\Http\Controllers\ContentEntryController::class, 'update'])->name('update');
    Route::delete('{contentTypeSlug}/{id}', [App\Http\Controllers\ContentEntryController::class, 'destroy'])->name('destroy');
    Route::get('{contentTypeSlug}/{id}/history', [App\Http\Controllers\ContentEntryController::class, 'history'])->name('history');
});

// Schema Sync Routes
Route::post('/sync/receive', [\App\Http\Controllers\SchemaSyncController::class, 'receive'])->name('api.sync.receive');

Route::group([
    'middleware' => ['api', 'throttle:api'],
    'prefix' => 'auth'
], function ($router) {
    Route::post('login', [App\Http\Controllers\AuthController::class, 'login'])->middleware('throttle:login');
    Route::post('logout', [App\Http\Controllers\AuthController::class, 'logout']);
    Route::post('refresh', [App\Http\Controllers\AuthController::class, 'refresh']);
    Route::post('me', [App\Http\Controllers\AuthController::class, 'me']);
});
