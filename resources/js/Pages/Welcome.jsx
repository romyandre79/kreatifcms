import { Head, Link } from '@inertiajs/react';
import { Layout, Box, Zap, Globe, Shield, ArrowRight, LayoutGrid, Database, Layers } from 'lucide-react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white">
            <Head title="Welcome to Kreatif CMS" />
            
            {/* Background Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-200/40 rounded-full blur-[120px]" />
            </div>

            <nav className="relative z-10 px-6 py-8 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                        <Zap className="text-white w-6 h-6 fill-current" />
                    </div>
                    <span className="text-2xl font-black text-slate-900 tracking-tight">KREATIF<span className="text-indigo-600">CMS</span></span>
                </div>
                
                <div className="flex items-center gap-4">
                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-md transition-all hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                        >
                            Return to Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link href={route('login')} className="text-slate-600 font-bold hover:text-indigo-600 transition-colors">Log in</Link>
                            <Link
                                href={route('register')}
                                className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-full font-bold shadow-md transition-all hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            <main className="relative z-10 pt-12 pb-24">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Hero Section */}
                    <div className="text-center max-w-4xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 border border-slate-200 rounded-full text-indigo-600 text-sm font-bold mb-8 shadow-sm backdrop-blur-sm">
                            <span className="flex h-2 w-2 rounded-full bg-indigo-600"></span>
                            Version 2.0 Now Available
                        </div>
                        <h1 className="text-6xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1]">
                            Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Something Beautiful</span> in Minutes.
                        </h1>
                        <p className="text-xl text-slate-500 mb-10 leading-relaxed max-w-2xl mx-auto">
                            The ultimate headless CMS experience for Laravel. Fast, flexible, and completely visual. Your content has never looked this good.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href={route('register')}
                                className="w-full sm:w-auto px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 transition-all hover:shadow-2xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                            >
                                Start Building for Free
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <a
                                href="#features"
                                className="w-full sm:w-auto px-10 py-5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center"
                            >
                                Explore Features
                            </a>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 scroll-mt-24">
                        {[
                            {
                                icon: <Layout className="w-8 h-8" />,
                                title: "Visual Page Builder",
                                desc: "Drag and drop components to build stunning landing pages. Completely visual, no code required.",
                                color: "bg-indigo-50 text-indigo-600"
                            },
                            {
                                icon: <Database className="w-8 h-8" />,
                                title: "Dynamic Content Types",
                                desc: "Define your own data structures. From products to portfolios, Kreatif handles any schema.",
                                color: "bg-violet-50 text-violet-600"
                            },
                            {
                                icon: <Layers className="w-8 h-8" />,
                                title: "Plugin Ecosystem",
                                desc: "Extend your CMS with 1-click plugins. Forms, SEO, Media, and more at your fingertips.",
                                color: "bg-fuchsia-50 text-fuchsia-600"
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="group p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all duration-500 hover:-translate-y-2">
                                <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">{feature.title}</h3>
                                <p className="text-slate-500 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Dashboard Preview Section */}
                    <div className="mt-32 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent z-10 h-64 bottom-0 pointer-events-none" />
                        <div className="p-4 bg-white border border-slate-200 rounded-[3rem] shadow-2xl overflow-hidden">
                            <div className="bg-slate-900 rounded-[2rem] p-4 aspect-[16/9] flex items-center justify-center overflow-hidden">
                                <div className="text-center animate-pulse">
                                    <Zap className="w-20 h-20 text-indigo-500 mb-6 mx-auto opacity-50" />
                                    <h2 className="text-2xl font-bold text-white/40 uppercase tracking-[0.2em]">Dashboard Preview</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="relative z-10 border-t border-slate-200 bg-white/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Zap className="text-indigo-600 w-5 h-5 fill-current" />
                        <span className="font-black text-slate-900 tracking-tight">KREATIF<span className="text-indigo-600">CMS</span></span>
                    </div>
                    <div className="text-slate-500 text-sm font-medium">
                        Powered by Laravel v{laravelVersion} (PHP v{phpVersion})
                    </div>
                    <div className="flex gap-8">
                        <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">Documentation</a>
                        <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">GitHub</a>
                        <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
