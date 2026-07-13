import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as LucideIcons from 'lucide-react';

export default function MetricCardBlock({ data = {} }) {
    const {
        title = 'Metric Card',
        content_type = '',
        aggregate_function = 'count',
        aggregate_field = '',
        filter_field = '',
        filter_value = '',
        format_type = 'currency', // currency, number, decimal
        bg_color = '#ffffff',
        text_color = '#1f2937',
        icon = 'Calculator',
        trend = 'none', // up, down, none
        trend_color = 'emerald' // emerald, red, indigo, none
    } = data;

    const [value, setValue] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!content_type) {
            setValue(0);
            return;
        }

        setLoading(true);
        axios.get('/api/metrics/calculate', {
            params: {
                content_type,
                aggregate_function,
                aggregate_field,
                filter_field,
                filter_value
            }
        })
        .then(res => {
            if (res.data && res.data.success) {
                setValue(res.data.value);
            }
        })
        .catch(err => {
            console.error('[MetricCardBlock] Error calculating metric:', err);
            setValue(0);
        })
        .finally(() => {
            setLoading(false);
        });
    }, [content_type, aggregate_function, aggregate_field, filter_field, filter_value]);

    // Format display value
    const formatValue = (val) => {
        if (val === null || val === undefined) return '...';
        const num = parseFloat(val);
        if (isNaN(num)) return val;

        if (format_type === 'currency') {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(num);
        } else if (format_type === 'decimal') {
            return new Intl.NumberFormat('id-ID', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(num);
        }

        return new Intl.NumberFormat('id-ID').format(num);
    };

    // Dynamically retrieve Lucide Icon
    const IconComponent = LucideIcons[icon] || LucideIcons.Calculator;

    // Trend color styling helper
    const getTrendBgClass = () => {
        switch (trend_color) {
            case 'emerald': return 'bg-emerald-50 text-emerald-600';
            case 'red': return 'bg-red-50 text-red-600';
            case 'indigo': return 'bg-indigo-50 text-indigo-600';
            default: return 'bg-gray-50 text-gray-600';
        }
    };

    const getTrendIcon = () => {
        if (trend === 'up') return <LucideIcons.TrendingUp className="w-4 h-4" />;
        if (trend === 'down') return <LucideIcons.TrendingDown className="w-4 h-4" />;
        return null;
    };

    return (
        <div 
            className="p-6 rounded-3xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md flex items-center justify-between min-h-[110px]"
            style={{ backgroundColor: bg_color, color: text_color }}
        >
            <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                    {title}
                </span>
                <div className="text-2xl font-black tracking-tight">
                    {loading ? (
                        <div className="h-7 w-24 bg-gray-200/50 animate-pulse rounded-md mt-1" />
                    ) : (
                        formatValue(value)
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                {trend !== 'none' && (
                    <div className={`p-2.5 rounded-2xl flex items-center justify-center ${getTrendBgClass()}`}>
                        {getTrendIcon()}
                    </div>
                )}
                <div className="p-3 bg-gray-50 text-gray-500 rounded-2xl flex items-center justify-center border border-gray-100/50">
                    <IconComponent className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
}
