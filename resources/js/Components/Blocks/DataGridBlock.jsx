import React from 'react';
import { LayoutGrid } from 'lucide-react';
import AdvancedDataGrid from '../../../../Modules/DataGrid/resources/js/Components/AdvancedDataGrid';

const DataGridBlock = ({ data = {} }) => {
    if (!data.content_type) {
        return (
            <section className="py-16 px-6 max-w-7xl mx-auto text-center bg-white border-y border-gray-100">
                <div className="p-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <LayoutGrid className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">DataGrid Not Configured</h3>
                    <p className="text-gray-500 text-sm mt-1">Please select a Content Type in the block settings.</p>
                </div>
            </section>
        );
    }

    return (
        <section 
            className={`py-12 px-6 overflow-hidden ${data.bg_color ? '' : 'bg-white'}`} 
            style={{ backgroundColor: data.bg_color }}
        >
            <div className="max-w-[1600px] mx-auto">
                {(data.title || data.subtitle) && (
                    <div className={`mb-10 space-y-2 ${data.align === 'center' ? 'text-center' : data.align === 'right' ? 'text-right' : 'text-left'}`}>
                        {data.title && (
                            <h2
                                className="text-3xl font-black tracking-tight"
                                style={{ color: data.title_color || '#111827' }}
                            >
                                {data.title}
                            </h2>
                        )}
                        {data.subtitle && (
                            <p
                                className={`text-base leading-relaxed text-gray-500 ${data.align === 'center' ? 'max-w-2xl mx-auto' : 'max-w-2xl'}`}
                            >
                                {data.subtitle}
                            </p>
                        )}
                    </div>
                )}

                <div className="h-[650px] bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <AdvancedDataGrid 
                        slug={data.content_type}
                        config={{
                            columns: data.columns || [],
                            buttons: data.buttons || [],
                            perPage: data.per_page || 15,
                            serverSide: data.server_side ?? true
                        }}
                    />
                </div>
            </div>
        </section>
    );
};

export default DataGridBlock;
