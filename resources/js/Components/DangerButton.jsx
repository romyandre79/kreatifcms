import { useTrans } from '@/Utils/trans';

export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    const { t } = useTrans();
    
    const translatedChildren = typeof children === 'string'
        ? (t(children, 'general') !== children ? t(children, 'general') : t(children, 'ui'))
        : children;

    return (
        <button
            {...props}
            className={
                `inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-xl font-bold text-xs text-white uppercase tracking-widest hover:bg-red-700 active:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all shadow-md shadow-red-100 disabled:opacity-50 ` +
                className
            }
            disabled={disabled}
        >
            {translatedChildren}
        </button>
    );
}
