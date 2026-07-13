import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { FileText, Coins, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

export default function Reports({ balanceSheet, profitAndLoss }) {
    const [activeTab, setActiveTab] = useState('pnl');

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 2
        }).format(val || 0);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Financial Reports" />

            <div className="py-6 px-6 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Financial Reports</h1>
                        <p className="text-sm text-slate-500 mt-1">Real-time Balance Sheet and Profit & Loss Statement</p>
                    </div>

                    <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl mt-4 md:mt-0">
                        <button
                            onClick={() => setActiveTab('pnl')}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                activeTab === 'pnl'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <TrendingUp className="w-4 h-4" />
                            <span>Profit & Loss</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('bs')}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                activeTab === 'bs'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <FileText className="w-4 h-4" />
                            <span>Balance Sheet</span>
                        </button>
                    </div>
                </div>

                {/* Profit & Loss Tab */}
                {activeTab === 'pnl' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Summary Widget */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</span>
                                    <h3 className="text-xl font-bold text-slate-800">{formatCurrency(profitAndLoss.total_revenue)}</h3>
                                </div>
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <ArrowUpRight className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Expenses</span>
                                    <h3 className="text-xl font-bold text-slate-800">{formatCurrency(profitAndLoss.total_expenses)}</h3>
                                </div>
                                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                                    <ArrowDownRight className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="bg-indigo-900 p-5 rounded-2xl shadow-md text-white flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">Net Profit</span>
                                    <h3 className="text-xl font-bold">{formatCurrency(profitAndLoss.net_profit)}</h3>
                                </div>
                                <div className="p-3 bg-indigo-800 text-indigo-300 rounded-xl">
                                    <Coins className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        {/* Statement Table Card */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
                                <h2 className="text-sm font-bold text-slate-700">Profit & Loss Statement</h2>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {/* Revenue */}
                                <div className="p-6 space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600">Revenues</h3>
                                    <table className="w-full text-sm">
                                        <tbody>
                                            {profitAndLoss.revenue.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50">
                                                    <td className="py-2 text-slate-500 font-mono w-24">{item.code}</td>
                                                    <td className="py-2 text-slate-800 font-medium">{item.name}</td>
                                                    <td className="py-2 text-right text-slate-800 font-semibold">{formatCurrency(item.balance)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Expenses */}
                                <div className="p-6 space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600">Expenses</h3>
                                    <table className="w-full text-sm">
                                        <tbody>
                                            {profitAndLoss.expenses.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50">
                                                    <td className="py-2 text-slate-500 font-mono w-24">{item.code}</td>
                                                    <td className="py-2 text-slate-800 font-medium">{item.name}</td>
                                                    <td className="py-2 text-right text-slate-800 font-semibold">{formatCurrency(item.balance)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Net Summary */}
                                <div className="p-6 bg-slate-50 flex items-center justify-between text-base font-bold text-slate-800">
                                    <span>Net Profit / Loss</span>
                                    <span className={profitAndLoss.net_profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                        {formatCurrency(profitAndLoss.net_profit)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Balance Sheet Tab */}
                {activeTab === 'bs' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                        {/* Assets Side */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between overflow-hidden">
                            <div>
                                <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                                    <h2 className="text-sm font-bold text-slate-700">Assets</h2>
                                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold">Debit Balance</span>
                                </div>
                                <div className="p-6">
                                    <table className="w-full text-sm">
                                        <tbody>
                                            {balanceSheet.assets.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                                                    <td className="py-3 text-slate-500 font-mono w-24">{item.code}</td>
                                                    <td className="py-3 text-slate-800 font-medium">{item.name}</td>
                                                    <td className="py-3 text-right text-slate-800 font-semibold">{formatCurrency(item.balance)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-base font-bold text-slate-800">
                                <span>Total Assets</span>
                                <span>{formatCurrency(balanceSheet.total_assets)}</span>
                            </div>
                        </div>

                        {/* Liabilities & Equity Side */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between overflow-hidden">
                            <div>
                                <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                                    <h2 className="text-sm font-bold text-slate-700">Liabilities & Equity</h2>
                                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-bold">Credit Balance</span>
                                </div>
                                <div className="p-6 divide-y divide-slate-100">
                                    {/* Liabilities */}
                                    <div className="pb-4">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Liabilities</h3>
                                        <table className="w-full text-sm">
                                            <tbody>
                                                {balanceSheet.liabilities.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50">
                                                        <td className="py-2 text-slate-500 font-mono w-24">{item.code}</td>
                                                        <td className="py-2 text-slate-800 font-medium">{item.name}</td>
                                                        <td className="py-2 text-right text-slate-800 font-semibold">{formatCurrency(item.balance)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Equity */}
                                    <div className="pt-4">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Equity</h3>
                                        <table className="w-full text-sm">
                                            <tbody>
                                                {balanceSheet.equity.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50">
                                                        <td className="py-2 text-slate-500 font-mono w-24">{item.code}</td>
                                                        <td className="py-2 text-slate-800 font-medium">{item.name}</td>
                                                        <td className="py-2 text-right text-slate-800 font-semibold">{formatCurrency(item.balance)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-base font-bold text-slate-800">
                                <span>Total Liabilities & Equity</span>
                                <span>{formatCurrency(balanceSheet.total_liabilities + balanceSheet.total_equity)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
