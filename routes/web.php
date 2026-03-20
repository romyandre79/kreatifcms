<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [App\Http\Controllers\Frontend\PageRendererController::class, 'home'])->name('home');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard', [
        'contentTypes' => \App\Models\ContentType::with('fields')->get()
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // CMS Builder Routes
    Route::get('/builder/content-types', [App\Http\Controllers\ContentTypeController::class, 'index'])->name('content-types.index');
    Route::get('/builder/content-types/create', [App\Http\Controllers\ContentTypeController::class, 'create'])->name('content-types.create');
    Route::post('/builder/content-types', [App\Http\Controllers\ContentTypeController::class, 'store'])->name('content-types.store');
    Route::get('/builder/content-types/{contentType}/edit', [App\Http\Controllers\ContentTypeController::class, 'edit'])->name('content-types.edit');
    Route::put('/builder/content-types/{contentType}', [App\Http\Controllers\ContentTypeController::class, 'update'])->name('content-types.update');
    Route::delete('/builder/content-types/{contentType}', [App\Http\Controllers\ContentTypeController::class, 'destroy'])->name('content-types.destroy');
    Route::post('/builder/content-types/{contentType}/push', [App\Http\Controllers\SchemaSyncController::class, 'push'])->name('content-types.push');

    // Page Builder & Media
    Route::post('/media/upload', [App\Http\Controllers\MediaController::class, 'upload'])->name('media.upload');
    Route::resource('media', App\Http\Controllers\MediaController::class)->except(['create', 'edit', 'update']);
    Route::resource('pages', App\Http\Controllers\PageController::class);
    
    // Module Routes
    Route::resource('blocks', \Modules\ReusableBlock\Http\Controllers\BlockController::class);
    Route::get('/seo', [\Modules\Seo\Http\Controllers\SeoController::class, 'index'])->name('seo.index');
    Route::post('/seo/settings', [\Modules\Seo\Http\Controllers\SeoController::class, 'updateSettings'])->name('seo.settings.update');
    
    // Layout Editor
    Route::get('/layouts', [App\Http\Controllers\LayoutController::class, 'index'])->name('layouts.index');
    Route::post('/layouts', [App\Http\Controllers\LayoutController::class, 'update'])->name('layouts.update');

    // CMS Content Entry Routes
    Route::get('/builder/content-data', [App\Http\Controllers\ContentEntryController::class, 'dataManager'])->name('content-types.data.index');
    Route::get('/content/{slug}', [App\Http\Controllers\ContentEntryController::class, 'index'])->name('content-entries.index');
    Route::get('/content/{slug}/create', [App\Http\Controllers\ContentEntryController::class, 'create'])->name('content-entries.create');
    Route::post('/content/{slug}', [App\Http\Controllers\ContentEntryController::class, 'store'])->name('content-entries.store');
    Route::get('/content/{slug}/{id}/edit', [App\Http\Controllers\ContentEntryController::class, 'edit'])->name('content-entries.edit');
    Route::put('/content/{slug}/{id}', [App\Http\Controllers\ContentEntryController::class, 'update'])->name('content-entries.update');
    Route::get('/content/{slug}/{id}/history', [App\Http\Controllers\ContentEntryController::class, 'history'])->name('content-entries.history');

    // Plugin Management Routes
    Route::get('/plugins', [App\Http\Controllers\PluginController::class, 'index'])->name('plugins.index');
    Route::post('/plugins/{name}/enable', [App\Http\Controllers\PluginController::class, 'enable'])->name('plugins.enable');
    Route::post('/plugins/{name}/disable', [App\Http\Controllers\PluginController::class, 'disable'])->name('plugins.disable');
    Route::get('/plugins/{name}/export', [App\Http\Controllers\PluginController::class, 'export'])->name('plugins.export');
    Route::post('/plugins/import', [App\Http\Controllers\PluginController::class, 'import'])->name('plugins.import');
    Route::delete('/plugins/{name}', [App\Http\Controllers\PluginController::class, 'destroy'])->name('plugins.destroy');
    Route::post('/plugins/{name}/settings', [App\Http\Controllers\PluginController::class, 'updateSettings'])->name('plugins.settings.update');

    // User & Role Management Routes
    Route::resource('users', App\Http\Controllers\UserController::class);
    Route::resource('roles', App\Http\Controllers\RoleController::class);

    // Dashboard Widget Routes
    Route::get('/api/dashboard/widgets', [App\Http\Controllers\DashboardWidgetController::class, 'index'])->name('dashboard.widgets.index');
    Route::post('/api/dashboard/widgets', [App\Http\Controllers\DashboardWidgetController::class, 'store'])->name('dashboard.widgets.store');
    Route::put('/api/dashboard/widgets/{widget}', [App\Http\Controllers\DashboardWidgetController::class, 'update'])->name('dashboard.widgets.update');
    Route::delete('/api/dashboard/widgets/{widget}', [App\Http\Controllers\DashboardWidgetController::class, 'destroy'])->name('dashboard.widgets.destroy');

    // Database Management Routes
    Route::get('/settings/database', [App\Http\Controllers\DatabaseManagementController::class, 'index'])->name('settings.database.index');
    Route::get('/settings/database/backup', [App\Http\Controllers\DatabaseManagementController::class, 'backup'])->name('settings.database.backup');
    Route::post('/settings/database/restore', [App\Http\Controllers\DatabaseManagementController::class, 'restore'])->name('settings.database.restore');
    Route::post('/settings/database/reset', [App\Http\Controllers\DatabaseManagementController::class, 'reset'])->name('settings.database.reset');
});

require __DIR__.'/auth.php';

// Dynamic Page Routing - Must be at the very bottom to act as a fallback catch-all
Route::get('/{slug}', [App\Http\Controllers\Frontend\PageRendererController::class, 'show'])->name('pages.show');
