<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Super Admin', 
                'slug' => 'super-admin',
                'description' => 'Super Admins can access and manage all features and settings.'
            ],
            [
                'name' => 'Editor', 
                'slug' => 'editor',
                'description' => 'Editors can manage and publish contents including those of others.'
            ],
            [
                'name' => 'Author', 
                'slug' => 'author',
                'description' => 'Authors can manage the content they have created.'
            ],
        ];

        foreach ($roles as $role) {
            \App\Models\Role::updateOrCreate(['slug' => $role['slug']], $role);
        }
    }
}
