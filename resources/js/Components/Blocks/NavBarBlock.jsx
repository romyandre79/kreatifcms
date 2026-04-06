import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, usePage, router } from '@inertiajs/react';
import { Globe, ChevronDown, Menu, X, Search, ShoppingCart, Grid, ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import SocialIcon from '@/Components/SocialIcon';

const NavBarBlock = ({ data = {} }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeMega, setActiveMega] = useState(null);
    const [mobileExpandedMega, setMobileExpandedMega] = useState(null);
    const [hoveredLink, setHoveredLink] = useState(null);
    const [hoveredRect, setHoveredRect] = useState(null);
    const megaTimeoutRef = useRef(null);
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

    const RecursiveLinks = ({ links, isMobile = false, depth = 0 }) => {
        if (!Array.isArray(links) || links.length === 0) return null;

        // Desktop: depth 1 is the first vertical list in the dropdown. 
        // depth > 1 are fly-out sub-menus.
        const desktopClasses = depth <= 1 
            ? 'space-y-1 p-1' 
            : 'absolute left-full top-0 ml-px w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover/recursive:opacity-100 group-hover/recursive:visible transition-all duration-200 z-[110]';

        return (
            <ul className={`${isMobile ? 'pl-4 space-y-1' : desktopClasses}`}>
                {links.map((link, i) => {
                    const hasChildren = Array.isArray(link.children) && link.children.length > 0;
                    
                    if (isMobile) {
                        return (
                            <li key={link.id || i}>
                                <div className="flex items-center justify-between py-2 px-3 text-sm font-medium text-gray-600 hover:text-indigo-600 rounded-lg">
                                    <a href={link.url || '#'} className="flex-1">{link.label}</a>
                                    {hasChildren && <ChevronDown className="w-3.5 h-3.5 opacity-50" />}
                                </div>
                                {hasChildren && <RecursiveLinks links={link.children} isMobile={true} depth={depth + 1} />}
                            </li>
                        );
                    }

                    return (
                        <li key={link.id || i} className="relative group/recursive">
                            <a
                                href={link.url || '#'}
                                className={`group/item flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all hover:bg-indigo-50 ${depth <= 1 ? 'text-gray-800' : 'text-gray-700'}`}
                            >
                                <div className="flex-1 min-w-0 pr-2">
                                    <span className="font-semibold block group-hover/item:text-indigo-600">{link.label}</span>
                                    {depth <= 1 && link.description && <span className="text-[10px] text-gray-400 block mt-0.5 line-clamp-1">{link.description}</span>}
                                </div>
                                {hasChildren && <ChevronRight className="w-3.5 h-3.5 opacity-40 ml-auto" />}
                            </a>
                            {hasChildren && <RecursiveLinks links={link.children} isMobile={false} depth={depth + 1} />}
                        </li>
                    );
                })}
            </ul>
        );
    };

    const renderDesktopSection = (key) => {
        const sectionId = `nav-section-${data.id || 'current'}-${key}`;

        const sectionContent = (() => {
            switch (key) {
                case 'logo':
                    return renderLogo(false);
                case 'links':
                    return (
                        <div className="flex items-center space-x-1">
                            {links.map((link, i) => {
                                const hasChildren = Array.isArray(link.children) && link.children.length > 0;
                                const isHovered = hoveredLink === i;
                                return (
                                    <div 
                                        key={`desktop-link-${i}`} 
                                        className="relative group/nav"
                                        onMouseEnter={(e) => {
                                            if (hasChildren) {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                setHoveredLink(i);
                                                setHoveredRect(rect);
                                                if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current);
                                            }
                                        }}
                                        onMouseLeave={() => {
                                            if (hasChildren) {
                                                megaTimeoutRef.current = setTimeout(() => {
                                                    setHoveredLink(null);
                                                    setHoveredRect(null);
                                                }, 150);
                                            }
                                        }}
                                    >
                                        <a 
                                            href={link.url} 
                                            className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors py-5 px-3 flex items-center gap-1"
                                        >
                                            {link.label}
                                            {hasChildren && <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover/nav:text-indigo-500 transition-colors" />}
                                        </a>
                                        
                                        {hasChildren && isHovered && hoveredRect && createPortal(
                                            <div 
                                                className="fixed z-[999999] opacity-0 invisible animate-in fade-in zoom-in-95 duration-200 fill-mode-forwards"
                                                style={{ 
                                                    top: `${hoveredRect.bottom}px`, 
                                                    left: `${hoveredRect.left}px`,
                                                    minWidth: '220px',
                                                    opacity: 1,
                                                    visibility: 'visible'
                                                }}
                                                onMouseEnter={() => {
                                                    if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current);
                                                }}
                                                onMouseLeave={() => {
                                                    megaTimeoutRef.current = setTimeout(() => {
                                                        setHoveredLink(null);
                                                        setHoveredRect(null);
                                                    }, 150);
                                                }}
                                            >
                                                <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-visible py-2 translate-y-2 transition-transform">
                                                    <RecursiveLinks links={link.children} isMobile={false} depth={1} />
                                                </div>
                                            </div>,
                                            document.body
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
                                        <SocialIcon name={link.icon} size={16} color="brand" />
                                    </a>
                                );
                            })}
                        </div>
                    );
                case 'search':
                    return renderSearch(false);
                case 'cart':
                    return renderCart(false);
                case 'megamenu': {
                    const mmSource = data.megamenu_source || 'static';
                    if (mmSource === 'static') {
                        const mega_menus = Array.isArray(data.mega_menus) ? data.mega_menus : [];
                        if (mega_menus.length === 0) return null;
                        return (
                            <div className="flex items-center gap-1">
                                {mega_menus.map((menu) => {
                                    const hasContent = (menu.columns || []).length > 0;
                                    const IconComponent = menu.icon ? (LucideIcons[menu.icon] || null) : null;
                                    const isActive = activeMega === menu.id;
                                    return (
                                        <div
                                            key={menu.id}
                                            className="relative"
                                            onMouseEnter={() => { if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current); setActiveMega(menu.id); }}
                                            onMouseLeave={() => { megaTimeoutRef.current = setTimeout(() => setActiveMega(null), 200); }}
                                        >
                                            <button
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:text-indigo-600'}`}
                                                onClick={() => setActiveMega(isActive ? null : menu.id)}
                                            >
                                                {IconComponent && <IconComponent className="w-4 h-4" />}
                                                {menu.label}
                                                {hasContent && <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isActive ? 'rotate-180' : ''}`} style={{ opacity: 0.5 }} />}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    } else {
                        // Dynamic Mode
                        const items = Array.isArray(data.mega_menus_dynamic_items) ? data.mega_menus_dynamic_items : [];
                        if (items.length === 0 && !window.location.href.includes('editor')) return null;
                        const label = data.megamenu_label || 'Browse';
                        const isActive = activeMega === 'dynamic';
                        return (
                            <div
                                className="relative"
                                onMouseEnter={() => { if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current); setActiveMega('dynamic'); }}
                                onMouseLeave={() => { megaTimeoutRef.current = setTimeout(() => setActiveMega(null), 200); }}
                            >
                                <button
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:text-indigo-600'}`}
                                    onClick={() => setActiveMega(isActive ? null : 'dynamic')}
                                >
                                    <Grid className="w-4 h-4" />
                                    {label}
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isActive ? 'rotate-180' : ''}`} style={{ opacity: 0.5 }} />
                                </button>
                            </div>
                        );
                    }
                }
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
                return <RecursiveLinks links={links} isMobile={true} depth={0} />;
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
                            return (
                                <a 
                                    key={link.id || i} 
                                    href={link.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                                >
                                    <SocialIcon name={link.icon} size={24} color="brand" />
                                </a>
                            );
                        })}
                    </div>
                );
            case 'search':
                return renderSearch(true);
            case 'cart':
                return renderCart(true);
            case 'megamenu': {
                const mmSource = data.megamenu_source || 'static';
                if (mmSource === 'static') {
                    const mega_menus = Array.isArray(data.mega_menus) ? data.mega_menus : [];
                    if (mega_menus.length === 0) return null;
                    return (
                        <div className="border-t border-gray-100 mt-2 pt-2">
                            {mega_menus.map((menu) => {
                                const isExpanded = mobileExpandedMega === menu.id;
                                const hasContent = (menu.columns || []).length > 0;
                                const IconComponent = menu.icon ? (LucideIcons[menu.icon] || null) : null;
                                return (
                                    <div key={menu.id}>
                                        <button
                                            onClick={() => setMobileExpandedMega(isExpanded ? null : menu.id)}
                                            className="flex items-center justify-between w-full px-3 py-3 rounded-xl text-base font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                        >
                                            <div className="flex items-center gap-2">
                                                {IconComponent && <IconComponent className="w-4 h-4" style={{ color: data.accent_color || '#4f46e5' }} />}
                                                <span>{menu.label}</span>
                                            </div>
                                            {hasContent && <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />}
                                        </button>
                                        {isExpanded && hasContent && (
                                            <div className="pl-6 pb-2 space-y-3 border-l-2 border-indigo-50 ml-3">
                                                        <div key={col.id}>
                                                            {col.title && <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{col.title}</h4>}
                                                            <RecursiveLinks links={col.links} isMobile={true} depth={0} />
                                                        </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    );
                } else {
                    const items = Array.isArray(data.mega_menus_dynamic_items) ? data.mega_menus_dynamic_items : [];
                    const isExpanded = mobileExpandedMega === 'dynamic';
                    const hasContent = items.length > 0;
                    const mapping = data.megamenu_mapping || {};
                    return (
                        <div className="border-t border-gray-100 mt-2 pt-2">
                            <button
                                onClick={() => setMobileExpandedMega(isExpanded ? null : 'dynamic')}
                                className="flex items-center justify-between w-full px-3 py-3 rounded-xl text-base font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                            >
                                <div className="flex items-center gap-2">
                                    <Grid className="w-4 h-4" style={{ color: data.accent_color || '#4f46e5' }} />
                                    <span>{data.megamenu_label || 'Browse'}</span>
                                </div>
                                {hasContent && <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />}
                            </button>
                            {isExpanded && hasContent && (
                                <div className="pl-6 pb-2 space-y-2 border-l-2 border-indigo-50 ml-3">
                                    {items.map((item, i) => (
                                        <a key={item.id || i} href={`${mapping.link_prefix || '/content/'}${item.id}`} className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 rounded-lg">
                                            {item[mapping.title] || item.title || 'Untitled'}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                }
            }
            default:
                return null;
        }
    };

    return (
        <nav 
            className={`w-full z-[99999] transition-all duration-300 ${data.sticky !== false ? 'sticky top-0' : 'relative'} ${data.glass !== false ? 'backdrop-blur-md border-b border-white/20 shadow-sm' : 'border-b border-gray-100'}`}
            style={{ 
                backgroundColor: data.bg_color || (data.glass !== false ? 'rgba(255, 255, 255, 0.8)' : '#ffffff'),
                borderColor: data.bg_color ? 'rgba(255, 255, 255, 0.1)' : undefined,
                overflow: 'visible !important'
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
                #nav-section-${data.id || 'current'}-links {
                    overflow: visible !important;
                }
                /* Definitive clipping fix */
                .dynamic-page-content, 
                .dynamic-page-content > div,
                nav[style*="sticky"] {
                    overflow: visible !important;
                }
            ` }} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ overflow: 'visible !important' }}>
                <div className="flex justify-between h-16 items-center" style={{ overflow: 'visible !important' }}>
                    <div className="flex-1 hidden md:flex items-center" style={{ overflow: 'visible !important' }}>
                        <div className="flex items-center w-full relative" style={{ overflow: 'visible !important' }}>
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

            {/* Desktop Mega Menu Dropdowns */}
            {(() => {
                const mmSource = data.megamenu_source || 'static';
                if (!composition.includes('megamenu') || !activeMega) return null;

                if (mmSource === 'static') {
                    const mega_menus = Array.isArray(data.mega_menus) ? data.mega_menus : [];
                    const activeMenu = mega_menus.find(m => m.id === activeMega);
                    if (!activeMenu || (activeMenu.columns || []).length === 0) return null;
                    return (
                        <div
                            className="hidden md:block absolute left-0 right-0 z-[100]"
                            onMouseEnter={() => { if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current); }}
                            onMouseLeave={() => { megaTimeoutRef.current = setTimeout(() => setActiveMega(null), 200); }}
                        >
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-6 flex gap-8">
                                        {(activeMenu.columns || []).map(col => (
                                            <div key={col.id} className="flex-1 min-w-0">
                                                {col.title && (
                                                    <h4 className="text-xs font-bold uppercase tracking-widest mb-3 pb-2 border-b" style={{ color: data.accent_color || '#4f46e5', borderColor: `${data.accent_color || '#4f46e5'}20` }}>
                                                        {col.title}
                                                    </h4>
                                                )}
                                                {col.image && (
                                                    <div className="mb-3 rounded-xl overflow-hidden">
                                                        <img src={col.image} alt={col.title || ''} className="w-full h-32 object-cover hover:scale-105 transition-transform duration-500" />
                                                    </div>
                                                )}
                                                <RecursiveLinks links={col.links} isMobile={false} depth={0} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                } else {
                    const items = Array.isArray(data.mega_menus_dynamic_items) ? data.mega_menus_dynamic_items : [];
                    if (activeMega !== 'dynamic' || items.length === 0) return null;
                    const mapping = data.megamenu_mapping || {};
                    const columnsCount = data.megamenu_columns || 4;
                    const chunked = [];
                    const perCol = Math.ceil(items.length / columnsCount);
                    for (let i = 0; i < columnsCount; i++) chunked.push(items.slice(i * perCol, (i + 1) * perCol));

                    return (
                        <div
                            className="hidden md:block absolute left-0 right-0 z-[100]"
                            onMouseEnter={() => { if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current); }}
                            onMouseLeave={() => { megaTimeoutRef.current = setTimeout(() => setActiveMega(null), 200); }}
                        >
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-6">
                                        <div className="flex gap-6">
                                            {chunked.map((column, colIdx) => (
                                                <div key={colIdx} className="flex-1 min-w-0 space-y-2">
                                                    {column.map((item, itemIdx) => {
                                                        const itemTitle = item[mapping.title] || item.title || 'Untitled';
                                                        const itemDesc = item[mapping.description] || item.description || '';
                                                        const itemImage = item[mapping.image] || item.image || '';
                                                        return (
                                                            <a
                                                                key={item.id || itemIdx}
                                                                href={`${mapping.link_prefix || '/content/'}${item.id}`}
                                                                className="group block p-3 rounded-xl transition-all hover:bg-indigo-50"
                                                            >
                                                                {itemImage && (
                                                                    <div className="rounded-lg overflow-hidden mb-2">
                                                                        <img src={itemImage} alt={itemTitle} className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-500" />
                                                                    </div>
                                                                )}
                                                                <h5 className="text-sm font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{itemTitle}</h5>
                                                                {itemDesc && <p className="text-xs mt-1 text-gray-400 line-clamp-2">{itemDesc}</p>}
                                                            </a>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }
            })()}

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
