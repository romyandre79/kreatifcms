import { Head, Link, usePage } from '@inertiajs/react';
import DynamicPageRenderer from '@/Components/DynamicPageRenderer';
import { LogIn, LayoutDashboard } from 'lucide-react';

export default function Page({ page, reusableBlocks }) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Head title={page.title} />

            {/* Public Header Navbar */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex-shrink-0 flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-indigo-500/30">
                                <span className="text-white font-bold text-xl tracking-tighter">D</span>
                            </div>
                            <span className="font-bold text-xl tracking-tight text-gray-900 hidden sm:block">Doran Internal</span>
                        </div>

                        <nav className="flex items-center gap-4 relative z-10">
                            {auth && auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-lg text-sm font-semibold transition-all group"
                                >
                                    <LayoutDashboard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    <span>Dashboard</span>
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="inline-flex items-center gap-2 bg-gray-900 text-white hover:bg-black px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-gray-900/10 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                                >
                                    <LogIn className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    Log in to Portal
                                </Link>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Dynamic Content */}
            <main className="flex-grow">
                <DynamicPageRenderer blocks={page.blocks} reusableBlocks={reusableBlocks} />
            </main>

            {/* Public Footer */}
            <footer className="bg-white border-t border-gray-100 py-12 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                         <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                            <span className="text-white font-bold text-sm tracking-tighter">D</span>
                        </div>
                        <span className="font-bold text-lg tracking-tight text-gray-900">Doran Internal</span>
                    </div>
                    <p className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} Doran. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
