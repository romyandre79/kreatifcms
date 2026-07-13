<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $system = DB::table('sidebar_menus')->where('name', 'System')->first();
        if ($system) {
            $exists = DB::table('sidebar_menus')->where('route_name', 'sidebar-menus.index')->exists();
            if (!$exists) {
                DB::table('sidebar_menus')->insert([
                    'name' => 'menus',
                    'route_name' => 'sidebar-menus.index',
                    'icon' => 'Menu',
                    'parent_id' => $system->id,
                    'permission_required' => 'menus',
                    'plugin_alias' => null,
                    'order' => 45,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Grant permission to super admin (role id 1 or name superadmin)
        $superAdminRole = DB::table('roles')->where('name', 'superadmin')->first();
        if ($superAdminRole) {
            $actions = ['read', 'create', 'update', 'delete'];
            foreach ($actions as $action) {
                $permExists = DB::table('permissions')
                    ->where('role_id', $superAdminRole->id)
                    ->where('content_type', 'menus')
                    ->where('action', $action)
                    ->exists();
                
                if (!$permExists) {
                    DB::table('permissions')->insert([
                        'role_id' => $superAdminRole->id,
                        'content_type' => 'menus',
                        'action' => $action,
                        'enabled' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('sidebar_menus')->where('route_name', 'sidebar-menus.index')->delete();
        DB::table('permissions')->where('content_type', 'menus')->delete();
    }
};
