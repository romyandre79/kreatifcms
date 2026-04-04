import { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';

export default function TwoFactorAuthenticationForm({ className = '' }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    
    const [confirmingTwoFactor, setConfirmingTwoFactor] = useState(false);
    const [showingQrCode, setShowingQrCode] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [setupSecret, setSetupSecret] = useState(null);
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    
    const { data, setData, post, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        code: '',
    });

    const enableTwoFactor = () => {
        // First we call setup to get the QR code
        fetch(route('two-factor.setup'), {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            setQrCode(data.qrCodeSvg);
            setSetupSecret(data.secret);
            setShowingQrCode(true);
            setConfirmingTwoFactor(true);
        });
    };

    const confirmTwoFactor = (e) => {
        e.preventDefault();
        post(route('two-factor.confirm'), {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmingTwoFactor(false);
                setShowingQrCode(false);
                reset();
                // Optionally show recovery codes here if not already shown
            },
        });
    };

    const disableTwoFactor = () => {
        destroy(route('two-factor.disable'), {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmingTwoFactor(false);
                setShowingQrCode(false);
            },
        });
    };

    const showRecoveryCodes = () => {
        fetch(route('two-factor.recovery-codes'))
            .then(response => response.json())
            .then(data => {
                setRecoveryCodes(data.recoveryCodes);
            });
    };

    const regenerateRecoveryCodes = () => {
        post(route('two-factor.recovery-codes.regenerate'), {
            preserveScroll: true,
            onSuccess: () => showRecoveryCodes(),
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Two-Factor Authentication
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Add additional security to your account using two-factor authentication.
                </p>
            </header>

            <div className="mt-6">
                {user && !user.two_factor_confirmed_at ? (
                    <div>
                        <PrimaryButton
                            type="button"
                            onClick={enableTwoFactor}
                            disabled={processing}
                        >
                            Enable
                        </PrimaryButton>
                    </div>
                ) : user ? (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <p className="text-sm font-medium text-green-600">
                                Two-factor authentication is enabled.
                            </p>
                            <DangerButton
                                type="button"
                                onClick={disableTwoFactor}
                                disabled={processing}
                            >
                                Disable
                            </DangerButton>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-medium text-gray-900">
                                Recovery Codes
                            </h3>
                            <p className="mt-1 text-xs text-gray-600">
                                Store these recovery codes in a secure password manager. They can be used to recover access to your account if your two-factor authentication device is lost.
                            </p>
                            
                            {recoveryCodes.length > 0 ? (
                                <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg bg-gray-100 p-4 font-mono text-sm">
                                    {recoveryCodes.map((code) => (
                                        <div key={code}>{code}</div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-4">
                                    <SecondaryButton onClick={showRecoveryCodes}>
                                        Show Recovery Codes
                                    </SecondaryButton>
                                </div>
                            )}

                            {recoveryCodes.length > 0 && (
                                <div className="mt-4">
                                    <SecondaryButton onClick={regenerateRecoveryCodes}>
                                        Regenerate Recovery Codes
                                    </SecondaryButton>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-600">Please log in to manage two-factor authentication.</p>
                )}
            </div>

            <Modal show={confirmingTwoFactor} onClose={() => setConfirmingTwoFactor(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Finish enabling two-factor authentication.
                    </h2>

                    <p className="mt-4 text-sm text-gray-600">
                        To finish enabling two-factor authentication, scan the following QR code using your phone's authenticator application and provide the generated OTP code.
                    </p>

                    {qrCode && (
                        <div className="mt-4 flex justify-center" dangerouslySetInnerHTML={{ __html: qrCode }} />
                    )}

                    {setupSecret && (
                        <div className="mt-4 text-sm text-gray-600">
                            <strong>Setup Key:</strong> {setupSecret}
                        </div>
                    )}

                    <div className="mt-4">
                        <InputLabel htmlFor="code" value="Code" />
                        <TextInput
                            id="code"
                            type="text"
                            name="code"
                            value={data.code}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('code', e.target.value)}
                            autoComplete="one-time-code"
                        />
                        <InputError message={errors.code} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setConfirmingTwoFactor(false)}>
                            Cancel
                        </SecondaryButton>

                        <PrimaryButton className="ms-3" onClick={confirmTwoFactor} disabled={processing}>
                            Confirm
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </section>
    );
}
