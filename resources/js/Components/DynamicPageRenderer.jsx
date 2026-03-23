import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { usePage } from '@inertiajs/react';

// Lazy-loaded Block Components (Frontend Plugins)
const NavBarBlock = lazy(() => import('./Blocks/NavBarBlock'));
const HeroBlock = lazy(() => import('./Blocks/HeroBlock'));
const TextBlock = lazy(() => import('./Blocks/TextBlock'));
const ImageBlock = lazy(() => import('./Blocks/ImageBlock'));
const FeatureGridBlock = lazy(() => import('./Blocks/FeatureGridBlock'));
const SlideshowBlock = lazy(() => import('./Blocks/SlideshowBlock'));
const ContentListBlock = lazy(() => import('./Blocks/ContentListBlock'));

const BlockComponents = {
    navbar: NavBarBlock,
    hero: HeroBlock,
    text: TextBlock,
    image: ImageBlock,
    feature_grid: FeatureGridBlock,
    slideshow: SlideshowBlock,
    content_list: ContentListBlock
};


// Block Event Handler component - manages event bindings for a block
const BlockEventHandler = ({ events = {}, customJs, blockId }) => {
    const blockRef = useRef(null);
    const hasLoadRun = useRef(false);

    // Helper to create a safe function executor
    const execEvent = (code, evtName, domEvent) => {
        if (!code) return;
        try {
            const el = document.querySelector(`.block-${blockId}`);
            const fn = new Function('blockId', 'blockEl', 'event', code);
            fn(blockId, el, domEvent);
        } catch (err) {
            console.error(`[Block ${blockId}] ${evtName} error:`, err);
        }
    };

    // onLoad: run once after mount
    useEffect(() => {
        if (hasLoadRun.current) return;
        hasLoadRun.current = true;
        // Support old customJs as onLoad for backward compat
        if (customJs) execEvent(customJs, 'customJs');
        if (events.onLoad) execEvent(events.onLoad, 'onLoad');
    }, []);

    // Attach DOM event listeners for onClick, onMouseEnter, onMouseLeave
    useEffect(() => {
        const el = document.querySelector(`.block-${blockId}`);
        if (!el) return;

        const handlers = {};
        if (events.onClick) {
            handlers.click = (e) => execEvent(events.onClick, 'onClick', e);
            el.addEventListener('click', handlers.click);
        }
        if (events.onMouseEnter) {
            handlers.mouseenter = (e) => execEvent(events.onMouseEnter, 'onMouseEnter', e);
            el.addEventListener('mouseenter', handlers.mouseenter);
        }
        if (events.onMouseLeave) {
            handlers.mouseleave = (e) => execEvent(events.onMouseLeave, 'onMouseLeave', e);
            el.addEventListener('mouseleave', handlers.mouseleave);
        }

        return () => {
            if (handlers.click) el.removeEventListener('click', handlers.click);
            if (handlers.mouseenter) el.removeEventListener('mouseenter', handlers.mouseenter);
            if (handlers.mouseleave) el.removeEventListener('mouseleave', handlers.mouseleave);
        };
    }, [events.onClick, events.onMouseEnter, events.onMouseLeave, blockId]);

    return null;
};

export default React.memo(function DynamicPageRenderer({ blocks = [], reusableBlocks = [] }) {
    const { plugins = [] } = usePage().props;
    const activeBlockTypes = plugins.filter(p => p.type === 'block').map(p => p.meta?.id || p.alias);

    if (!blocks || (Array.isArray(blocks) && blocks.length === 0)) {
        return (
            <div className="min-h-[20vh] flex items-center justify-center text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 m-8">
                <p className="text-sm font-medium">Empty section.</p>
            </div>
        );
    }

    return (
        <div className="dynamic-page-content font-sans antialiased text-gray-900 bg-white">
            {(Array.isArray(blocks) ? blocks : []).map((block) => {
                if (!block) return null;
                let actualType = block.type;
                let actualData = block.data || {};

                if (block.type === 'reusable_block') {
                    const savedBlock = (reusableBlocks || []).find(b => b.id == block.data?.block_id);
                    if (savedBlock) {
                        actualType = savedBlock.type;
                        actualData = savedBlock.data || {};
                    } else {
                        return null;
                    }
                }

                if (actualType === 'reusable_block') return null;

                const Component = BlockComponents[actualType];
                if (!Component || !activeBlockTypes.includes(actualType)) {
                    if (typeof window !== 'undefined' && window.location.pathname.includes('/admin')) {
                        return <div key={block.id} className="p-4 text-gray-500 bg-gray-50 border border-dashed border-gray-200 m-4 rounded text-xs opacity-50 text-center">Plugin Disabled/Unknown: {actualType}</div>;
                    }
                    return null;
                }

                const hasEvents = actualData.events || actualData.customJs;

                try {
                    return (
                        <div key={block.id} className={`block-${block.id}`}>
                            {/* Per-block custom CSS */}
                            {actualData.customCss && (
                                <style dangerouslySetInnerHTML={{ __html: actualData.customCss }} />
                            )}
                            {/* Block component */}
                            <Suspense fallback={<div className="p-10 w-full flex items-center justify-center text-gray-400 bg-gray-50/50 animate-pulse border-y border-gray-100">Loading {actualType}...</div>}>
                                <Component data={actualData} />
                            </Suspense>
                            {/* Per-block event handlers */}
                            {hasEvents && (
                                <BlockEventHandler
                                    events={actualData.events || {}}
                                    customJs={actualData.customJs}
                                    blockId={block.id}
                                />
                            )}
                        </div>
                    );
                } catch (err) {
                    console.error('Error rendering block:', actualType, err);
                    return <div key={block.id} className="p-4 text-orange-500 bg-orange-50 border border-orange-200 m-4 rounded text-xs">Error: {actualType}</div>;
                }
            })}
        </div>
    );
});
