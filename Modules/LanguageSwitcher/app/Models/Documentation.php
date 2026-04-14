<?php

namespace Modules\LanguageSwitcher\Models;

use Illuminate\Database\Eloquent\Model;

class Documentation extends Model
{
    protected $table = 'documentations';

    protected $fillable = ['key', 'title', 'sections', 'dynamic_data'];

    protected $casts = [
        'title' => 'array',
        'sections' => 'array',
        'dynamic_data' => 'array',
    ];

    /**
     * Get active documentation for a specific key and locale.
     */
    public static function getByKey(string $key)
    {
        return self::where('key', $key)->first();
    }
}
