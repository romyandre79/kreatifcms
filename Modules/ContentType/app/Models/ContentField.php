<?php

namespace Modules\ContentType\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ContentField extends Model
{
    protected $fillable = ['content_type_id', 'name', 'type', 'required', 'is_unique', 'is_translatable', 'options', 'description', 'sort_order'];

    protected $casts = [
        'options' => 'array',
        'required' => 'boolean',
        'is_unique' => 'boolean',
        'is_translatable' => 'boolean',
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
