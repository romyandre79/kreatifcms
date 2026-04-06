<?php

namespace Modules\Layout\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Modules\Layout\Database\Factories\LayoutFactory;

class Layout extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'header_blocks',
        'footer_blocks',
        'theme_data',
        'access_type',
        'roles',
        'is_default'
    ];

    protected $casts = [
        'header_blocks' => 'array',
        'footer_blocks' => 'array',
        'theme_data' => 'array',
        'roles' => 'array',
        'is_default' => 'boolean'
    ];
}
