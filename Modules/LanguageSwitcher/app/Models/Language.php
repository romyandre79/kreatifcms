<?php

namespace Modules\LanguageSwitcher\Models;

use Illuminate\Database\Eloquent\Model;

class Language extends Model
{
    protected $fillable = ['code', 'name', 'flag', 'is_default', 'is_active'];

    protected $casts = [
        'is_default' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Get the default language.
     */
    public static function getDefault()
    {
        return self::where('is_default', true)->first() ?: self::where('is_active', true)->first();
    }
}
