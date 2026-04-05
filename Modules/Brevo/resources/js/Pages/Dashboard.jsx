import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { 
    Mail, 
    MessageSquare, 
    Send, 
    Plus, 
    BarChart3, 
    Inbox, 
    Settings as SettingsIcon,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Clock
} from 'lucide-react';

export default function Dashboard({ auth, campaigns, inboundEmails, account }) {
    const [activeTab, setActiveTab] = useState('campaigns');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        type: 'email',
        subject: '',
        content: '',
        recipients: [1] // Default list ID for Brevo
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('brevo.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                reset();
            }
        });
    };

    const stats = [
        { label: 'Emails Sent', value: account?.plan?.[0]?.credits || 0, icon: Mail, color: 'text-blue-600' },
        { label: 'WA Sent', value: 'Active', icon: MessageSquare, color: 'text-green-600' },
        { label: 'Total Campaigns', value: campaigns.length, icon: BarChart3, color: 'text-purple-600' },
        { label: 'Inbound Messages', value: inboundEmails.length, icon: Inbox, color: 'text-amber-600' },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Brevo Marketing Hub</h2>}
        >
            <Head title="Brevo Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                    </div>
                                    <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setActiveTab('campaigns')}
                                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'campaigns' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    Campaigns
                                </button>
                                <button 
                                    onClick={() => setActiveTab('inbox')}
                                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'inbox' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    Inbound Inbox
                                </button>
                            </div>
                            <button 
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                New Campaign
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            {activeTab === 'campaigns' ? (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {campaigns.map((campaign) => (
                                            <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-gray-900">{campaign.name}</div>
                                                    <div className="text-xs text-gray-500">{campaign.subject || 'WhatsApp Blast'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${campaign.type === 'email' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                        {campaign.type === 'email' ? <Mail className="w-3 h-3 mr-1" /> : <MessageSquare className="w-3 h-3 mr-1" />}
                                                        {campaign.type.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${campaign.status === 'sent' ? 'bg-green-100 text-green-800' : campaign.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                                                        {campaign.status === 'sent' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : campaign.status === 'failed' ? <AlertCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                                                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(campaign.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <button className="text-gray-400 hover:text-red-600 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-12 text-center text-gray-500">
                                    <Inbox className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>Your inbound inbox is empty.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Campaign Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-indigo-600">
                            <h3 className="text-lg font-bold text-white">Create New Campaign</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-indigo-100 hover:text-white">&times;</button>
                        </div>
                        <form onSubmit={submit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Campaign Name</label>
                                <input 
                                    type="text" 
                                    value={data.name} 
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                                    placeholder="Newsletter April 2024"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div className="flex gap-4">
                                <label className="flex items-center">
                                    <input 
                                        type="radio" 
                                        name="type" 
                                        checked={data.type === 'email'} 
                                        onChange={() => setData('type', 'email')}
                                        className="text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">Email Campaign</span>
                                </label>
                                <label className="flex items-center">
                                    <input 
                                        type="radio" 
                                        name="type" 
                                        checked={data.type === 'whatsapp'} 
                                        onChange={() => setData('type', 'whatsapp')}
                                        className="text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">WhatsApp Blast</span>
                                </label>
                            </div>

                            {data.type === 'email' && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Subject Line</label>
                                    <input 
                                        type="text" 
                                        value={data.subject} 
                                        onChange={e => setData('subject', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                                        placeholder="Special Offer for You!"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    {data.type === 'email' ? 'Email Content (HTML)' : 'WhatsApp Template ID'}
                                </label>
                                <textarea 
                                    value={data.content} 
                                    onChange={e => setData('content', e.target.value)}
                                    rows="6"
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono text-sm" 
                                    placeholder={data.type === 'email' ? '<h1>Hello!</h1>...' : 'template_id_123'}
                                />
                                {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Launch Campaign
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
