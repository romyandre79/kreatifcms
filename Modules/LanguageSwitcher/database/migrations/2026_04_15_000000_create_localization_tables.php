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
        Schema::create('languages', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique(); // en, id, zh, etc.
            $table->string('name');
            $table->string('flag')->nullable(); // emoji or icon name
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('translations', function (Blueprint $table) {
            $table->id();
            $table->string('language_code', 10);
            $table->string('group')->default('general'); // ui, validation, menu, etc.
            $table->string('key');
            $table->text('value');
            $table->timestamps();

            $table->unique(['language_code', 'group', 'key']);
            $table->foreign('language_code')->references('code')->on('languages')->onDelete('cascade');
        });

        Schema::create('documentations', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // dashboard, ai.settings
            $table->json('title'); // {"en": "...", "id": "..."}
            $table->json('sections'); // [{"title": {"en": "..."}, "content": {"en": "..."}}]
            $table->json('dynamic_data')->nullable(); // metadata for placeholders
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documentations');
        Schema::dropIfExists('translations');
        Schema::dropIfExists('languages');
    }
};
