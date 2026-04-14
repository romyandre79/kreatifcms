<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('ai_conversations', function (Blueprint $row) {
            $row->id();
            $row->foreignId('user_id')->constrained()->onDelete('cascade');
            $row->string('title')->nullable();
            $row->foreignId('last_model_id')->nullable()->constrained('ai_models')->onDelete('set null');
            $row->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('ai_conversations');
    }
};
