import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        subject: '',
        content: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('email-templates.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Create Email Template</h2>}
        >
            <Head title="Create Email Template" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <Link href={route('email-templates.index')} className="text-gray-500 hover:text-gray-800 flex items-center text-sm">
                                <ArrowLeft className="w-4 h-4 mr-1" /> Back to List
                            </Link>
                        </div>

                        <form onSubmit={submit} className="space-y-6 max-w-2xl">
                            <div>
                                <InputLabel htmlFor="name" value="Template Name" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) => {
                                        setData({
                                            ...data,
                                            name: e.target.value,
                                            slug: e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
                                        });
                                    }}
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="slug" value="Slug (Internal Identifier)" />
                                <TextInput
                                    id="slug"
                                    type="text"
                                    className="mt-1 block w-full bg-gray-50 font-mono"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    required
                                />
                                <InputError message={errors.slug} className="mt-2" />
                                <p className="mt-1 text-xs text-gray-400 italic">Used for programmatic access, e.g. Mail::send('slug')</p>
                            </div>

                            <div>
                                <InputLabel htmlFor="subject" value="Email Subject" />
                                <TextInput
                                    id="subject"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    required
                                />
                                <InputError message={errors.subject} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="content" value="HTML Content" />
                                <textarea
                                    id="content"
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm min-h-[300px] font-mono whitespace-pre"
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    required
                                />
                                <InputError message={errors.content} className="mt-2" />
                            </div>

                            <div className="flex items-center gap-4">
                                <PrimaryButton disabled={processing}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Template
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
