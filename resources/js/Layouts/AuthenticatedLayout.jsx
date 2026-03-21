import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    LayoutDashboard,
    Layout,
    Database,
    Puzzle,
    Users,
    UserCheck,
    Truck,
    ChevronLeft,
    Menu,
    LogOut,
    User as UserIcon,
    Settings,
    X,
    Shield,
    HardDrive,
    FileText,
    Image as ImageIcon
} from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash, plugins = [] } = usePage().props;
    const user = auth.user;

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard, active: route().current('dashboard') },
        { name: 'Pages', href: route('pages.index'), icon: FileText, active: route().current('pages.*') },
        { name: 'Blocks', href: route('blocks.index'), icon: FileText, active: route().current('blocks.*') },
        { name: 'Layout Editor', href: route('layouts.index'), icon: Layout, active: route().current('layouts.index') },
        { name: 'Media Library', href: route('media.index'), icon: ImageIcon, active: route().current('media.*') },
        { name: 'Content Type', href: route('content-types.index'), icon: Database, active: route().current('content-types.*') && !route().current('content-types.data.*') },
        { name: 'Plugins', href: route('plugins.index'), icon: Puzzle, active: route().current('plugins.*') },
        { name: 'Users', href: route('users.index'), icon: Users, active: route().current('users.*') },
        { name: 'Roles', href: route('roles.index'), icon: Shield, active: route().current('roles.*') },
    ];

    if (plugins.some(p => p.alias === 'databasemanager') && route().has('settings.database.index')) {
        navItems.push({ name: 'Database', href: route('settings.database.index'), icon: HardDrive, active: route().current('settings.database.*') });
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Desktop Sidebar */}
            <aside
                className={`${sidebarOpen ? 'w-64' : 'w-20'} hidden md:flex bg-white border-r border-gray-200 transition-all duration-300 flex-col fixed inset-y-0 z-50`}
            >
                {/* Sidebar Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
                    <Link href="/" className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                        <ApplicationLogo className="h-8 w-auto fill-current text-indigo-600 shrink-0" />
                        {sidebarOpen && <span className="font-bold text-lg text-gray-800">Kreatif CMS</span>}
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <ChevronLeft className={`w-4 h-4 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Sidebar Nav */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${item.active
                                    ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                } ${!sidebarOpen ? 'justify-center mx-1' : ''}`}
                            title={!sidebarOpen ? item.name : ''}
                        >
                            <item.icon className={`w-5 h-5 shrink-0 transition-colors ${item.active ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'} ${item.active ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                            {sidebarOpen && <span className="truncate">{item.name}</span>}
                            {sidebarOpen && item.active && (
                                <div className="ml-auto w-2 h-2 rounded-full bg-indigo-600 animate-in zoom-in duration-300" />
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-100">
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className={`flex items-center gap-3 w-full text-left rounded-lg p-2 hover:bg-gray-50 transition-colors ${!sidebarOpen ? 'justify-center' : ''}`}>
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 ring-2 ring-white text-xs font-bold">
                                    {user.name.charAt(0)}
                                </div>
                                {sidebarOpen && (
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                )}
                            </button>
                        </Dropdown.Trigger>

                        <Dropdown.Content align={sidebarOpen ? 'top' : 'top-right'} width="48">
                            <Dropdown.Link href={route('profile.edit')}>
                                <div className="flex items-center gap-2">
                                    <Settings className="w-4 h-4" />
                                    Profile
                                </div>
                            </Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button">
                                <div className="flex items-center gap-2 text-red-600">
                                    <LogOut className="w-4 h-4" />
                                    Log Out
                                </div>
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            <div className={`fixed inset-0 z-50 md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-gray-900/50" onClick={() => setMobileMenuOpen(false)} />
                <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col">
                    <div className="h-16 flex items-center justify-between px-4 border-b">
                        <div className="flex items-center gap-2">
                            <ApplicationLogo className="h-8 w-auto fill-current text-indigo-600" />
                            <span className="font-bold text-lg text-gray-800">Kreatif CMS</span>
                        </div>
                        <button onClick={() => setMobileMenuOpen(false)}>
                            <X className="w-6 h-6 text-gray-400" />
                        </button>
                    </div>
                    <nav className="flex-1 px-3 py-4 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${item.active ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${item.active ? 'text-indigo-600 stroke-[2.5px]' : 'text-gray-400 stroke-2'}`} />
                                {item.name}
                                {item.active && <div className="ml-auto w-2 h-2 rounded-full bg-indigo-600" />}
                            </Link>
                        ))}
                    </nav>
                </aside>
            </div>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-40">
                    <div className="flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2 -ml-2 text-gray-400 hover:text-gray-600 md:hidden"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        {header && (
                            <div className="ml-4 md:ml-0 font-semibold text-lg text-gray-800">
                                {header}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Right side Profile dropdown for mobile when sidebar is small or closed */}
                        <div className="md:hidden">
                            <Link href={route('profile.edit')} className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <UserIcon className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="p-6">
                    {flash?.success && (
                        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 text-green-700 rounded-lg animate-in slide-in-from-top-4 duration-300">
                            <p className="text-sm font-medium">{flash.success}</p>
                        </div>
                    )}

                    {flash?.error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-lg animate-in slide-in-from-top-4 duration-300">
                            <p className="text-sm font-medium">{flash.error}</p>
                        </div>
                    )}

                    <div className="animate-in fade-in duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
