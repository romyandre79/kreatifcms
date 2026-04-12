import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Edit } from 'lucide-react';
import AdvancedDataGrid from '../../Components/AdvancedDataGrid';

export default function Show({ dataGrid }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Link href={route('datagrids.index')} className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow transition-shadow">
                            <ChevronLeft className="w-5 h-5 text-gray-500" />
                        </Link>
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">
                                {dataGrid.name}
                            </h2>
                            <p className="text-xs text-gray-400 font-mono">{dataGrid.slug}</p>
                        </div>
                    </div>
                    <Link
                        href={route('datagrids.edit', dataGrid.id)}
                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg font-bold text-xs text-gray-600 uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Configuration
                    </Link>
                </div>
            }
        >
            <Head title={`DataGrid: ${dataGrid.name}`} />

            <div className="py-12">
                <div className="max-w-[1600px] mx-auto sm:px-6 lg:px-8 h-[800px]">
                    <AdvancedDataGrid 
                        slug={dataGrid.slug}
                        config={dataGrid}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
