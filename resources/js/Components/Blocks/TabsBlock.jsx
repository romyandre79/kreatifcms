import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import DynamicPageRenderer from '../DynamicPageRenderer';

export default function TabsBlock({ data = {} }) {
    const {
        tabs = [],
        active_color = '#4f46e5',
        tab_style = 'pills', // pills, border, line
        align = 'left'
    } = data;

    const [activeTabId, setActiveTabId] = useState(tabs[0]?.id || '');

    // Get reusable blocks from global page props
    const { reusableBlocks = [], reusable_blocks = [] } = usePage().props;
    const allReusableBlocks = reusableBlocks.length > 0 ? reusableBlocks : reusable_blocks;

    const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

    // Find the selected reusable block data to render inside active tab
    const getActiveTabBlocks = () => {
        if (!activeTab || !activeTab.block_id) return [];
        const reusableBlock = allReusableBlocks.find(b => String(b.id) === String(activeTab.block_id));
        if (reusableBlock && Array.isArray(reusableBlock.data?.blocks)) {
            return reusableBlock.data.blocks;
        }
        // Backward compatibility or direct block reference
        if (reusableBlock) {
            return [reusableBlock];
        }
        return [];
    };

    if (tabs.length === 0) {
        return (
            <div className="py-8 text-center text-xs text-gray-400 italic bg-gray-50 border border-dashed border-gray-100 rounded-2xl">
                No tabs configured. Add tabs in Settings.
            </div>
        );
    }

    const alignmentClass = align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start';

    return (
        <div className="w-full space-y-6 py-4">
            {/* Tab Triggers */}
            <div className={`flex items-center gap-1.5 border-b border-gray-100 pb-2 flex-wrap ${alignmentClass}`}>
                {tabs.map((tab) => {
                    const isActive = tab.id === (activeTabId || tabs[0]?.id);
                    
                    if (tab_style === 'pills') {
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTabId(tab.id)}
                                className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all
                                    ${isActive 
                                        ? 'text-white shadow-lg shadow-indigo-100/50' 
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                                style={isActive ? { backgroundColor: active_color } : {}}
                            >
                                {tab.label || 'Unnamed Tab'}
                            </button>
                        );
                    }
                    
                    // Default line/border style
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTabId(tab.id)}
                            className={`px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all -mb-2.5
                                ${isActive 
                                    ? 'text-indigo-600 border-indigo-600' 
                                    : 'text-gray-400 border-transparent hover:text-gray-700'}`}
                            style={isActive ? { color: active_color, borderColor: active_color } : {}}
                        >
                            {tab.label || 'Unnamed Tab'}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content Panel */}
            <div className="tab-content-panel min-h-[100px] animate-in fade-in duration-200">
                {activeTab && activeTab.block_id ? (
                    <DynamicPageRenderer 
                        blocks={getActiveTabBlocks()} 
                        reusableBlocks={allReusableBlocks} 
                    />
                ) : (
                    <div className="py-12 text-center text-xs text-gray-400 italic bg-gray-50/50 border border-gray-100 rounded-3xl">
                        No block assigned to this tab.
                    </div>
                )}
            </div>
        </div>
    );
}
