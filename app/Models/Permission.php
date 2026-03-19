<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    protected $fillable = [
        'role_id',
        'name',
        'content_type',
        'action',
        'enabled'
    ];

    protected $casts = [
        'enabled' => 'boolean'
    ];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }
}
