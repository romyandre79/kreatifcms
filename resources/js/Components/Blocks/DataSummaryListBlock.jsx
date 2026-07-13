import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export default function DataSummaryListBlock({ data = {} }) {
    const {
        title = 'Data Summary List',
        badge_text = 'Summary',
        content_type = '',
        code_field = 'code',
        label_field = 'name',
        value_field = 'balance',
        filter_field = '',
        filter_value = '',
        total_label = 'Total',
        bg_color = '#ffffff',
        text_color = '#1f2937',
        accent_color = '#10b981' // Green badge color
    } = data;

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!content_type) {
            setItems([]);
            return;
        }

        setLoading(true);
        axios.get('/api/metrics/list', {
            params: {
                content_type,
                filter_field,
                filter_value
            }
        })
        .then(res => {
            if (Array.isArray(res.data)) {
                setItems(res.data);
            }
        })
        .catch(err => {
            console.error('[DataSummaryListBlock] Error fetching list:', err);
            setItems([]);
        })
        .finally(() => {
            setLoading(false);
        });
    }, [content_type, filter_field, filter_value]);

    const formatCurrency = (val) => {
        const num = parseFloat(val);
        if (isNaN(num)) return 'Rp 0,00';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    };

    // Calculate dynamic total sum
    const totalSum = items.reduce((sum, item) => {
        const val = parseFloat(item[value_field]);
        return sum + (isNaN(val) ? 0 : val);
    }, 0);

    return (
        <div 
            className="w-full rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md max-w-3xl mx-auto"
            style={{ backgroundColor: bg_color, color: text_color }}
        >
            {/* Header */}
            <div className="px-8 py-5 flex items-center justify-between border-b border-gray-50 bg-gray-50/20">
                <h3 className="text-lg font-black tracking-tight">{title}</h3>
                {badge_text && (
                    <span 
                        className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700"
                        style={{ color: accent_color, backgroundColor: `${accent_color}10` }}
                    >
                        {badge_text}
                    </span>
                )}
            </div>

            {/* List Body */}
            <div className="px-8 py-6 space-y-4">
                {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-2 text-gray-400">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                        <span className="text-xs font-medium italic">Loading details...</span>
                    </div>
                ) : items.length > 0 ? (
                    <div className="space-y-4">
                        {items.map((item, idx) => (
                            <div 
                                key={item.id || idx}
                                className="flex items-center justify-between py-2 border-b border-gray-50/50 last:border-b-0 hover:bg-gray-50/30 px-2 rounded-xl transition-all"
                            >
                                <div className="flex items-center gap-6 min-w-0 flex-1">
                                    {code_field && item[code_field] && (
                                        <span className="text-xs font-mono font-bold text-gray-400 w-16 flex-shrink-0">
                                            {item[code_field]}
                                        </span>
                                    )}
                                    <span className="text-sm font-semibold text-gray-700 truncate">
                                        {item[label_field] || 'Unnamed Item'}
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-gray-800 ml-4 flex-shrink-0">
                                    {formatCurrency(item[value_field])}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center text-xs text-gray-400 italic">
                        No financial items found
                    </div>
                )}
            </div>

            {/* Footer Total */}
            {!loading && items.length > 0 && (
                <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/30 font-black">
                    <span className="text-sm text-gray-900">{total_label}</span>
                    <span className="text-lg text-gray-900">{formatCurrency(totalSum)}</span>
                </div>
            )}
        </div>
    );
}
