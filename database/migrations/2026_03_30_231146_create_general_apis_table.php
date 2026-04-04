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
        Schema::create('general_apis', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('type')->default('bridge'); // bridge, custom
            $table->string('method')->default('GET'); // Incoming method
            $table->string('target_url')->nullable();
            $table->string('target_method')->default('GET');
            $table->json('headers')->nullable();
            $table->json('payload_mapping')->nullable();
            $table->text('php_code')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('settings')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('general_apis');
    }
};
