import { useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';

export default function TwoFactorChallenge({ status }) {
    const [recovery, setRecovery] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        recovery_code: '',
    });

    const toggleRecovery = () => {
        setRecovery(!recovery);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('two-factor.challenge.verify'));
    };

    return (
        <GuestLayout>
            <Head title="Two-factor Confirmation" />

            <div className="mb-4 text-sm text-gray-600">
                {recovery
                    ? 'Please confirm access to your account by entering one of your emergency recovery codes.'
                    : 'Please confirm access to your account by entering the authentication code provided by your authenticator application.'}
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                {!recovery ? (
                    <div>
                        <InputLabel htmlFor="code" value="Code" />
                        <TextInput
                            id="code"
                            type="text"
                            inputMode="numeric"
                            className="mt-1 block w-full"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            autoFocus
                            autoComplete="one-time-code"
                        />
                        <InputError message={errors.code} className="mt-2" />
                    </div>
                ) : (
                    <div>
                        <InputLabel htmlFor="recovery_code" value="Recovery Code" />
                        <TextInput
                            id="recovery_code"
                            type="text"
                            className="mt-1 block w-full"
                            value={data.recovery_code}
                            onChange={(e) => setData('recovery_code', e.target.value)}
                            autoFocus
                            autoComplete="one-time-code"
                        />
                        <InputError message={errors.recovery_code} className="mt-2" />
                    </div>
                )}

                <div className="mt-4 flex items-center justify-end">
                    <SecondaryButton type="button" onClick={toggleRecovery}>
                        {recovery ? 'Use an authentication code' : 'Use a recovery code'}
                    </SecondaryButton>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
