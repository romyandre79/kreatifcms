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
        Schema::create('brevo_campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['email', 'whatsapp'])->default('email');
            $table->string('subject')->nullable();
            $table->longText('content')->nullable();
            $table->string('status')->default('draft');
            $table->string('brevo_id')->nullable();
            $table->json('stats')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamps();
        });

        Schema::create('brevo_inbound_emails', function (Blueprint $table) {
            $table->id();
            $table->string('from_email');
            $table->string('from_name')->nullable();
            $table->string('subject')->nullable();
            $table->longText('content_html')->nullable();
            $table->longText('content_text')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('brevo_inbound_emails');
        Schema::dropIfExists('brevo_campaigns');
    }
};
