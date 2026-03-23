<?php

use Illuminate\Support\Facades\Route;
use Modules\AiAssistant\Http\Controllers\AiAssistantController;

Route::post('/chat', [AiAssistantController::class, 'chat'])->name('ai.chat');
