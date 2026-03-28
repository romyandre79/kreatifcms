<?php

namespace Modules\ContentType\Models;

use Illuminate\Database\Eloquent\Model;

class ContentType extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'icon', 'type', 'events'];

    protected $casts = [
        'events' => 'array',
    ];

    public function fields()
    {
        return $this->hasMany(ContentField::class)->orderBy('sort_order');
    }
}
