import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight, Menu, X, Globe, ArrowRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const MegaMenuBlock = ({ data = {}, contentTypes = [] }) => {
    const [activeMenu, setActiveMenu] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileExpanded, setMobileExpanded] = useState(null);
    const menuRef = useRef(null);
    const timeoutRef = useRef(null);

    const source = data.source || 'static';
    const menus = Array.isArray(data.menus) ? data.menus : [];
    const items = Array.isArray(data.items) ? data.items : [];
    const mapping = data.mapping || {};
    const columnsCount = data.columns_count || 4;

    const bgColor = data.bg_color || '#ffffff';
    const textColor = data.text_color || '#111827';
    const accentColor = data.accent_color || '#4f46e5';
    const hoverColor = data.hover_color || '#eef2ff';
    const panelBg = data.panel_bg || '#ffffff';

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMouseEnter = (menuId) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setActiveMenu(menuId);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setActiveMenu(null), 200);
    };

    const handlePanelMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    // Chunk dynamic items into columns
    const chunkItems = (arr, cols) => {
        const chunks = [];
        const perCol = Math.ceil(arr.length / cols);
        for (let i = 0; i < cols; i++) {
            chunks.push(arr.slice(i * perCol, (i + 1) * perCol));
        }
        return chunks;
    };

    // Render a static column in the dropdown
    const RecursiveLinks = ({ links, isMobile = false, depth = 0 }) => {
        if (!Array.isArray(links) || links.length === 0) return null;

        return (
            <ul className={`${isMobile ? 'pl-4 space-y-1' : (depth === 0 ? 'space-y-1' : 'absolute left-full top-0 ml-px w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover/recursive:opacity-100 group-hover/recursive:visible transition-all duration-200 z-[110]')}`}>
                {links.map((link, i) => {
                    const hasChildren = Array.isArray(link.children) && link.children.length > 0;
                    
                    if (isMobile) {
                        return (
                            <li key={link.id || i}>
                                <div className="flex items-center justify-between py-2 px-3 text-sm font-medium transition-colors rounded-lg" style={{ color: textColor }}>
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
                                className="group flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all"
                                style={{ color: textColor }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hoverColor; e.currentTarget.style.color = accentColor; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = textColor; }}
                            >
                                <div className="flex-1 min-w-0">
                                    <span className="font-semibold block">{link.label}</span>
                                    {depth === 0 && link.description && (
                                        <span className="text-xs opacity-60 block mt-0.5 line-clamp-2">{link.description}</span>
                                    )}
                                </div>
                                {hasChildren && <ChevronRight className="w-3.5 h-3.5 opacity-50 ml-2" />}
                            </a>
                            {hasChildren && <RecursiveLinks links={link.children} isMobile={false} depth={depth + 1} />}
                        </li>
                    );
                })}
            </ul>
        );
    };

    const renderStaticColumn = (col) => (
        <div key={col.id} className="flex-1 min-w-0">
            {col.title && (
                <h4
                    className="text-xs font-bold uppercase tracking-widest mb-3 pb-2 border-b"
                    style={{ color: accentColor, borderColor: `${accentColor}20` }}
                >
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
    );

    // Render dynamic content cards in columns
    const renderDynamicPanel = () => {
        if (items.length === 0) {
            return (
                <div className="py-8 text-center">
                    <Globe className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: textColor }} />
                    <p className="text-sm opacity-50" style={{ color: textColor }}>No content items found.</p>
                </div>
            );
        }

        const columnChunks = chunkItems(items, columnsCount);
        return (
            <div className="flex gap-6">
                {columnChunks.map((chunk, colIdx) => (
                    <div key={`dyn-col-${colIdx}`} className="flex-1 min-w-0 space-y-2">
                        {chunk.map((item, itemIdx) => {
                            const itemTitle = mapping.title ? item[mapping.title] : (item.title || '');
                            const itemDesc = mapping.description ? item[mapping.description] : (item.description || '');
                            const itemImage = mapping.image ? item[mapping.image] : (item.image || '');
                            const itemLink = `${mapping.link_prefix || '/content/'}${item.id}`;

                            return (
                                <a
                                    key={item.id || `dyn-${colIdx}-${itemIdx}`}
                                    href={itemLink}
                                    className="group block p-3 rounded-xl transition-all"
                                    style={{ color: textColor }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hoverColor; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                >
                                    {itemImage && (
                                        <div className="rounded-lg overflow-hidden mb-2">
                                            <img src={itemImage} alt={itemTitle} loading="lazy" className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    )}
                                    {itemTitle && (
                                        <h5 className="text-sm font-bold group-hover:text-indigo-600 transition-colors">{itemTitle}</h5>
                                    )}
                                    {itemDesc && (
                                        <p className="text-xs mt-1 opacity-60 line-clamp-2">{itemDesc}</p>
                                    )}
                                </a>
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    };

    // Render the featured image for a menu (static mode)
    const renderMenuFeaturedImage = (menu) => {
        if (!menu.featured_image) return null;
        return (
            <div className="w-64 flex-shrink-0 rounded-xl overflow-hidden">
                <img src={menu.featured_image} alt={menu.label} className="w-full h-full object-cover min-h-[200px]" />
            </div>
        );
    };

    // Desktop dropdown panel
    const renderDropdownPanel = (menu) => {
        const isActive = activeMenu === menu.id;
        if (!isActive) return null;

        return (
            <div
                className="absolute left-0 right-0 top-full z-[100]"
                onMouseEnter={handlePanelMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div
                    className="mx-auto max-w-7xl rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                    style={{
                        backgroundColor: panelBg,
                        borderColor: `${textColor}10`,
                        boxShadow: `0 25px 60px -15px ${textColor}15`
                    }}
                >
                    <div className="p-6">
                        {source === 'static' ? (
                            <div className="flex gap-6">
                                {renderMenuFeaturedImage(menu)}
                                <div className="flex-1 flex gap-6">
                                    {(menu.columns || []).map(col => renderStaticColumn(col))}
                                </div>
                            </div>
                        ) : (
                            renderDynamicPanel()
                        )}
                    </div>
                    {/* Bottom bar with CTA if configured */}
                    {menu.cta_label && (
                        <div
                            className="px-6 py-3 border-t flex items-center justify-between"
                            style={{ borderColor: `${textColor}08`, backgroundColor: `${accentColor}05` }}
                        >
                            <span className="text-xs font-medium" style={{ color: `${textColor}80` }}>{menu.cta_description || ''}</span>
                            <a
                                href={menu.cta_url || '#'}
                                className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg transition-all"
                                style={{ backgroundColor: accentColor, color: '#ffffff' }}
                            >
                                {menu.cta_label}
                                <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Mobile accordion item
    const renderMobileMenu = (menu) => {
        const isExpanded = mobileExpanded === menu.id;
        const hasContent = source === 'static'
            ? (menu.columns || []).length > 0
            : items.length > 0;
        const IconComponent = menu.icon ? (LucideIcons[menu.icon] || null) : null;

        return (
            <div key={menu.id} className="border-b" style={{ borderColor: `${textColor}10` }}>
                <button
                    onClick={() => setMobileExpanded(isExpanded ? null : menu.id)}
                    className="w-full flex items-center justify-between px-4 py-4 text-left transition-colors"
                    style={{ color: textColor }}
                >
                    <div className="flex items-center gap-3">
                        {IconComponent && <IconComponent className="w-4 h-4" style={{ color: accentColor }} />}
                        <span className="font-semibold text-sm">{menu.label}</span>
                    </div>
                    {hasContent && (
                        <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            style={{ color: `${textColor}60` }}
                        />
                    )}
                </button>
                {isExpanded && hasContent && (
                    <div className="px-4 pb-4 animate-in slide-in-from-top-1 duration-150">
                        {source === 'static' ? (
                            <div className="space-y-4">
                                {(menu.columns || []).map(col => (
                                    <div key={col.id}>
                                        {col.title && (
                                            <h4
                                                className="text-xs font-bold uppercase tracking-widest mb-2"
                                                style={{ color: accentColor }}
                                            >
                                                {col.title}
                                            </h4>
                                        )}
                                        <RecursiveLinks links={col.links} isMobile={true} depth={0} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {items.slice(0, 8).map((item, i) => {
                                    const itemTitle = mapping.title ? item[mapping.title] : (item.title || '');
                                    const itemLink = `${mapping.link_prefix || '/content/'}${item.id}`;
                                    return (
                                        <a
                                            key={item.id || i}
                                            href={itemLink}
                                            className="block py-2 px-3 text-sm rounded-lg transition-colors"
                                            style={{ color: textColor }}
                                        >
                                            {itemTitle}
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <nav
            ref={menuRef}
            className={`w-full z-50 transition-all duration-300 ${data.sticky ? 'sticky top-0' : 'relative'} ${data.glass ? 'backdrop-blur-xl' : ''}`}
            style={{
                backgroundColor: data.glass ? `${bgColor}CC` : bgColor,
                borderBottom: `1px solid ${textColor}10`
            }}
        >
            {/* Desktop Menu Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="hidden md:flex items-center h-14 gap-1">
                    {/* Logo (optional) */}
                    {data.logo && (
                        <Link href="/" className="flex-shrink-0 mr-6" aria-label="Home">
                            <img src={data.logo} alt="Logo" className="h-8 w-auto" />
                        </Link>
                    )}

                    {menus.map((menu) => {
                        const hasContent = source === 'static'
                            ? (menu.columns || []).length > 0
                            : items.length > 0;
                        const IconComponent = menu.icon ? (LucideIcons[menu.icon] || null) : null;
                        const isActive = activeMenu === menu.id;

                        // Simple link menu item (no dropdown)
                        if (!hasContent && menu.url) {
                            return (
                                <a
                                    key={menu.id}
                                    href={menu.url}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                                    style={{ color: textColor }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hoverColor; e.currentTarget.style.color = accentColor; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = textColor; }}
                                >
                                    {IconComponent && <IconComponent className="w-4 h-4" />}
                                    {menu.label}
                                </a>
                            );
                        }

                        return (
                            <div
                                key={menu.id}
                                className="relative"
                                onMouseEnter={() => handleMouseEnter(menu.id)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                                    style={{
                                        color: isActive ? accentColor : textColor,
                                        backgroundColor: isActive ? hoverColor : 'transparent'
                                    }}
                                    onClick={() => setActiveMenu(isActive ? null : menu.id)}
                                    aria-expanded={isActive}
                                >
                                    {IconComponent && <IconComponent className="w-4 h-4" />}
                                    {menu.label}
                                    <ChevronDown
                                        className={`w-3.5 h-3.5 transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`}
                                        style={{ opacity: 0.5 }}
                                    />
                                </button>
                            </div>
                        );
                    })}

                    {/* Right side slot for CTA buttons or extra content */}
                    {data.cta_label && (
                        <div className="ml-auto">
                            <a
                                href={data.cta_url || '#'}
                                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-sm hover:shadow-md"
                                style={{ backgroundColor: accentColor, color: '#ffffff' }}
                            >
                                {data.cta_label}
                                <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    )}
                </div>

                {/* Mobile Toggle */}
                <div className="md:hidden flex items-center justify-between h-14">
                    {data.logo ? (
                        <Link href="/" aria-label="Home">
                            <img src={data.logo} alt="Logo" className="h-8 w-auto" />
                        </Link>
                    ) : (
                        <span className="font-bold text-sm" style={{ color: textColor }}>Menu</span>
                    )}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: textColor }}
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Desktop Dropdown Panels (positioned under the nav bar) */}
            <div className="hidden md:block relative">
                {menus.map(menu => renderDropdownPanel(menu))}
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div
                    className="md:hidden border-t animate-in slide-in-from-top-2 duration-200"
                    style={{ borderColor: `${textColor}10`, backgroundColor: panelBg }}
                >
                    {menus.map(menu => renderMobileMenu(menu))}
                </div>
            )}
        </nav>
    );
};

export default MegaMenuBlock;
