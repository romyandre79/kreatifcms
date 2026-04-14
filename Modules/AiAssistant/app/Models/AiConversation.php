<?php

namespace Modules\AiAssistant\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class AiConversation extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'last_model_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function messages()
    {
        return $this->hasMany(AiMessage::class);
    }

    public function lastModel()
    {
        return $this->belongsTo(AiModel::class, 'last_model_id');
    }
}
