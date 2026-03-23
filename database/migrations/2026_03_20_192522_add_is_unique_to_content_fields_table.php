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
        Schema::table('content_fields', function (Blueprint $table) {
            $table->boolean('is_unique')->default(false)->after('required');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('content_fields', function (Blueprint $table) {
            $table->dropColumn('is_unique');
        });
    }
};
