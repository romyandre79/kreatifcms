<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Role;
use App\Models\Permission;
use Modules\ContentType\Models\ContentType;
use App\Models\Page;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create Super Admin Role
        $superAdmin = Role::firstOrCreate(
            ['slug' => 'super-admin'],
            [
                'name' => 'Super Admin',
                'description' => 'Has full access to everything.'
            ]
        );

        $actions = ['create', 'read', 'update', 'delete', 'publish'];

        // 2. Grant Permissions for Core Subjects
        $coreSubjects = [
            ['name' => 'Permissions', 'slug' => 'permissions'],
            ['name' => 'Roles', 'slug' => 'roles'],
            ['name' => 'Users', 'slug' => 'users'],
            ['name' => 'Media', 'slug' => 'media'],
            ['name' => 'Settings', 'slug' => 'settings'],
            ['name' => 'Plugins', 'slug' => 'plugins'],
            ['name' => 'Pages', 'slug' => 'pages'],
        ];

        foreach ($coreSubjects as $subject) {
            foreach ($actions as $action) {
                Permission::updateOrCreate(
                    [
                        'role_id' => $superAdmin->id,
                        'content_type' => $subject['slug'],
                        'action' => $action,
                    ],
                    [
                        'name' => $subject['name'],
                        'enabled' => true
                    ]
                );
            }
        }

        // 3. Grant Permissions for existing Content Types
        $contentTypes = ContentType::all();
        foreach ($contentTypes as $ct) {
            $groupName = ($ct->type === 'collection' || !$ct->type) ? 'Collection Types' : 'Single Types';
            foreach ($actions as $action) {
                Permission::updateOrCreate(
                    [
                        'role_id' => $superAdmin->id,
                        'content_type' => $ct->slug,
                        'action' => $action,
                    ],
                    [
                        'name' => $groupName,
                        'enabled' => true
                    ]
                );
            }
        }

        // 4. Grant Permissions for existing Pages (if they have unique slugs)
        $pages = Page::all();
        foreach ($pages as $page) {
            foreach ($actions as $action) {
                Permission::updateOrCreate(
                    [
                        'role_id' => $superAdmin->id,
                        'content_type' => $page->slug,
                        'action' => $action,
                    ],
                    [
                        'name' => 'Pages',
                        'enabled' => true
                    ]
                );
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $role = Role::where('slug', 'super-admin')->first();
        if ($role) {
            $role->permissions()->delete();
            $role->delete();
        }
    }
};
