<?php

namespace Modules\MediaLibrary\Models;

use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    protected $table = 'media';
    protected $fillable = ['name', 'path', 'mime_type', 'size'];

    public function getIsVideoAttribute()
    {
        return str_starts_with($this->mime_type, 'video/');
    }

    public function getUrlAttribute()
    {
        return asset('storage/' . $this->path);
    }
}
