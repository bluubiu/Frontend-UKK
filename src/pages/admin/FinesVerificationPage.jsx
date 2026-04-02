import { useState, useEffect, useCallback } from 'react';
import axios from '../../api/axios';
import { CheckCircle2, XCircle, Clock, Printer, Image as ImageIcon, X, Wallet } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { getImageUrl } from '../../utils/imageUrl';

const FinesVerificationPage = () => {
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending_verification');
    const [processingId, setProcessingId] = useState(null);
    const [lightboxUrl, setLightboxUrl] = useState(null);
    const { showToast, confirm } = useNotification();

    const closeLightbox = useCallback(() => setLightboxUrl(null), []);

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') closeLightbox(); };
        if (lightboxUrl) window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [lightboxUrl, closeLightbox]);

    const fetchFines = async () => {
        setLoading(true);
        try {
            const params = filter === 'pending_verification' ? { status: 'pending_verification' } : {};
            const response = await axios.get('/fines', { params });
            setFines(response.data);
        } catch (error) {
            showToast('Gagal mengambil data denda', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFines(); }, [filter]);

    const handleVerify = async (fineId, action) => {
        const isConfirmed = await confirm({
            title: action === 'accept' ? 'Terima Pembayaran' : 'Tolak Pembayaran',
            message: `Apakah Anda yakin ingin ${action === 'accept' ? 'menerima' : 'menolak'} pembayaran ini?`,
            confirmText: action === 'accept' ? 'Ya, Terima' : 'Ya, Tolak',
            cancelText: 'Batal',
            type: action === 'accept' ? 'info' : 'danger'
        });
        if (!isConfirmed) return;

        setProcessingId(fineId);
        try {
            await axios.put(`/fines/${fineId}/verify-payment`, { action });
            showToast(`Pembayaran berhasil ${action === 'accept' ? 'diverifikasi' : 'ditolak'}`);
            fetchFines();
        } catch (error) {
            showToast(error.response?.data?.message || 'Gagal memproses verifikasi', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const StatusBadge = ({ fine }) => {
        if (fine.is_paid) return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">Lunas</span>;
        if (fine.payment_confirmed_by_user) return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 animate-pulse">Butuh Verifikasi</span>;
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-100 text-red-600">Belum Dibayar</span>;
    };

    return (
        <>
            <div className="space-y-6 max-w-4xl mx-auto pb-12">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Verifikasi Denda</h1>
                        <p className="text-sm text-gray-400 mt-0.5">Verifikasi pembayaran denda yang diajukan peminjam.</p>
                    </div>
                    <button
                        onClick={() => {
                            const iframe = document.createElement('iframe');
                            iframe.style.display = 'none';
                            iframe.src = `/admin/fines-verification/print?status=${filter}`;
                            document.body.appendChild(iframe);
                            setTimeout(() => document.body.removeChild(iframe), 60000);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <Printer className="w-4 h-4" />
                        <span className="hidden sm:inline">Cetak</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-gray-200">
                    {[
                        { key: 'pending_verification', label: 'Menunggu Verifikasi' },
                        { key: 'all', label: 'Semua Data' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all ${filter === tab.key
                                ? 'border-emerald-500 text-emerald-600'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="py-16 flex justify-center">
                        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-emerald-500" />
                    </div>
                ) : fines.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-300 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <p className="font-semibold text-gray-700 text-sm">Tidak ada data</p>
                        <p className="text-gray-400 text-xs mt-1">Tidak ada permintaan verifikasi saat ini.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {fines.map((fine) => {
                            const userName = fine.return_model?.loan?.user?.full_name ?? '—';
                            const loanId = fine.return_model?.loan_id ?? '—';
                            const amount = `Rp ${parseFloat(fine.total_fine).toLocaleString('id-ID')}`;
                            const proofUrl = fine.proof_of_payment
                                ? getImageUrl(fine.proof_of_payment)
                                : null;

                            return (
                                <div key={fine.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    {/* Card Top */}
                                    <div className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            {/* User Info */}
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-sm flex-shrink-0">
                                                    {userName.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-900 text-sm truncate">{userName}</p>
                                                    <p className="text-xs text-gray-400">Loan #{loanId}</p>
                                                </div>
                                            </div>
                                            <StatusBadge fine={fine} />
                                        </div>

                                        {/* Data Grid */}
                                        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm border-t border-gray-50 pt-4">
                                            <div>
                                                <p className="text-xs text-gray-400 mb-0.5">Total Denda</p>
                                                <p className="font-bold text-gray-900">{amount}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 mb-0.5">Tanggal Klaim</p>
                                                <p className="text-gray-700 text-xs font-medium flex items-center gap-1">
                                                    <Clock className="w-3 h-3 flex-shrink-0" />
                                                    {formatDate(fine.user_payment_date)}
                                                </p>
                                            </div>
                                            {fine.user_notes && (
                                                <div className="col-span-2">
                                                    <p className="text-xs text-gray-400 mb-0.5">Catatan Peminjam</p>
                                                    <p className="text-gray-600 text-xs">{fine.user_notes}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Proof of Payment / Cash indicator */}
                                        {proofUrl ? (
                                            <div className="mt-4 pt-4 border-t border-gray-50">
                                                <p className="text-xs text-gray-400 mb-2">Bukti Pembayaran</p>
                                                <button
                                                    onClick={() => setLightboxUrl(proofUrl)}
                                                    className="flex items-center gap-3 p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors w-full text-left"
                                                >
                                                    <img
                                                        src={proofUrl}
                                                        alt="Bukti Pembayaran"
                                                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-medium text-gray-700">Lihat Bukti Transfer</p>
                                                        <p className="text-[10px] text-gray-400">Klik untuk perbesar</p>
                                                    </div>
                                                    <ImageIcon className="w-4 h-4 text-gray-300 ml-auto flex-shrink-0" />
                                                </button>
                                            </div>
                                        ) : !!fine.payment_confirmed_by_user && (
                                            <div className="mt-4 pt-4 border-t border-gray-50">
                                                <p className="text-xs text-gray-400 mb-2">Metode Pembayaran</p>
                                                <div className="flex items-center gap-2.5 p-2.5 bg-blue-50 border border-blue-100 rounded-xl">
                                                    <Wallet className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-xs font-semibold text-blue-800">Bayar Tunai di UKS</p>
                                                        <p className="text-[10px] text-blue-500">Peminjam akan datang langsung ke ruang UKS</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons — full-width footer */}
                                    {!!fine.payment_confirmed_by_user && !fine.is_paid && (
                                        <div className="flex border-t border-gray-100">
                                            <button
                                                onClick={() => handleVerify(fine.id, 'accept')}
                                                disabled={processingId === fine.id}
                                                className="flex-1 py-3 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                                            >
                                                <CheckCircle2 className="w-4 h-4" /> Terima & Verifikasi
                                            </button>
                                            <div className="w-px bg-gray-100" />
                                            <button
                                                onClick={() => handleVerify(fine.id, 'reject')}
                                                disabled={processingId === fine.id}
                                                className="flex-1 py-3 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                                            >
                                                <XCircle className="w-4 h-4" /> Tolak
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {
                lightboxUrl && (
                    <div
                        className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={closeLightbox}
                    >
                        <button
                            onClick={closeLightbox}
                            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <img
                            src={lightboxUrl}
                            alt="Bukti Pembayaran"
                            className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )
            }
        </>
    );
};

export default FinesVerificationPage;
