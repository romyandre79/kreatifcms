<?php

namespace Modules\LanguageSwitcher\Models;

use Illuminate\Database\Eloquent\Model;

class Translation extends Model
{
    protected $fillable = ['language_code', 'group', 'key', 'value'];

    /**
     * Get translations for a specific language.
     */
    public static function getForLanguage(string $code)
    {
        return self::where('language_code', $code)
            ->get()
            ->groupBy('group')
            ->map(function ($items) {
                return $items->pluck('value', 'key');
            });
    }
}
