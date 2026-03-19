import React, { useState, useEffect } from 'react';
import { X, Clock, User, ArrowRight, Globe, Monitor } from 'lucide-react';
import axios from 'axios';

export default function HistoryModal({ isOpen, onClose, contentTypeSlug, rowId }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && contentTypeSlug && rowId) {
            setLoading(true);
            axios.get(route('content-entries.history', { slug: contentTypeSlug, id: rowId }))
                .then(res => {
                    setLogs(res.data);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [isOpen, contentTypeSlug, rowId]);

    if (!isOpen) return null;

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderDiff = (oldVals, newVals) => {
        if (!oldVals && newVals) return <span className="text-green-600 italic">Initial creation</span>;
        if (oldVals && !newVals) return <span className="text-red-600 italic">Deleted</span>;

        const changes = [];
        const allKeys = new Set([...Object.keys(oldVals || {}), ...Object.keys(newVals || {})]);
        
        allKeys.forEach(key => {
            if (key === 'updated_at' || key === 'id' || key === 'created_at' || key === 'user_id') return;
            if (oldVals[key] !== newVals[key]) {
                changes.push(
                    <div key={key} className="text-xs mb-1">
                        <span className="font-semibold text-gray-700 capitalize">{key.replace(/_/g, ' ')}:</span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-red-500 line-through truncate max-w-[150px]">{oldVals[key] || 'null'}</span>
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                            <span className="text-green-600 font-medium truncate max-w-[150px]">{newVals[key] || 'null'}</span>
                        </div>
                    </div>
                );
            }
        });

        return changes.length > 0 ? changes : <span className="text-gray-400 italic">No field changes</span>;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Clock className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Data History</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Entry ID: {rowId}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                            <p className="text-sm text-gray-500">Loading history...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12">
                            <Clock className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">No history found for this entry.</p>
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100"></div>
                            
                            <div className="space-y-8">
                                {logs.map((log, index) => (
                                    <div key={log.id} className="relative pl-10">
                                        {/* Dot */}
                                        <div className={`absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm z-10 ${
                                            log.action === 'created' ? 'bg-green-500' : 
                                            log.action === 'deleted' ? 'bg-red-500' : 'bg-indigo-500'
                                        }`}></div>

                                        <div className="bg-white border rounded-xl p-4 shadow-sm hover:border-indigo-200 transition-colors">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                                        <User className="w-3.5 h-3.5 text-gray-500" />
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-800">
                                                        {log.user?.name || 'Unknown User'}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded">
                                                    {formatDate(log.created_at)}
                                                </span>
                                            </div>

                                            <div className="mb-3 flex flex-wrap gap-2">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                                                    log.action === 'created' ? 'text-green-700 bg-green-50' : 
                                                    log.action === 'deleted' ? 'text-red-700 bg-red-50' : 'text-indigo-700 bg-indigo-50'
                                                }`}>
                                                    {log.action}
                                                </span>
                                                {log.ip_address && (
                                                    <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 flex items-center gap-1">
                                                        <Globe className="w-2.5 h-2.5" />
                                                        {log.ip_address}
                                                    </span>
                                                )}
                                                {log.user_agent && (
                                                    <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 flex items-center gap-1 max-w-[200px] truncate" title={log.user_agent}>
                                                        <Monitor className="w-2.5 h-2.5" />
                                                        {log.user_agent.split(')')[0].split('(')[1] || 'Device'}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                                                {renderDiff(log.old_values, log.new_values)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
