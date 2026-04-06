import { useState } from 'react';
import { createPortal } from 'react-dom';
import axios from '../api/axios';
import { X, Key, Copy, Check } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const ResetPasswordModal = ({ isOpen, onClose, user }) => {
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [resetComplete, setResetComplete] = useState(false);
    const { showToast } = useNotification();

    const handleReset = () => {
        setNewPassword('');
        setError('');
        setResetComplete(false);
        setCopied(false);
    };

    const handleResetPassword = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`/users/${user.id}/reset-password-default`);
            setNewPassword(response.data.default_password);
            setResetComplete(true);
            showToast('Password berhasil direset ke default');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Gagal mereset password');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(newPassword);
            setCopied(true);
            showToast('Password berhasil disalin');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            showToast('Gagal menyalin password', 'error');
        }
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    if (!isOpen || !user) return null;

    return createPortal(
        <div className="fixed inset-0 w-full h-screen z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange-50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Key className="w-5 h-5 text-amber-500" />
                        Reset Password
                    </h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {!resetComplete ? (
                        <>
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-sm text-amber-800">
                                <p className="font-semibold mb-2">Anda akan mereset password untuk:</p>
                                <p className="text-base font-bold text-gray-800">{user.full_name}</p>
                                <p className="text-xs text-amber-600">@{user.username}</p>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                                <p className="font-semibold mb-1">Format Password Default:</p>
                                <p className="font-mono text-base font-bold text-blue-900">{user.username}123#</p>
                                <p className="text-xs text-blue-600 mt-2">Password akan otomatis direset ke format ini.</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                                    {error}
                                </div>
                            )}

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResetPassword}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-200"
                                >
                                    {loading ? 'Mereset...' : 'Reset Password'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Check className="w-6 h-6 text-emerald-600" />
                                </div>
                                <p className="text-emerald-800 font-semibold mb-1">Password Berhasil Direset!</p>
                                <p className="text-xs text-emerald-600">Berikut adalah password baru untuk user ini:</p>
                            </div>

                            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Password Baru</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newPassword}
                                        readOnly
                                        className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 bg-white font-mono text-lg font-bold text-gray-800 focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleCopy}
                                        className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${copied
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-gray-800 text-white hover:bg-gray-700'
                                            }`}
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-5 h-5" />
                                                Tersalin
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-5 h-5" />
                                                Salin
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-700">
                                <p className="font-semibold mb-1">⚠️ Penting:</p>
                                <p>Pastikan untuk menyalin dan menyampaikan password ini kepada user. Password ini tidak akan ditampilkan lagi.</p>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="w-full px-4 py-2.5 rounded-xl bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors"
                                >
                                    Tutup
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.getElementById('modal-root')
    );
};

export default ResetPasswordModal;
