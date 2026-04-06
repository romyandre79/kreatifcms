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
        Schema::create('layouts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->json('header_blocks')->nullable();
            $table->json('footer_blocks')->nullable();
            $table->json('theme_data')->nullable();
            $table->enum('access_type', ['general', 'authenticated', 'role'])->default('general');
            $table->json('roles')->nullable(); // Store allowed role names if access_type is 'role'
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('layouts');
    }
};
