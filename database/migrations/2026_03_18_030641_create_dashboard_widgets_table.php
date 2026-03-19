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
        Schema::create('dashboard_widgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type'); // 'stats', 'chart', 'list'
            $table->foreignId('content_type_id')->nullable()->constrained('content_types')->onDelete('cascade');
            $table->string('aggregate_function')->nullable(); // 'count', 'sum', 'avg', 'min', 'max'
            $table->string('aggregate_field')->nullable();
            $table->string('group_by_field')->nullable();
            $table->json('settings')->nullable();
            $table->integer('order')->default(0);
            $table->integer('width')->default(4); // 1-12 span
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dashboard_widgets');
    }
};
