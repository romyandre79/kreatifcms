<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DashboardWidget extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'content_type_id',
        'aggregate_function',
        'aggregate_field',
        'group_by_field',
        'settings',
        'order',
        'width',
    ];

    protected $casts = [
        'settings' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function contentType()
    {
        return $this->belongsTo(ContentType::class);
    }
}
