import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { Globe, ChevronDown, Menu, X, Search, ShoppingCart } from 'lucide-react';
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
        if (btn.action === 'logout') {
            e.preventDefault();
            router.post('/logout');
            return;
        }
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

    const baseComposition = Array.isArray(data.composition) ? data.composition : ['logo', 'links', 'buttons', 'social_links'];
    const composition = baseComposition;

    const renderLogo = (isMobile = false) => {
        const textColor = data.text_color || (isMobile ? '#374151' : '#111827');
        return (
            <div key="logo" className={`${isMobile ? 'py-4 border-b border-gray-100 flex justify-center mb-2' : 'flex-shrink-0 flex items-center pr-8'}`}>
                {data.logo ? (
                    <Link href="/" aria-label="Home">
                        <img src={data.logo} alt="Logo" className={isMobile ? "h-10 w-auto" : "h-8 w-auto"} />
                    </Link>
                ) : (
                    <Link 
                        href="/" 
                        aria-label="Home"
                        className="flex items-center gap-2 font-bold cursor-pointer"
                        style={{ color: textColor }}
                    >
                        <Globe className="w-6 h-6" style={{ color: data.accent_color || '#4f46e5' }} aria-hidden="true" />
                        {!isMobile && <span className="font-outfit text-xl tracking-tight">KreatifCMS</span>}
                    </Link>
                )}
            </div>
        );
    };

    const renderSearch = (isMobile = false) => (
        <div key="search" className={`${isMobile ? 'py-3' : 'flex-1 max-w-md px-4'}`}>
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder={data.search_placeholder || "Cari produk..."}
                    className={`w-full bg-white/10 border ${isMobile ? 'border-gray-200 text-gray-900' : 'border-white/20 text-white placeholder-white/60'} rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-all`}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const q = e.target.value;
                            if (q) router.get(`/search?q=${encodeURIComponent(q)}`);
                        }
                    }}
                />
            </div>
        </div>
    );

    const renderCart = (isMobile = false) => (
        <Link 
            key="cart" 
            href="/cart" 
            className={`p-2 rounded-full hover:bg-white/10 transition-colors relative group ${isMobile ? 'mx-auto' : ''}`}
        >
            <ShoppingCart className={`w-5 h-5 ${isMobile ? 'text-gray-600' : 'text-white'}`} style={{ color: !isMobile && data.text_color ? data.text_color : undefined }} />
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm scale-90 group-hover:scale-100 transition-transform">0</span>
        </Link>
    );

    const renderDesktopSection = (key) => {
        const sectionId = `nav-section-${data.id || 'current'}-${key}`;

        const sectionContent = (() => {
            switch (key) {
                case 'logo':
                    return renderLogo(false);
                case 'links':
                    return (
                        <div className="flex items-center space-x-8">
                            {links.map((link, i) => {
                                const hasChildren = Array.isArray(link.children) && link.children.length > 0;
                                return (
                                    <div key={`desktop-link-${i}`} className="relative group/nav">
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
                        </div>
                    );
                case 'buttons':
                    return buttons.length > 0 && (
                        <div key="buttons" className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
                            {buttons.map((btn, i) => (
                                <a 
                                    key={btn.id || i}
                                    id={`nav-desktop-btn-${btn.id || i}`}
                                    href={btn.action === 'logout' ? '#' : (btn.url || '#')} 
                                    onClick={(e) => handleButtonClick(e, btn)}
                                    className={btn.style === 'primary' 
                                        ? "inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white bg-indigo-700 hover:bg-indigo-800 hover:shadow-indigo-200 transition-all font-outfit"
                                        : "text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                    }
                                >
                                    {btn.label}
                                </a>
                            ))}
                        </div>
                    );
                case 'social_links':
                    return Array.isArray(data.social_links) && data.social_links.length > 0 && (
                        <div key="social_links" className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
                            {data.social_links.map((link, i) => {
                                const IconComponent = LucideIcons[link.icon] || LucideIcons.Globe;
                                return (
                                    <a 
                                        key={link.id || i} 
                                        href={link.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="transition-all hover:scale-110"
                                        style={{ color: data.text_color || '#9ca3af' }}
                                        title={link.icon}
                                    >
                                        <IconComponent className="w-4 h-4" />
                                    </a>
                                );
                            })}
                        </div>
                    );
                case 'search':
                    return renderSearch(false);
                case 'cart':
                    return renderCart(false);
                default:
                    return null;
            }
        })();

        return (
            <div key={key} id={sectionId} className="flex items-center">
                {sectionContent}
            </div>
        );
    };

    const renderMobileSection = (key) => {
        switch (key) {
            case 'logo':
                return renderLogo(true);
            case 'links':
                return links.map((link, i) => {
                    const hasChildren = Array.isArray(link.children) && link.children.length > 0;
                    return (
                        <div key={`mobile-link-${i}`} className="py-1">
                            <a
                                href={link.url}
                                className="flex items-center justify-between px-3 py-3 rounded-xl text-base font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-outfit"
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
                });
            case 'buttons':
                return buttons.length > 0 && (
                    <div className="pt-4 pb-4 border-t border-gray-100 mt-2 space-y-2">
                        {buttons.map((btn, i) => (
                            <a 
                                key={btn.id || i}
                                id={`nav-mobile-btn-${btn.id || i}`}
                                href={btn.action === 'logout' ? '#' : (btn.url || '#')} 
                                onClick={(e) => handleButtonClick(e, btn)}
                                className={btn.style === 'primary'
                                    ? "block px-4 py-3 rounded-xl text-center text-base font-bold text-white bg-indigo-700 shadow-lg shadow-indigo-100 font-outfit"
                                    : "block px-3 py-3 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 uppercase tracking-widest text-[10px] text-center"
                                }
                            >
                                {btn.label}
                            </a>
                        ))}
                    </div>
                );
            case 'social_links':
                return Array.isArray(data.social_links) && data.social_links.length > 0 && (
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
                );
            case 'search':
                return renderSearch(true);
            case 'cart':
                return renderCart(true);
            default:
                return null;
        }
    };

    return (
        <nav 
            className={`w-full z-50 transition-all duration-300 ${data.sticky !== false ? 'sticky top-0' : 'relative'} ${data.glass !== false ? 'backdrop-blur-md border-b border-white/20 shadow-sm' : 'border-b border-gray-100'}`}
            style={{ 
                backgroundColor: data.bg_color || (data.glass !== false ? 'rgba(255, 255, 255, 0.8)' : '#ffffff'),
                borderColor: data.bg_color ? 'rgba(255, 255, 255, 0.1)' : undefined
            }}
        >
            <style dangerouslySetInnerHTML={{ __html: `
                ${buttons.filter(b => b.custom_css).map((btn, i) => `
                    #nav-desktop-btn-${btn.id || i}, #nav-mobile-btn-${btn.id || i} {
                        ${btn.custom_css}
                    }
                `).join('')}
                ${composition.map(key => data[`${key}_css`] ? `
                    #nav-section-${data.id || 'current'}-${key} {
                        ${data[`${key}_css`]}
                    }
                ` : '').join('')}
            ` }} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-1 hidden md:flex items-center">
                        <div className="flex items-center w-full relative">
                            {composition.map(key => renderDesktopSection(key))}
                        </div>
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

            {/* Mobile Menu - Dynamically Ordered */}
            <div className={`${isOpen ? 'block animate-in slide-in-from-top-2 duration-200' : 'hidden'} md:hidden bg-white border-t border-gray-100 overflow-hidden`}>
                <div className="pt-2 pb-3 space-y-1 px-4">
                    {composition.map(key => renderMobileSection(key))}
                </div>
            </div>
        </nav>
    );
};

export default NavBarBlock;
