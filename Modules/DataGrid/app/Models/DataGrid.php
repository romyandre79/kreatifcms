<?php

namespace Modules\DataGrid\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Modules\DataGrid\Database\Factories\DataGridFactory;

class DataGrid extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'content_type_id',
        'settings',
        'buttons'
    ];

    protected $casts = [
        'settings' => 'array',
        'buttons' => 'array'
    ];

    public function contentType()
    {
        return $this->belongsTo(\Modules\ContentType\Models\ContentType::class, 'content_type_id');
    }
}

