import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, XCircle, AlertCircle, Search, Clock, User, ArrowRight } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const FinesVerificationPage = () => {
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending_verification'); // pending_verification, all
    const [processingId, setProcessingId] = useState(null);
    const { showToast, confirm } = useNotification();

    const fetchFines = async () => {
        setLoading(true);
        try {
            const params = filter === 'pending_verification' ? { status: 'pending_verification' } : {};
            const response = await axios.get('/fines', { params });
            setFines(response.data);
        } catch (error) {
            console.error('Failed to fetch fines:', error);
            showToast('Gagal mengambil data denda', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFines();
    }, [filter]);

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
            console.error('Verification failed:', error);
            showToast(error.response?.data?.message || 'Gagal memproses verifikasi', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Verifikasi Denda</h1>
                <p className="text-gray-500 mt-2 font-medium">Verifikasi pembayaran denda yang diajukan peminjam.</p>
            </div>

            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setFilter('pending_verification')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${filter === 'pending_verification'
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                >
                    Menunggu Verifikasi
                </button>
                <button
                    onClick={() => setFilter('all')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${filter === 'all'
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                >
                    Semua Data
                </button>
            </div>

            {loading ? (
                <div className="py-12 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
            ) : fines.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Tidak ada data</h3>
                    <p className="text-gray-500">Tidak ada permintaan verifikasi saat ini.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {fines.map((fine) => (
                        <div key={fine.id} className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                                                {fine.return_model?.loan?.user?.full_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{fine.return_model?.loan?.user?.full_name}</h3>
                                                <p className="text-xs text-gray-500">Loan #{fine.return_model?.loan_id}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${fine.is_paid
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : fine.payment_confirmed_by_user
                                                ? 'bg-blue-100 text-blue-700 animate-pulse'
                                                : 'bg-red-100 text-red-700'
                                            }`}>
                                            {fine.is_paid ? 'LUNAS' : fine.payment_confirmed_by_user ? 'BUTUH VERIFIKASI' : 'BELUM DIBAYAR'}
                                        </span>
                                    </div>

                                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Total Denda</p>
                                            <p className="text-xl font-bold text-gray-900">Rp {parseFloat(fine.total_fine).toLocaleString('id-ID')}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Tanggal Klaim Bayar</p>
                                            <p className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {formatDate(fine.user_payment_date)}
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Catatan Peminjam</p>
                                            <p className="text-sm text-gray-600 italic">"{fine.user_notes || '-'}"</p>
                                        </div>
                                    </div>
                                </div>

                                {fine.payment_confirmed_by_user && !fine.is_paid && (
                                    <div className="flex flex-col justify-center gap-3 min-w-[200px] border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                        <button
                                            onClick={() => handleVerify(fine.id, 'accept')}
                                            disabled={processingId === fine.id}
                                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle2 className="w-5 h-5" /> Terima & Verifikasi
                                        </button>
                                        <button
                                            onClick={() => handleVerify(fine.id, 'reject')}
                                            disabled={processingId === fine.id}
                                            className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-sm shadow-lg shadow-red-20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <XCircle className="w-5 h-5" /> Tolak
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FinesVerificationPage;
