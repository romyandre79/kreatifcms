<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('ai_messages', function (Blueprint $row) {
            $row->id();
            $row->foreignId('ai_conversation_id')->constrained('ai_conversations')->onDelete('cascade');
            $row->string('role'); // user, assistant, system
            $row->longText('content');
            $row->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('ai_messages');
    }
};
