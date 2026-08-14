<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            SidebarMenuSeeder::class,
            \Modules\LanguageSwitcher\Database\Seeders\LanguageSwitcherDatabaseSeeder::class,
        ]);

        // Dynamically run all enabled module seeders to conform to modular architecture
        $moduleRepository = app(\Nwidart\Modules\Contracts\RepositoryInterface::class);
        $enabledModules = $moduleRepository->allEnabled();

        // Sort modules to ensure dependency order (e.g. MasterData defines tables/records required by Accounting)
        $seederOrder = ['MasterData', 'Accounting'];
        usort($enabledModules, function ($a, $b) use ($seederOrder) {
            $idxA = array_search($a->getName(), $seederOrder);
            $idxB = array_search($b->getName(), $seederOrder);
            $idxA = $idxA === false ? 999 : $idxA;
            $idxB = $idxB === false ? 999 : $idxB;
            return $idxA <=> $idxB;
        });

        foreach ($enabledModules as $module) {
            // Find the main database seeder class of the module (e.g. Modules\MasterData\Database\Seeders\MasterDataDatabaseSeeder)
            $seederClass = "Modules\\" . $module->getName() . "\\Database\\Seeders\\" . $module->getName() . "DatabaseSeeder";
            if (class_exists($seederClass)) {
                $this->call($seederClass);
            }
        }

        $superAdminRole = \App\Models\Role::where('slug', 'super-admin')->first();

        if (!User::where('email', 'test@example.com')->exists()) {
            User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'role_id' => $superAdminRole ? $superAdminRole->id : null,
            ]);
        }

    }
}
