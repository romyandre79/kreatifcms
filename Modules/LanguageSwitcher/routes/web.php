<?php

use Illuminate\Support\Facades\Route;
use Modules\LanguageSwitcher\Http\Controllers\LanguageController;

Route::middleware(['web', 'auth'])->group(function () {
    // Public Switch
    Route::post('languages/switch', [LanguageController::class, 'switch'])->name('languages.switch');

    // Admin Management
    Route::prefix('admin/languages')->group(function () {
        Route::get('/', [LanguageController::class, 'index'])->name('languages.index');
        Route::post('/store', [LanguageController::class, 'storeLanguage'])->name('languages.store');
        Route::delete('/{language}', [LanguageController::class, 'deleteLanguage'])->name('languages.destroy');
        
        Route::post('/translations', [LanguageController::class, 'storeTranslation'])->name('languages.translations.store');
        
        Route::post('/documentation', [LanguageController::class, 'storeDocumentation'])->name('languages.documentation.store');
        Route::delete('/documentation/{id}', [LanguageController::class, 'deleteDocumentation'])->name('languages.documentation.destroy');
    });
});
