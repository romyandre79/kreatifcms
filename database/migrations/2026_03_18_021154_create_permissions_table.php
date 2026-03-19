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
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained()->onDelete('cascade');
            $table->string('name'); // e.g. "Collection Types", "Plugins"
            $table->string('content_type')->nullable(); // e.g. "article", "settings"
            $table->string('action'); // e.g. "create", "read", "update", "delete", "publish"
            $table->boolean('enabled')->default(false);
            $table->timestamps();

            $table->unique(['role_id', 'content_type', 'action'], 'role_permission_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permissions');
    }
};
