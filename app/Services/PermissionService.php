<?php

namespace App\Services;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Support\Str;

class PermissionService
{
    /**
     * Grant full permissions to Super Admin for a given content type or page.
     */
    public function grantSuperAdminPermissions(string $slug, string $groupName)
    {
        $superAdmin = Role::where('slug', 'super-admin')->first();
        
        if (!$superAdmin) {
            return;
        }

        $actions = ['create', 'read', 'update', 'delete', 'publish'];

        foreach ($actions as $action) {
            Permission::updateOrCreate(
                [
                    'role_id' => $superAdmin->id,
                    'content_type' => $slug,
                    'action' => $action,
                ],
                [
                    'name' => $groupName,
                    'enabled' => true
                ]
            );
        }
    }
}
