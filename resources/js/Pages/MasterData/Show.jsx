import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import DynamicPageRenderer from '@/Components/DynamicPageRenderer';

export default function Show({ page, reusableBlocks = [] }) {
    const pageBlocks = page?.blocks || [];
    const safeReusableBlocks = Array.isArray(reusableBlocks) ? reusableBlocks : [];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {page?.title || 'Master Data'}
                </h2>
            }
        >
            <Head title={page?.meta_title || page?.title || 'Master Data'} />

            <div className="mx-auto py-4">
                <DynamicPageRenderer blocks={pageBlocks} reusableBlocks={safeReusableBlocks} />
            </div>
        </AuthenticatedLayout>
    );
}
