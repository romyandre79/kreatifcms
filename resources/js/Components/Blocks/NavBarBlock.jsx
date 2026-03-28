import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { Globe, ChevronDown, Menu, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const NavBarBlock = ({ data = {} }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { auth } = usePage().props;
    const isLoggedIn = !!auth?.user;
    const links = Array.isArray(data.links) ? data.links : [];
    const allButtons = data.buttons !== undefined 
        ? (Array.isArray(data.buttons) ? data.buttons : [])
        : [
            { id: 'btn-1', label: 'Login', url: '/login', style: 'ghost', visibility: 'guest' },
            { id: 'btn-2', label: 'Get Started', url: '#', style: 'primary' }
        ];

    // Filter buttons based on auth visibility
    const buttons = allButtons.filter(btn => {
        const vis = btn.visibility || 'always';
        if (vis === 'guest') return !isLoggedIn;
        if (vis === 'auth') return isLoggedIn;
        return true; // 'always'
    });

    const handleButtonClick = (e, btn) => {
        // Backward compat: old 'action' field
        if (btn.action === 'logout') {
            e.preventDefault();
            router.post('/logout');
            return;
        }
        // New events system: execute custom onClick JS
        if (btn.events?.onClick) {
            e.preventDefault();
            try {
                const fn = new Function('event', 'router', 'btn', btn.events.onClick);
                fn(e, router, btn);
            } catch (err) {
                console.error('[Button onClick] error:', err);
            }
        }
    };

    return (
        <nav 
            className={`w-full z-50 transition-all duration-300 ${data.sticky !== false ? 'sticky top-0' : 'relative'} ${data.glass !== false ? 'bg-white/80 backdrop-blur-md border-b border-white/20' : 'bg-white border-b border-gray-100'}`}
        >
            <style dangerouslySetInnerHTML={{ __html: `
                ${buttons.filter(b => b.custom_css).map((btn, i) => `
                    #nav-desktop-btn-${btn.id || i}, #nav-mobile-btn-${btn.id || i} {
                        ${btn.custom_css}
                    }
                `).join('')}
            ` }} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        {data.logo ? (
                            <Link href="/" aria-label="Home">
                                <img src={data.logo} alt="Logo" className="h-8 w-auto" />
                            </Link>
                        ) : (
                            <Link 
                                href="/" 
                                aria-label="Home"
                                className="flex items-center gap-2 font-bold text-gray-900 cursor-pointer"
                            >
                                <Globe className="w-6 h-6 text-indigo-600" aria-hidden="true" />
                                <span>KreatifCMS</span>
                            </Link>
                        )}
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {links.map((link, i) => {
                            const hasChildren = Array.isArray(link.children) && link.children.length > 0;
                            return (
                                <div key={i} className="relative group/nav">
                                    <a 
                                        href={link.url} 
                                        className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors py-5 flex items-center gap-1"
                                    >
                                        {link.label}
                                        {hasChildren && <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover/nav:text-indigo-500 transition-colors" />}
                                    </a>
                                    
                                    {hasChildren && (
                                        <div className="absolute left-0 top-full pt-0 w-48 opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-200 z-[100]">
                                            <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-2 translate-y-2 group-hover/nav:translate-y-0 transition-transform">
                                                {link.children.map((child, ci) => (
                                                    <a 
                                                        key={ci} 
                                                        href={child.url} 
                                                        className="block px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                                    >
                                                        {child.label}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {buttons.length > 0 && (
                            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
                                {buttons.map((btn, i) => (
                                    <a 
                                        key={btn.id || i}
                                        id={`nav-desktop-btn-${btn.id || i}`}
                                        href={btn.action === 'logout' ? '#' : (btn.url || '#')} 
                                        onClick={(e) => handleButtonClick(e, btn)}
                                        className={btn.style === 'primary' 
                                            ? "inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white bg-indigo-700 hover:bg-indigo-800 hover:shadow-indigo-200 transition-all"
                                            : "text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                        }
                                    >
                                        {btn.label}
                                    </a>
                                ))}
                            </div>
                        )}

                        {/* Social Links Desktop */}
                        {Array.isArray(data.social_links) && data.social_links.length > 0 && (
                            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
                                {data.social_links.map((link, i) => {
                                    const IconComponent = LucideIcons[link.icon] || LucideIcons.Globe;
                                    return (
                                        <a 
                                            key={link.id || i} 
                                            href={link.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-gray-400 hover:text-indigo-600 transition-all hover:scale-110"
                                            title={link.icon}
                                        >
                                            <IconComponent className="w-4 h-4" />
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>


                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            aria-expanded={isOpen}
                            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                        >
                            {isOpen ? <X className="block h-6 w-6" aria-hidden="true" /> : <Menu className="block h-6 w-6" aria-hidden="true" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className={`${isOpen ? 'block animate-in slide-in-from-top-2 duration-200' : 'hidden'} md:hidden bg-white border-t border-gray-100 overflow-hidden`}>
                <div className="pt-2 pb-3 space-y-1 px-4">
                    {links.map((link, i) => {
                        const hasChildren = Array.isArray(link.children) && link.children.length > 0;
                        return (
                            <div key={i} className="py-1">
                                <a
                                    href={link.url}
                                    className="flex items-center justify-between px-3 py-3 rounded-xl text-base font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                >
                                    <span>{link.label}</span>
                                </a>
                                {hasChildren && (
                                    <div className="pl-6 space-y-1 mt-1 border-l-2 border-indigo-50 ml-3">
                                        {link.children.map((child, ci) => (
                                            <a 
                                                key={ci} 
                                                href={child.url} 
                                                className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 rounded-lg"
                                            >
                                                {child.label}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {buttons.length > 0 && (
                        <div className="pt-4 pb-4 border-t border-gray-100 mt-2 space-y-2">
                            {buttons.map((btn, i) => (
                                <a 
                                    key={btn.id || i}
                                    id={`nav-mobile-btn-${btn.id || i}`}
                                    href={btn.action === 'logout' ? '#' : (btn.url || '#')} 
                                    onClick={(e) => handleButtonClick(e, btn)}
                                    className={btn.style === 'primary'
                                        ? "block px-4 py-3 rounded-xl text-center text-base font-bold text-white bg-indigo-700 shadow-lg shadow-indigo-100"
                                        : "block px-3 py-3 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 uppercase tracking-widest text-[10px]"
                                    }
                                >
                                    {btn.label}
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Social Links Mobile */}
                    {Array.isArray(data.social_links) && data.social_links.length > 0 && (
                        <div className="pt-4 border-t border-gray-100 mt-2 flex justify-center gap-6 pb-4">
                            {data.social_links.map((link, i) => {
                                const IconComponent = LucideIcons[link.icon] || LucideIcons.Globe;
                                return (
                                    <a 
                                        key={link.id || i} 
                                        href={link.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                                    >
                                        <IconComponent className="w-6 h-6" />
                                    </a>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

        </nav>
    );
};

export default NavBarBlock;
