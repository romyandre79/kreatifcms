<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    protected $fillable = ['title', 'slug', 'blocks', 'is_published', 'meta_title', 'meta_description', 'meta_keywords', 'og_image'];

    protected $casts = [
        'blocks' => 'array',
        'is_published' => 'boolean',
    ];
}
