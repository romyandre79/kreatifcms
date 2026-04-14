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
        Schema::create('ai_usage', function (Blueprint $row) {
            $row->id();
            $row->foreignId('ai_model_id')->constrained('ai_models')->onDelete('cascade');
            $row->integer('prompt_tokens')->default(0);
            $row->integer('completion_tokens')->default(0);
            $row->integer('total_tokens')->default(0);
            $row->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_usage');
    }
};
