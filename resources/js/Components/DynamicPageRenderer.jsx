import ReactMarkdown from 'react-markdown';
import { Link } from '@inertiajs/react';

// Block Components for Frontend Display

const HeroBlock = ({ data = {} }) => (
    <div className="relative overflow-hidden bg-gray-900 text-white min-h-[60vh] flex items-center justify-center">
        {data.bgImage && (
            <div className="absolute inset-0">
                <img src={data.bgImage} className="w-full h-full object-cover opacity-30" alt="Background" />
            </div>
        )}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                {data.title || ''}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                {data.subtitle || ''}
            </p>
            {data.buttonText && data.buttonLink && (
                <Link 
                    href={data.buttonLink} 
                    className="inline-flex px-8 py-4 text-lg font-bold rounded-full bg-white text-gray-900 hover:bg-gray-100 hover:scale-[1.02] transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                >
                    {data.buttonText}
                </Link>
            )}
        </div>
    </div>
);

const TextBlock = ({ data = {} }) => (
    <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <div className={`prose prose-lg md:prose-xl max-w-none text-${data.align || 'left'} prose-indigo prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 hover:prose-a:text-indigo-500`}>
            <ReactMarkdown>{data.content || ''}</ReactMarkdown>
        </div>
    </div>
);

const ImageBlock = ({ data = {} }) => (
    <div className="max-w-6xl mx-auto px-4 py-12">
        <figure className="relative rounded-2xl overflow-hidden shadow-xl bg-gray-100 border border-gray-200">
            {data.url ? (
                <img src={data.url} alt={data.caption || 'Image'} className="w-full h-auto object-cover" />
            ) : (
                <div className="w-full aspect-video flex items-center justify-center text-gray-400 bg-gray-50 font-mono text-sm border-2 border-dashed border-gray-200">Image Placeholder</div>
            )}
            {data.caption && (
                <figcaption className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-gray-900/80 to-transparent p-6 pt-12">
                    <p className="text-white text-sm font-medium">{data.caption}</p>
                </figcaption>
            )}
        </figure>
    </div>
);

const FeatureGridBlock = ({ data = {} }) => {
    const features = Array.isArray(data.features) ? data.features : [];
    return (
    <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center mb-16">
                <h2 className="text-base font-semibold leading-7 text-indigo-600 tracking-wide uppercase">{data.title || ''}</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Everything you need to succeed</p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                    {features.map((feature, idx) => (
                        <div key={idx} className="flex flex-col bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
                            <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-gray-900">
                                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-600 group-hover:bg-indigo-500 transition-colors">
                                    <span className="text-white font-bold">{idx + 1}</span>
                                </div>
                                {feature.title}
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                <p className="flex-auto">{feature.desc}</p>
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>
        </div>
    </div>
)};

// Component Mapper
const BlockComponents = {
    hero: HeroBlock,
    text: TextBlock,
    image: ImageBlock,
    feature_grid: FeatureGridBlock
};

export default function DynamicPageRenderer({ blocks, reusableBlocks = [] }) {
    if (!blocks || blocks.length === 0) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 m-8">
                <p className="text-lg font-medium">This page currently has no content.</p>
            </div>
        );
    }

    return (
        <div className="dynamic-page-content font-sans antialiased text-gray-900 bg-white">
            {blocks.map((block) => {
                let actualType = block.type;
                let actualData = block.data;

                if (block.type === 'reusable_block') {
                    const savedBlock = reusableBlocks.find(b => b.id == block.data?.block_id);
                    if (savedBlock) {
                        actualType = savedBlock.type;
                        actualData = savedBlock.data;
                    } else {
                        return <div key={block.id} className="p-4 text-gray-500 bg-gray-50 border border-gray-200 m-4 rounded">Select a reusable block.</div>;
                    }
                }

                const Component = BlockComponents[actualType];
                if (!Component) {
                    return <div key={block.id} className="p-4 text-red-500 bg-red-50 border border-red-200 m-4 rounded">Unknown block type: {actualType}</div>;
                }
                return <Component key={block.id} data={actualData} />;
            })}
        </div>
    );
}
