<?php

namespace App\Traits;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

trait RegistersSidebarMenu
{
    /**
     * Dynamically register or update a sidebar menu item in the database.
     *
     * @param string $name Name of the menu item (e.g. 'File Manager')
     * @param string $routeName Laravel route name (e.g. 'filemanager.index')
     * @param string $icon Lucide icon name (e.g. 'HardDrive')
     * @param string $parentName The parent group name (e.g. 'System' or 'Designer')
     * @param string|null $permissionRequired Permission key (e.g. 'plugins')
     * @param string $pluginAlias The lowercase alias of the plugin (e.g. 'filemanager')
     * @param int $order Sorting order
     * @return void
     */
    protected function registerSidebarMenu(
        string $name,
        string $routeName,
        string $icon,
        string $parentName,
        ?string $permissionRequired,
        string $pluginAlias,
        int $order = 0
    ): void {
        try {
            // Safe-guard to prevent errors during fresh installs/migrations
            if (!Schema::hasTable('sidebar_menus')) {
                return;
            }

            // Find parent group ID dynamically
            $parent = DB::table('sidebar_menus')
                ->whereNull('parent_id')
                ->where('name', $parentName)
                ->first();

            $parentId = $parent ? $parent->id : null;

            // Only insert if the menu item doesn't already exist.
            // This prevents overwriting admin-customized values (order, name, icon, parent)
            // on every application boot.
            $exists = DB::table('sidebar_menus')
                ->where('route_name', $routeName)
                ->where('plugin_alias', $pluginAlias)
                ->exists();

            if (!$exists) {
                DB::table('sidebar_menus')->insert([
                    'name' => $name,
                    'route_name' => $routeName,
                    'icon' => $icon,
                    'parent_id' => $parentId,
                    'permission_required' => $permissionRequired,
                    'plugin_alias' => $pluginAlias,
                    'order' => $order,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning("Failed to dynamically register sidebar menu for {$pluginAlias}: " . $e->getMessage());
        }
    }
}
