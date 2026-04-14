<?php

namespace Modules\AiAssistant\Models;

use Illuminate\Database\Eloquent\Model;

class AiUsage extends Model
{
    protected $table = 'ai_usage';
    
    public $timestamps = false;

    protected $fillable = [
        'ai_model_id',
        'prompt_tokens',
        'completion_tokens',
        'total_tokens',
        'created_at',
    ];

    public function aiModel()
    {
        return $this->belongsTo(AiModel::class);
    }
}
