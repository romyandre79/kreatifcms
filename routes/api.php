<?php

use Modules\ContentType\Http\Controllers\ContentTypeController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware(['auth:api', 'throttle:api'])->group(function () {
    Route::middleware(['permission:content-types,read'])->group(function () {
        Route::apiResource('content-types', ContentTypeController::class)->names([
            'index' => 'api.content-types.index',
            'store' => 'api.content-types.store',
            'show' => 'api.content-types.show',
            'update' => 'api.content-types.update',
            'destroy' => 'api.content-types.destroy',
        ]);
        
        // Apply more restrictive permissions to specific routes within the resource
        Route::post('content-types', [ContentTypeController::class, 'store'])->middleware('permission:content-types,create');
        Route::match(['put', 'patch'], 'content-types/{content_type}', [ContentTypeController::class, 'update'])->middleware('permission:content-types,update');
        Route::delete('content-types/{content_type}', [ContentTypeController::class, 'destroy'])->middleware('permission:content-types,delete');
    });

    Route::name('api.')->group(function () {
        Route::middleware(['permission:users,read'])->group(function () {
            Route::apiResource('users', App\Http\Controllers\UserController::class);
        });
        Route::middleware(['permission:roles,read'])->group(function () {
            Route::apiResource('roles', App\Http\Controllers\RoleController::class)->only(['index']);
        });
    });

    // Generic CMS Content Entry Routes (Protected by JWT and Permissions)
    Route::prefix('content')->name('api.content.')->group(function () {
        // We use a custom logic or dynamic middleware if possible, 
        // but since we need the slug from the URL, we might need to handle this in the middleware or controller.
        // For now, we apply a base 'read' check if they are just viewing, 
        // but actually the CheckPermission middleware needs the contentType name.
        // We can pass the slug dynamicly in a custom way or update CheckPermission to handle it.
        
        Route::get('{contentTypeSlug}', [\Modules\ContentType\Http\Controllers\ContentEntryController::class, 'index'])->name('index');
        Route::post('{contentTypeSlug}', [\Modules\ContentType\Http\Controllers\ContentEntryController::class, 'store'])->name('store');
        Route::get('{contentTypeSlug}/{id}', [\Modules\ContentType\Http\Controllers\ContentEntryController::class, 'show'])->name('show');
        Route::put('{contentTypeSlug}/{id}', [\Modules\ContentType\Http\Controllers\ContentEntryController::class, 'update'])->name('update');
        Route::delete('{contentTypeSlug}/{id}', [\Modules\ContentType\Http\Controllers\ContentEntryController::class, 'destroy'])->name('destroy');
        Route::get('{contentTypeSlug}/{id}/history', [\Modules\ContentType\Http\Controllers\ContentEntryController::class, 'history'])->name('history');
    });
});

// Schema Sync Routes
Route::post('/sync/receive', [\Modules\ContentType\Http\Controllers\SchemaSyncController::class, 'receive'])->name('api.sync.receive');

Route::group([
    'middleware' => ['api', 'throttle:api'],
    'prefix' => 'auth'
], function ($router) {
    Route::post('login', [App\Http\Controllers\AuthController::class, 'login'])->middleware('throttle:login');
    Route::post('logout', [App\Http\Controllers\AuthController::class, 'logout']);
    Route::post('refresh', [App\Http\Controllers\AuthController::class, 'refresh']);
    Route::post('me', [App\Http\Controllers\AuthController::class, 'me']);
});
