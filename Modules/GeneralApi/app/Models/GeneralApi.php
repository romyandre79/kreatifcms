<?php

namespace Modules\GeneralApi\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class GeneralApi extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'type',
        'method',
        'target_url',
        'target_method',
        'headers',
        'payload_mapping',
        'php_code',
        'is_active',
        'settings',
    ];

    protected $casts = [
        'headers' => 'array',
        'payload_mapping' => 'array',
        'is_active' => 'boolean',
        'settings' => 'array',
    ];
}
