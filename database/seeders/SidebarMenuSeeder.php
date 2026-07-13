<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SidebarMenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Disable foreign key checks for truncation safety
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('sidebar_menus')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 1. Dashboard (No parent)
        DB::table('sidebar_menus')->insert([
            'name' => 'dashboard',
            'route_name' => 'dashboard',
            'icon' => 'LayoutDashboard',
            'parent_id' => null,
            'permission_required' => null,
            'plugin_alias' => null,
            'order' => 10,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Designer Group (Parent)
        $designerId = DB::table('sidebar_menus')->insertGetId([
            'name' => 'Designer',
            'route_name' => null,
            'icon' => 'Layout',
            'parent_id' => null,
            'permission_required' => null,
            'plugin_alias' => null,
            'order' => 20,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Designer Children (Core only)
        $designerChildren = [
            ['name' => 'pages', 'route_name' => 'pages.index', 'icon' => 'FileText', 'permission' => 'pages', 'plugin' => null, 'order' => 21],
            ['name' => 'blocks', 'route_name' => 'blocks.index', 'icon' => 'FileText', 'permission' => 'reusableblock', 'plugin' => null, 'order' => 22],
        ];

        foreach ($designerChildren as $child) {
            DB::table('sidebar_menus')->insert([
                'name' => $child['name'],
                'route_name' => $child['route_name'],
                'icon' => $child['icon'],
                'parent_id' => $designerId,
                'permission_required' => $child['permission'],
                'plugin_alias' => $child['plugin'],
                'order' => $child['order'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 3. System Group (Parent)
        $systemId = DB::table('sidebar_menus')->insertGetId([
            'name' => 'System',
            'route_name' => null,
            'icon' => 'Settings',
            'parent_id' => null,
            'permission_required' => null,
            'plugin_alias' => null,
            'order' => 40,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // System Children (Core only)
        $systemChildren = [
            ['name' => 'plugins', 'route_name' => 'plugins.index', 'icon' => 'Puzzle', 'permission' => 'plugins', 'plugin' => null, 'order' => 41],
            ['name' => 'users', 'route_name' => 'users.index', 'icon' => 'Users', 'permission' => 'users', 'plugin' => null, 'order' => 42],
            ['name' => 'roles', 'route_name' => 'roles.index', 'icon' => 'Shield', 'permission' => 'roles', 'plugin' => null, 'order' => 43],
            ['name' => 'menus', 'route_name' => 'sidebar-menus.index', 'icon' => 'Menu', 'permission' => 'menus', 'plugin' => null, 'order' => 45],
            ['name' => 'system', 'route_name' => 'system.update.index', 'icon' => 'Settings', 'permission' => 'system', 'plugin' => null, 'order' => 47],
        ];

        foreach ($systemChildren as $child) {
            DB::table('sidebar_menus')->insert([
                'name' => $child['name'],
                'route_name' => $child['route_name'],
                'icon' => $child['icon'],
                'parent_id' => $systemId,
                'permission_required' => $child['permission'],
                'plugin_alias' => $child['plugin'],
                'order' => $child['order'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }


    }
}
