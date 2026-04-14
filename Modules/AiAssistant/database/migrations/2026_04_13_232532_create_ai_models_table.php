<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ai_models', function (Blueprint $row) {
            $row->id();
            $row->string('name');
            $row->string('provider'); // openai, gemini, ollama
            $row->string('model_name'); // e.g., gpt-4o, gemini-1.5-flash
            $row->string('api_key')->nullable();
            $row->string('base_url')->nullable();
            $row->boolean('is_active')->default(true);
            $row->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_models');
    }
};
