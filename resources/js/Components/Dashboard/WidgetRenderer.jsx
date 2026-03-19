import React from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { TrendingUp, Database, List } from 'lucide-react';

export default function WidgetRenderer({ widget }) {
    const { type, data, settings } = widget;

    const formatDate = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') return dateStr;
        // Check if it looks like a YYYY-MM-DD date
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            const [y, m, d] = dateStr.split('-');
            return `${d}-${m}-${y}`;
        }
        return dateStr;
    };

    const formatNumber = (num) => {
        if (num === null || num === undefined || isNaN(num)) return num;
        return new Intl.NumberFormat('id-ID').format(num);
    };

    if (!data && data !== 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <Database className="w-8 h-8 opacity-20" />
                <p className="text-xs italic">No data available for this configuration</p>
            </div>
        );
    }

    if (type === 'stats') {
        return (
            <div className="h-full flex flex-col justify-center">
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-gray-900 tracking-tight">
                        {formatNumber(data)}
                    </span>
                    {widget.aggregate_function === 'count' && (
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Entries</span>
                    )}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-green-600 bg-green-50 w-fit px-2 py-0.5 rounded-full border border-green-100">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-[10px] font-bold italic">Real-time update</span>
                </div>
            </div>
        );
    }

    if (type === 'chart') {
        const chartType = settings?.chartType || 'bar';
        const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

        return (
            <div className="h-full w-full min-h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'line' ? (
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey={widget.group_by_field || 'date'} 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                interval="preserveStartEnd"
                                tickFormatter={formatDate}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fill: '#94a3b8' }} 
                                tickFormatter={formatNumber}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value) => [formatNumber(value), 'Value']}
                            />
                            <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                        </LineChart>
                    ) : chartType === 'pie' ? (
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="total"
                                nameKey={widget.group_by_field || 'date'}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    ) : (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey={widget.group_by_field || 'date'} 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                tickFormatter={formatDate}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fill: '#94a3b8' }} 
                                tickFormatter={formatNumber}
                            />
                            <Tooltip 
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value) => [formatNumber(value), 'Value']}
                            />
                            <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center h-full text-gray-400 italic text-sm">
            Unsupported widget type: {type}
        </div>
    );
}
