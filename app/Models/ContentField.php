<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ContentField extends Model
{
    protected $fillable = ['content_type_id', 'name', 'type', 'required', 'options', 'description'];

    protected $casts = [
        'options' => 'array',
        'required' => 'boolean',
    ];

    protected $appends = ['attribute_name'];

    public function getAttributeNameAttribute()
    {
        return Str::snake($this->name);
    }

    public function contentType()
    {
        return $this->belongsTo(ContentType::class);
    }
}
