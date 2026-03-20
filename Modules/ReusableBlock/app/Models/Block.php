<?php

namespace Modules\ReusableBlock\Models;

use Illuminate\Database\Eloquent\Model;

class Block extends Model
{
    protected $fillable = [
        'name',
        'type',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
    ];
}
