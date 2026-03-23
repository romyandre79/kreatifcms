import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

export default function Login({ status, canResetPassword }) {
    const { captcha_site_key } = usePage().props;
    const recaptchaRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        captcha_token: '',
    });

    useEffect(() => {
        if (!captcha_site_key) return;

        const renderRecaptcha = () => {
            if (window.grecaptcha && window.grecaptcha.render && recaptchaRef.current) {
                try {
                    window.grecaptcha.render(recaptchaRef.current, {
                        sitekey: captcha_site_key,
                        callback: (token) => {
                            setData('captcha_token', token);
                        },
                        'expired-callback': () => {
                            setData('captcha_token', '');
                        },
                    });
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
            }
        } else {
            renderRecaptcha();
        }
    }, [captcha_site_key]);

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Remember me
                        </span>
                    </label>
                </div>
                {captcha_site_key && (
                    <div className="mt-4">
                        <div ref={recaptchaRef}></div>
                        <InputError message={errors.captcha_token} className="mt-2" />
                    </div>
                )}

                <div className="mt-4 flex items-center justify-end">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Forgot your password?
                        </Link>
                    )}

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
