<?php

use Illuminate\Support\Facades\Route;
use Modules\AiAssistant\Http\Controllers\AiAssistantController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/settings', [AiAssistantController::class, 'settings'])->name('ai.settings');
    Route::get('/models', [AiAssistantController::class, 'listModels'])->name('ai.models.list');
    Route::post('/fetch-models', [AiAssistantController::class, 'fetchAvailableModels'])->name('ai.models.fetch');
    Route::post('/chat', [AiAssistantController::class, 'chat'])->name('ai.chat');
    Route::get('/chat/history', [AiAssistantController::class, 'getHistory'])->name('ai.chat.history');
    Route::post('/create-page', [AiAssistantController::class, 'storePageFromAi'])->name('ai.pages.store');
    Route::post('/create-plugin', [AiAssistantController::class, 'createPlugin'])->name('ai.create-plugin');

    // Design Cloner & Font Automation
    Route::post('/design/download-font', [\Modules\AiAssistant\Http\Controllers\DesignClonerController::class, 'downloadFont'])->name('ai.design.font');
    Route::post('/design/scan', [\Modules\AiAssistant\Http\Controllers\DesignClonerController::class, 'scanDesign'])->name('ai.design.scan');
    
    // Model CRUD
    Route::post('/models', [AiAssistantController::class, 'storeModel'])->name('ai.models.store');
    Route::put('/models/{model}', [AiAssistantController::class, 'updateModel'])->name('ai.models.update');
    Route::delete('/models/{model}', [AiAssistantController::class, 'deleteModel'])->name('ai.models.delete');
    Route::post('/models/{model}/default', [AiAssistantController::class, 'setDefault'])->name('ai.models.default');
});
