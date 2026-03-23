import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { Globe, ChevronDown, Menu, X } from 'lucide-react';

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
                        {links.map((link, i) => (
                            <div key={i} className="relative group">
                                <a 
                                    href={link.url} 
                                    className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors flex items-center gap-1"
                                >
                                    {link.label}
                                    {link.dropdown && <ChevronDown className="w-3 h-3 text-gray-400" aria-hidden="true" />}
                                </a>
                            </div>
                        ))}
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
                    {links.map((link, i) => (
                        <a
                            key={i}
                            href={link.url}
                            className="block px-3 py-3 rounded-xl text-base font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        >
                            {link.label}
                        </a>
                    ))}
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
                </div>
            </div>
        </nav>
    );
};

export default NavBarBlock;
