import { Head } from '@inertiajs/react';
import DynamicPageRenderer from '@/Components/DynamicPageRenderer';

export default function Page({ page = {}, reusableBlocks = [], layout = {} }) {
    const title = page?.title || page?.meta_title || 'Page';
    const metaDesc = page?.meta_description || layout?.seo?.default_meta_description || '';
    const siteName = layout?.seo?.site_name || 'Kreatif CMS';
    const separator = layout?.seo?.title_separator || ' | ';

    const headerBlocks = Array.isArray(layout?.header) ? layout.header : [];
    const footerBlocks = Array.isArray(layout?.footer) ? layout.footer : [];
    const pageBlocks = Array.isArray(page?.blocks) ? page.blocks : [];
    const safeReusableBlocks = Array.isArray(reusableBlocks) ? reusableBlocks : [];

    return (
        <>
            <Head>
                <title>{`${title}${separator}${siteName}`}</title>
                {metaDesc && <meta name="description" content={metaDesc} />}
                {page?.meta_keywords && <meta name="keywords" content={page.meta_keywords} />}
                {page?.og_image && <meta property="og:image" content={page.og_image} />}
                <meta property="og:title" content={`${title}${separator}${siteName}`} />
                <meta property="og:type" content="website" />
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
                <footer className="bg-gray-900 text-gray-300 py-12">
                    <div className="max-w-7xl mx-auto px-4">
                        <DynamicPageRenderer blocks={footerBlocks} reusableBlocks={safeReusableBlocks} />
                    </div>
                </footer>
            )}
        </>
    );
}
