import { Head } from '@inertiajs/react';
import DynamicPageRenderer from '@/Components/DynamicPageRenderer';

export default function Page({ page = {}, reusableBlocks = [], layout = {} }) {
    const title = page?.title || page?.meta_title || 'Page';
    const metaDesc = page?.meta_description || layout?.seo?.default_meta_description || '';
    const siteName = layout?.seo?.site_name || 'Kreatif CMS';
    const separator = layout?.seo?.title_separator || ' | ';
    const theme = layout?.theme || {};

    const headerBlocks = Array.isArray(layout?.header) ? layout.header : [];
    const footerBlocks = Array.isArray(layout?.footer) ? layout.footer : [];
    const pageBlocks = Array.isArray(page?.blocks) ? page.blocks : [];
    const safeReusableBlocks = Array.isArray(reusableBlocks) ? reusableBlocks : [];

    // Font family processing
    const fonts = new Set(['Inter']); // Default font
    if (theme.fontFamily) fonts.add(theme.fontFamily);
    (theme.customStyles || []).forEach(s => {
        if (s.fontFamily) fonts.add(s.fontFamily);
    });
    
    const fontQuery = Array.from(fonts)
        .filter(f => f !== 'System' && f !== '')
        .map(f => `family=${f.replace(/ /g, '+')}:wght@400;500;600;700`)
        .join('&');

    // CSS Generation
    const dynamicStyles = (theme.customStyles || []).map(s => `
        ${s.selector} {
            ${s.fontFamily ? `font-family: '${s.fontFamily}', sans-serif;` : ''}
            ${s.fontSize ? `font-size: ${s.fontSize}px;` : ''}
            ${s.textColor ? `color: ${s.textColor};` : ''}
            ${s.bgColor ? `background-color: ${s.bgColor};` : ''}
        }
    `).join('\n');

    return (
        <>
            <Head>
                <title>{`${title}${separator}${siteName}`}</title>
                {metaDesc && <meta name="description" content={metaDesc} />}
                {page?.meta_keywords && <meta name="keywords" content={page.meta_keywords} />}
                {page?.og_image && <meta property="og:image" content={page.og_image} />}
                <meta property="og:title" content={`${title}${separator}${siteName}`} />
                <meta property="og:type" content="website" />
                
                {fontQuery && (
                    <link href={`https://fonts.bunny.net/css?${fontQuery}&display=swap`} rel="stylesheet" />
                )}

                <style>{`
                    :root {
                        --primary-color: ${theme.primaryColor || '#4f46e5'};
                        --secondary-color: ${theme.secondaryColor || '#10b981'};
                    }
                    body {
                        font-family: '${theme.fontFamily || 'Inter'}', sans-serif;
                        font-size: ${theme.fontSize || 16}px;
                    }
                    ${dynamicStyles}
                    ${theme.customCss || ''}
                `}</style>
            </Head>

            {/* Header */}
            {headerBlocks.length > 0 && (
                <header>
                    <DynamicPageRenderer blocks={headerBlocks} reusableBlocks={safeReusableBlocks} />
                </header>
            )}

            {/* Main Content */}
            <main className="min-h-screen">
                <DynamicPageRenderer blocks={pageBlocks} reusableBlocks={safeReusableBlocks} />
            </main>

            {/* Footer */}
            {footerBlocks.length > 0 && (
                <footer className="site-footer">
                    <div className="site-footer-container">
                        <DynamicPageRenderer blocks={footerBlocks} reusableBlocks={safeReusableBlocks} />
                    </div>
                </footer>
            )}
        </>
    );
}
