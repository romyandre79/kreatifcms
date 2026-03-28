import React, { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';

export default function CaptchaWidget({ onToken, error }) {
    const { captcha_site_key } = usePage().props;
    const recaptchaRef = useRef(null);

    useEffect(() => {
        if (!captcha_site_key) return;

        let isMounted = true;

        const renderRecaptcha = () => {
            if (!isMounted || !recaptchaRef.current) return;

            if (window.grecaptcha && window.grecaptcha.render) {
                try {
                    // Check if already rendered to avoid duplicates
                    if (recaptchaRef.current.children.length === 0) {
                        window.grecaptcha.render(recaptchaRef.current, {
                            sitekey: captcha_site_key,
                            callback: (token) => {
                                if (onToken) onToken(token);
                            },
                            'expired-callback': () => {
                                if (onToken) onToken('');
                            },
                        });
                    }
                } catch (error) {
                    console.error('ReCaptcha render error:', error);
                }
            } else if (window.grecaptcha) {
                // If grecaptcha exists but render doesn't, wait and try again
                setTimeout(renderRecaptcha, 500);
            }
        };

        // Load ReCaptcha script if not already loaded or if render is missing
        if (!window.grecaptcha || !window.grecaptcha.render) {
            // Check if script already exists to avoid duplicates
            if (!document.querySelector('script[src*="recaptcha/api.js"]')) {
                const script = document.createElement('script');
                script.src = `https://www.google.com/recaptcha/api.js?render=explicit`;
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
                script.onload = renderRecaptcha;
            } else {
                // Script exists but grecaptcha not ready, wait for it
                const interval = setInterval(() => {
                    if (window.grecaptcha && window.grecaptcha.render) {
                        clearInterval(interval);
                        renderRecaptcha();
                    }
                }, 500);
                return () => {
                    clearInterval(interval);
                    isMounted = false;
                };
            }
        } else {
            renderRecaptcha();
        }

        return () => {
            isMounted = false;
        };
    }, [captcha_site_key]);

    if (!captcha_site_key) return null;

    return (
        <div className="captcha-container">
            <div ref={recaptchaRef}></div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
}
