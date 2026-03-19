import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Globe, Lock, Code } from 'lucide-react';

export default function ApiDocsModal({ isOpen, onClose, contentType }) {
    if (!isOpen || !contentType) return null;

    const [copied, setCopied] = useState(null);
    const baseUrl = window.location.origin;
    const slug = contentType.slug;

    const copyToClipboard = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const endpoints = [
        {
            method: 'GET',
            path: `/api/content/${slug}`,
            desc: 'List all entries',
            auth: true,
        },
        {
            method: 'POST',
            path: `/api/content/${slug}`,
            desc: 'Create new entry',
            auth: true,
            body: contentType.fields.reduce((acc, field) => {
                if (field.name === 'id' || field.name === 'created_at' || field.name === 'updated_at') return acc;
                acc[field.name.toLowerCase().replace(/\s+/g, '_')] = field.type === 'integer' ? 123 : (field.type === 'date' ? '2024-03-18' : 'example value');
                return acc;
            }, {}),
        },
        {
            method: 'GET',
            path: `/api/content/${slug}/{id}`,
            desc: 'Get single entry',
            auth: true,
        },
        {
            method: 'PUT',
            path: `/api/content/${slug}/{id}`,
            desc: 'Update entry',
            auth: true,
            body: contentType.fields.reduce((acc, field) => {
                if (field.name === 'id' || field.name === 'created_at' || field.name === 'updated_at') return acc;
                acc[field.name.toLowerCase().replace(/\s+/g, '_')] = 'updated value';
                return acc;
            }, {}),
        },
        {
            method: 'DELETE',
            path: `/api/content/${slug}/{id}`,
            desc: 'Delete entry',
            auth: true,
        },
    ];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                    <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
                        <div className="flex items-center">
                            <Terminal className="w-5 h-5 text-indigo-600 mr-2" />
                            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">
                                API Documentation: <span className="text-indigo-600">{contentType.name}</span>
                            </h3>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="px-6 py-6 overflow-y-auto max-h-[70vh]">
                        {/* Auth Section */}
                        <div className="mb-8 overflow-hidden rounded-xl border border-amber-100 bg-amber-50/30 p-4">
                            <div className="flex items-center mb-3">
                                <Lock className="w-4 h-4 text-amber-600 mr-2" />
                                <h4 className="text-sm font-bold text-amber-900 uppercase tracking-wider">Authentication</h4>
                            </div>
                            <p className="text-sm text-amber-800 mb-3">
                                All requests require a JWT token in the Authorization header.
                            </p>
                            <div className="bg-gray-900 rounded-lg p-3 flex justify-between items-center group">
                                <code className="text-xs text-indigo-300">
                                    Authorization: Bearer &lt;your_jwt_token&gt;
                                </code>
                                <button 
                                    onClick={() => copyToClipboard('Authorization: Bearer <your_jwt_token>', 'auth')}
                                    className="text-gray-500 hover:text-white transition-colors"
                                >
                                    {copied === 'auth' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Endpoints */}
                        <div className="space-y-6">
                            {endpoints.map((ep, idx) => (
                                <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden hover:border-indigo-100 transition-colors">
                                    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                ep.method === 'GET' ? 'bg-green-100 text-green-700' :
                                                ep.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                                                ep.method === 'PUT' ? 'bg-amber-100 text-amber-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {ep.method}
                                            </span>
                                            <span className="text-sm font-medium text-gray-700">{ep.desc}</span>
                                        </div>
                                        <div className="flex items-center text-gray-400 text-xs">
                                            <Globe className="w-3 h-3 mr-1" />
                                            {baseUrl}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white">
                                        <div className="bg-gray-900 rounded-lg p-3 flex justify-between items-center mb-3 group">
                                            <code className="text-xs text-green-400 break-all">
                                                {ep.path}
                                            </code>
                                            <button 
                                                onClick={() => copyToClipboard(`${baseUrl}${ep.path}`, `path-${idx}`)}
                                                className="text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                {copied === `path-${idx}` ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>

                                        {ep.body && (
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                                        <Code className="w-3 h-3 mr-1" /> Body JSON
                                                    </span>
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 relative group">
                                                    <pre className="text-[11px] text-gray-600 overflow-x-auto">
                                                        {JSON.stringify(ep.body, null, 2)}
                                                    </pre>
                                                    <button 
                                                        onClick={() => copyToClipboard(JSON.stringify(ep.body, null, 2), `body-${idx}`)}
                                                        className="absolute top-2 right-2 text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        {copied === `body-${idx}` ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
