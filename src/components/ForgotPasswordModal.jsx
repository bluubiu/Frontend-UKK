import { useState } from 'react';
import { createPortal } from 'react-dom';
import axios from '../api/axios';
import { X, KeyRound, Send, CheckCircle, AlertCircle, ClipboardList, Lightbulb } from 'lucide-react';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleReset = () => {
        setUsername('');
        setError('');
        setSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.post('/forgot-password-notification', { username });
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Username tidak ditemukan atau terjadi kesalahan.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 w-full h-screen z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <KeyRound className="w-5 h-5 text-blue-600" />
                        Lupa Password
                    </h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    {!success ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold mb-1">Butuh bantuan untuk reset password?</p>
                                        <p className="text-xs text-blue-700">
                                            Masukkan username Anda di bawah ini. Kami akan mengirimkan notifikasi ke Administrator
                                            untuk mereset password Anda.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Username Anda
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="Masukkan username Anda"
                                    autoFocus
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Pastikan username yang Anda masukkan sudah benar dan terdaftar.
                                </p>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !username}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Mengirim...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Kirim Permintaan
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h4 className="text-emerald-800 font-bold text-lg mb-2">Permintaan Terkirim!</h4>
                                <p className="text-sm text-emerald-700">
                                    Notifikasi telah dikirim ke Administrator.
                                </p>
                            </div>

                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-sm text-amber-800">
                                <div className="flex items-start gap-2 mb-2">
                                    <ClipboardList className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <p className="font-semibold">Langkah Selanjutnya:</p>
                                </div>
                                <ol className="space-y-2 text-xs text-amber-700 ml-7 list-decimal">
                                    <li>Administrator akan menerima notifikasi permintaan reset password Anda</li>
                                    <li>Admin akan mereset password Anda ke format default</li>
                                    <li>Hubungi Administrator untuk mendapatkan password baru Anda</li>
                                    <li>
                                        Login dengan password baru <span className="font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">"{username}123#"</span> setelah beberapa saat
                                    </li>
                                </ol>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
                                <div className="flex items-start gap-2">
                                    <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold mb-1">Tips Keamanan:</p>
                                        <p>Setelah login dengan password baru, segera ubah password Anda melalui menu Profile untuk keamanan akun Anda.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="w-full px-4 py-2.5 rounded-xl bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors"
                                >
                                    Mengerti
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.getElementById('modal-root')
    );
};

export default ForgotPasswordModal;
