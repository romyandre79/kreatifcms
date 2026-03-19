<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['module', 'key', 'value'];

    /**
     * Get a setting value.
     */
    public static function get(string $module, string $key, $default = null)
    {
        $setting = self::where('module', $module)->where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Set a setting value.
     */
    public static function set(string $module, string $key, $value)
    {
        return self::updateOrCreate(
            ['module' => $module, 'key' => $key],
            ['value' => $value]
        );
    }
}
