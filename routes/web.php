<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [App\Http\Controllers\Frontend\PageRendererController::class, 'home'])->name('home');

Route::get('/dashboard', function () {
    $contentTypes = [];
    $isContentEnabled = class_exists('Modules\ContentType\Models\ContentType') && 
                       ($module = \Nwidart\Modules\Facades\Module::find('ContentType')) && 
                       $module->isEnabled();

    if ($isContentEnabled) {
        $contentTypes = \Modules\ContentType\Models\ContentType::with('fields')->get();
    }
    return Inertia::render('Dashboard', [
        'contentTypes' => $contentTypes
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // CMS Builder Routes moved to ContentType module

    // Page Builder
    Route::middleware(['permission:media,read'])->group(function () {
        Route::post('/media/upload', [\Modules\MediaLibrary\Http\Controllers\MediaController::class, 'upload'])->name('media.upload')->middleware('permission:media,create');
        Route::resource('media', \Modules\MediaLibrary\Http\Controllers\MediaController::class)->except(['create', 'edit', 'update']);
        // Override resource routes with specific permissions if needed, but resource already covers it.
        // index -> read, store -> create, show -> read, destroy -> delete
    });

    Route::middleware(['permission:pages,read'])->group(function () {
        Route::resource('pages', App\Http\Controllers\PageController::class);
        Route::post('/pages/{page}/set-home', [App\Http\Controllers\PageController::class, 'setHome'])->name('pages.set-home')->middleware('permission:pages,update');
    });
    
    // Module Routes
    Route::middleware(['permission:blocks,read'])->group(function () {
        Route::resource('blocks', \Modules\ReusableBlock\Http\Controllers\BlockController::class);
    });

    Route::middleware(['permission:seo,read'])->group(function () {
        Route::get('/seo', [\Modules\Seo\Http\Controllers\SeoController::class, 'index'])->name('seo.index');
        Route::post('/seo/settings', [\Modules\Seo\Http\Controllers\SeoController::class, 'updateSettings'])->name('seo.settings.update')->middleware('permission:seo,update');
    });
    
    // CMS Content Entry Routes moved to ContentType module

    // Plugin Management Routes
    Route::middleware(['permission:plugins,read'])->group(function () {
        Route::get('/plugins', [App\Http\Controllers\PluginController::class, 'index'])->name('plugins.index');
        Route::post('/plugins/{name}/enable', [App\Http\Controllers\PluginController::class, 'enable'])->name('plugins.enable')->middleware('permission:plugins,update');
        Route::post('/plugins/{name}/disable', [App\Http\Controllers\PluginController::class, 'disable'])->name('plugins.disable')->middleware('permission:plugins,update');
        Route::get('/plugins/{name}/export', [App\Http\Controllers\PluginController::class, 'export'])->name('plugins.export');
        Route::post('/plugins/import', [App\Http\Controllers\PluginController::class, 'import'])->name('plugins.import')->middleware('permission:plugins,create');
        Route::delete('/plugins/{name}', [App\Http\Controllers\PluginController::class, 'destroy'])->name('plugins.destroy')->middleware('permission:plugins,delete');
        Route::post('/plugins/{name}/settings', [App\Http\Controllers\PluginController::class, 'updateSettings'])->name('plugins.settings.update')->middleware('permission:plugins,update');
    });

    // Email Template Routes
    Route::middleware(['permission:email-templates,read'])->group(function () {
        Route::resource('email-templates', \Modules\EmailTemplates\Http\Controllers\EmailTemplatesController::class);
    });

    // Job Manager Routes
    Route::middleware(['permission:jobs,read'])->group(function () {
        Route::get('/jobs', [\Modules\JobManager\Http\Controllers\JobController::class, 'index'])->name('jobmanager.index');
        Route::post('/jobs/dispatch', [\Modules\JobManager\Http\Controllers\JobController::class, 'dispatch'])->name('jobmanager.dispatch')->middleware('permission:jobs,update');

        // Scheduled Job Routes
        Route::post('/jobs/scheduled', [\Modules\JobManager\Http\Controllers\JobController::class, 'storeScheduled'])->name('jobmanager.scheduled.store')->middleware('permission:jobs,create');
        Route::put('/jobs/scheduled/{scheduledJob}', [\Modules\JobManager\Http\Controllers\JobController::class, 'updateScheduled'])->name('jobmanager.scheduled.update')->middleware('permission:jobs,update');
        Route::delete('/jobs/scheduled/{scheduledJob}', [\Modules\JobManager\Http\Controllers\JobController::class, 'destroyScheduled'])->name('jobmanager.scheduled.destroy')->middleware('permission:jobs,delete');
    });

    // User & Role Management Routes
    Route::middleware(['permission:users,read'])->group(function () {
        Route::resource('users', App\Http\Controllers\UserController::class);
    });
    Route::middleware(['permission:roles,read'])->group(function () {
        Route::resource('roles', App\Http\Controllers\RoleController::class);
    });

    // System Update Routes
    Route::middleware(['permission:system,update'])->group(function () {
        Route::get('/system/update', [App\Http\Controllers\SystemUpdateController::class, 'index'])->name('system.update.index');
        Route::post('/system/update/check', [App\Http\Controllers\SystemUpdateController::class, 'check'])->name('system.update.check');
        Route::post('/system/update/run', [App\Http\Controllers\SystemUpdateController::class, 'run'])->name('system.update.run');
        Route::post('/system/update/diagnostics', [App\Http\Controllers\SystemUpdateController::class, 'diagnostics'])->name('system.update.diagnostics');
    });

    // Dashboard Widget Routes
    Route::get('/api/dashboard/widgets', [App\Http\Controllers\DashboardWidgetController::class, 'index'])->name('dashboard.widgets.index');
    Route::post('/api/dashboard/widgets', [App\Http\Controllers\DashboardWidgetController::class, 'store'])->name('dashboard.widgets.store');
    Route::put('/api/dashboard/widgets/{widget}', [App\Http\Controllers\DashboardWidgetController::class, 'update'])->name('dashboard.widgets.update');
    Route::delete('/api/dashboard/widgets/{widget}', [App\Http\Controllers\DashboardWidgetController::class, 'destroy'])->name('dashboard.widgets.destroy');
});

require __DIR__.'/auth.php';

// Dynamic Page Routing - Must be at the very bottom to act as a fallback catch-all
Route::get('/{slug}', [App\Http\Controllers\Frontend\PageRendererController::class, 'show'])->name('pages.show');
