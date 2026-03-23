import React, { useState, useEffect } from 'react';
import { WifiOff, AlertCircle, X } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function NetworkErrorBanner() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [serverError, setServerError] = useState(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            if (!serverError) setVisible(false);
        };
        const handleOffline = () => {
            setIsOffline(true);
            setVisible(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        // Axios interceptor for low-level connection failures (status 0)
        const axiosInterceptor = window.axios.interceptors.response.use(
            response => response,
            error => {
                if (!error.response || error.response.status === 0) {
                    setServerError('Unable to connect to the server. Please check if the backend is running.');
                    setVisible(true);
                }
                return Promise.reject(error);
            }
        );

        const unregisterError = router.on('error', (event) => {
            // Usually validation errors, we don't necessarily want a banner for these
            // but we can log them
            console.error('Inertia Error:', event.detail.errors);
        });

        const unregisterException = router.on('exception', (event) => {
            setServerError('The server encountered an error or is unreachable.');
            setVisible(true);
            console.error('Inertia Exception:', event.detail.exception);
        });

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            unregisterError();
            unregisterException();
            window.axios.interceptors.response.eject(axiosInterceptor);
        };
    }, [serverError]);

    if (!visible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] animate-in slide-in-from-top duration-300">
            <div className={`flex items-center justify-between px-4 py-3 text-white shadow-lg ${isOffline ? 'bg-gray-900' : 'bg-red-600'}`}>
                <div className="flex items-center gap-3">
                    {isOffline ? (
                        <WifiOff className="w-5 h-5 text-gray-400" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-white animate-pulse" />
                    )}
                    <div className="flex flex-col">
                        <span className="text-sm font-bold uppercase tracking-wider">
                            {isOffline ? 'Offline' : 'Connection Error'}
                        </span>
                        <span className="text-xs opacity-90">
                            {isOffline 
                                ? 'Your internet connection was lost. Please check your network cables or Wi-Fi.' 
                                : serverError || 'Unable to communicate with the server. Please check your connection or try again later.'}
                        </span>
                    </div>
                </div>
                <button 
                    onClick={() => setVisible(false)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
