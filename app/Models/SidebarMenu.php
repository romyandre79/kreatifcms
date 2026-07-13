<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SidebarMenu extends Model
{
    protected $table = 'sidebar_menus';

    protected $fillable = [
        'name',
        'route_name',
        'icon',
        'parent_id',
        'permission_required',
        'plugin_alias',
        'order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    /**
     * Get parent menu item.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(SidebarMenu::class, 'parent_id');
    }

    /**
     * Get children/sub-menu items.
     */
    public function children(): HasMany
    {
        return $this->hasMany(SidebarMenu::class, 'parent_id')->orderBy('order');
    }
}
