import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Grid,
    LayoutDashboard,
    Layout,
    Database,
    Puzzle,
    Users,
    UserCheck,
    Truck,
    ChevronLeft,
    ChevronDown,
    Menu,
    LogOut,
    User as UserIcon,
    Settings,
    X,
    Shield,
    HardDrive,
    FileText,
    Mail,
    Image as ImageIcon,
    Activity,
    Globe,
    Send,
    HelpCircle,
    GitBranch,
} from 'lucide-react';

import * as Icons from 'lucide-react';
import AiAssistantSidebar from '@/Components/AiAssistantSidebar';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import DocumentationModal from '@/Components/DocumentationModal';
import { BookOpen } from 'lucide-react';

import { useTrans } from '@/Utils/trans';

// Helper to resolve string icons dynamically
const getIconComponent = (iconName) => {
    if (!iconName) return Icons.HelpCircle;
    const Icon = Icons[iconName];
    return Icon || Icons.HelpCircle;
};

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash, plugins = [], localization, active_documentation, sidebarMenus = [] } = usePage().props;
    const { t } = useTrans();
    const user = auth.user;
    const permissions = auth.permissions || [];

    const hasPermission = (contentType, action = 'read') => {
        if (!permissions || permissions.length === 0) return false;
        return permissions.some(p =>
            (p.content_type === '*' || p.content_type === contentType) &&
            (p.action === '*' || p.action === action)
        );
    };

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [docModalOpen, setDocModalOpen] = useState(false);

    /**
     * Safe route helper to prevent Ziggy crashes when routes are missing 
     */
    const safeRoute = (routeName, params = {}) => {
        if (!routeName) return '#';
        // Support direct URL paths/slugs (starts with / or is http/https)
        if (routeName.startsWith('/') || routeName.startsWith('http://') || routeName.startsWith('https://')) {
            return routeName;
        }
        try {
            if (route().has(routeName)) {
                return route(routeName, params);
            }
        } catch (e) {
            console.warn(`Ziggy route error for '${routeName}':`, e.message);
        }
        return '#';
    };

    /**
     * Safe check for active routes.
     */
    const isRouteActive = (routeName) => {
        try {
            if (!routeName) return false;
            // Support direct URL paths/slugs (starts with /)
            if (routeName.startsWith('/')) {
                return window.location.pathname === routeName || window.location.pathname === routeName + '/';
            }
            // Handle content type sub-routes active checking
            if (routeName === 'content-types.index') {
                return route().current('content-types.*') && !route().current('content-types.data.*');
            }
            // Remove index for wildcards
            const pattern = routeName.endsWith('.index') 
                ? routeName.replace('.index', '.*')
                : routeName;
            return route().current(pattern);
        } catch (e) {
            return false;
        }
    };

    // Construct groups structure dynamically based on db data
    const groups = sidebarMenus.map(group => {
        const hasChildren = group.children && group.children.length > 0;
        const subItems = hasChildren ? group.children.map(child => {
            // Try to translate from 'menu' first, then 'general', then fallback to child.name
            let translatedName = t(child.name, 'menu');
            if (translatedName === child.name) {
                translatedName = t(child.name, 'general');
            }
            return {
                name: translatedName,
                href: safeRoute(child.route_name),
                icon: getIconComponent(child.icon),
                active: isRouteActive(child.route_name)
            };
        }) : [];

        let groupTranslatedName = t(group.name.toLowerCase(), 'menu');
        if (groupTranslatedName === group.name.toLowerCase()) {
            groupTranslatedName = t(group.name.toLowerCase(), 'general');
            // If still untranslated, preserve the original title (e.g. Modules, Designer)
            if (groupTranslatedName === group.name.toLowerCase()) {
                groupTranslatedName = group.name;
            }
        }

        return {
            key: group.name.toLowerCase().replace(/\s+/g, '-'),
            name: groupTranslatedName,
            icon: getIconComponent(group.icon),
            items: subItems,
            active: subItems.some(i => i.active)
        };
    }).filter(g => g.items.length > 0);

    // Dynamic state to track open dropdown groups
    const [openGroups, setOpenGroups] = useState(() => {
        const initial = {};
        groups.forEach(g => {
            initial[g.key] = g.active;
        });
        return initial;
    });

    const toggleGroup = (key) => {
        setOpenGroups(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const renderNavGroup = (group, isMobile = false) => {
        const isOpen = openGroups[group.key];
        const hasActiveItem = group.active;

        if (!sidebarOpen && !isMobile) {
            // Minimized sidebar: render active item directly or just the group icon
            return (
                <div key={group.key} className="space-y-1 py-1 border-b border-gray-100 last:border-0">
                    <div className="text-[10px] text-gray-400 font-bold text-center select-none uppercase tracking-wider scale-90 mb-1">
                        {group.name.substring(0, 3)}
                    </div>
                    {group.items.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center justify-center p-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${item.active
                                ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            title={item.name}
                        >
                            <item.icon className={`w-5 h-5 shrink-0 ${item.active ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                        </Link>
                    ))}
                </div>
            );
        }

        return (
            <div key={group.key} className="space-y-1">
                <button
                    onClick={() => toggleGroup(group.key)}
                    className={`flex items-center justify-between w-full px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gray-700 transition-colors ${
                        hasActiveItem ? 'text-indigo-600/80' : ''
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <group.icon className="w-3.5 h-3.5" />
                        <span>{group.name}</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                    <div className="pl-3 space-y-1 border-l-2 border-gray-100 ml-4 animate-in slide-in-from-top-2 duration-150">
                        {group.items.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={isMobile ? () => setMobileMenuOpen(false) : undefined}
                                className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 group ${item.active
                                    ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon className={`w-4 h-4 shrink-0 transition-colors ${item.active ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                <span className="truncate">{item.name}</span>
                                {item.active && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    };

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
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
                    {/* Dashboard always at root */}
                    <Link
                        href={route('dashboard')}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${route().current('dashboard')
                            ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            } ${!sidebarOpen ? 'justify-center mx-1' : ''}`}
                        title={!sidebarOpen ? t('dashboard', 'menu') : ''}
                    >
                        <LayoutDashboard className={`w-5 h-5 shrink-0 transition-colors ${route().current('dashboard') ? 'text-indigo-600 stroke-[2.5px]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                        {sidebarOpen && <span className="truncate">{t('dashboard', 'menu')}</span>}
                        {sidebarOpen && route().current('dashboard') && (
                            <div className="ml-auto w-2 h-2 rounded-full bg-indigo-600" />
                        )}
                    </Link>

                    {/* Nav Groups */}
                    {groups.map(group => renderNavGroup(group))}
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
                                    {t('logout')}
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
                    <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
                        {/* Dashboard always at root */}
                        <Link
                            href={route('dashboard')}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${route().current('dashboard')
                                ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-950'
                                }`}
                        >
                            <LayoutDashboard className={`w-5 h-5 shrink-0 transition-colors ${route().current('dashboard') ? 'text-indigo-600 stroke-[2.5px]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                            <span>{t('dashboard', 'menu')}</span>
                            {route().current('dashboard') && (
                                <div className="ml-auto w-2 h-2 rounded-full bg-indigo-600" />
                            )}
                        </Link>

                        {/* Nav Groups for Mobile */}
                        {groups.map(group => renderNavGroup(group, true))}
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
                        {plugins.some(p => p.alias === 'languageswitcher' && p.enabled !== false) && <LanguageSwitcher />}

                        {active_documentation && plugins.some(p => p.alias === 'languageswitcher' && p.enabled !== false) && (
                            <button
                                onClick={() => setDocModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all font-semibold text-sm shadow-sm"
                                title={t('read_documentation')}
                            >
                                <BookOpen className="w-4 h-4" />
                                <span className="hidden sm:inline">{t('read_documentation')}</span>
                            </button>
                        )}

                        {/* Right side Profile dropdown for mobile when sidebar is small or closed */}
                        <div className="md:hidden">
                            <Link href={route('profile.edit')} className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <UserIcon className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="p-2">
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
            {hasPermission('plugins', 'read') && plugins.some(p => p.alias === 'aiassistant' && p.enabled) && <AiAssistantSidebar />}

            <DocumentationModal
                isOpen={docModalOpen}
                onClose={() => setDocModalOpen(false)}
            />
        </div>
    );
}
