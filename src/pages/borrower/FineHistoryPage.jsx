import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import PayFineModal from '../../components/PayFineModal';
import ReturnDetailModal from '../../components/ReturnDetailModal';
import { DollarSign, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const FineHistoryPage = () => {
    const { user } = useAuth();
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFine, setSelectedFine] = useState(null);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const { showToast } = useNotification();

    const fetchFines = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/fines');
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
    }, []);

    const handlePayClick = (fine) => {
        setSelectedFine(fine);
        setIsPayModalOpen(true);
    };

    const handlePaymentSuccess = () => {
        fetchFines(); // Refresh list
        setIsPayModalOpen(false);
        setSelectedFine(null);
        showToast('Konfirmasi pembayaran berhasil dikirim!');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (fine) => {
        if (fine.is_paid) {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> LUNAS
                </span>
            );
        } else if (fine.payment_confirmed_by_user) {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">
                    <Clock className="w-3 h-3" /> MENUNGGU VERIFIKASI
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200 animate-pulse">
                    <AlertCircle className="w-3 h-3" /> BELUM DIBAYAR
                </span>
            );
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    Riwayat Denda
                </h1>
                <p className="text-gray-500 mt-1 ml-14">Kelola dan pantau status pembayaran denda Anda.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
            ) : fines.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <DollarSign className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Tidak Ada Denda</h3>
                    <p className="text-gray-500">Hebat! Anda tidak memiliki riwayat denda apapun.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {fines.map((fine) => (
                        <div key={fine.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center justify-between md:justify-start gap-4">
                                        <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                            {formatDate(fine.created_at)}
                                        </div>
                                        {getStatusBadge(fine)}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded">#{fine.return_model?.loan_id}</span>
                                            <h3 className="text-lg font-bold text-gray-900">Peminjaman Alat UKS</h3>
                                        </div>
                                        <p className="text-gray-500 text-sm">
                                            {fine.return_model?.loan?.details?.map(d => d.item?.name).join(', ')}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <div>
                                            <span className="block text-xs text-gray-400 font-bold uppercase">Keterlambatan</span>
                                            <span className="font-semibold text-gray-700">{fine.late_days > 0 ? `${fine.late_days} Hari` : '-'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-400 font-bold uppercase">Denda Telat</span>
                                            <span className="font-semibold text-gray-700">Rp {(fine.late_days * 5000).toLocaleString('id-ID')}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-400 font-bold uppercase">Denda Kondisi</span>
                                            <span className="font-semibold text-gray-700">Rp {parseFloat(fine.condition_fine).toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-between items-end min-w-[140px] border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                    <div className="text-right w-full flex justify-between md:block">
                                        <span className="block text-xs text-gray-400 font-bold uppercase mb-1">Total Tagihan</span>
                                        <span className={`block text-2xl font-bold ${fine.is_paid ? 'text-emerald-600' : 'text-red-600'}`}>
                                            Rp {parseFloat(fine.total_fine).toLocaleString('id-ID')}
                                        </span>
                                    </div>

                                    {!fine.is_paid && !fine.payment_confirmed_by_user && (
                                        <button
                                            onClick={() => handlePayClick(fine)}
                                            className="w-full mt-4 md:mt-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-200 transition-all active:scale-95"
                                        >
                                            Bayar Sekarang
                                        </button>
                                    )}

                                    <button
                                        onClick={() => {
                                            if (fine.return_model?.loan) {
                                                const loanData = {
                                                    ...fine.return_model.loan,
                                                    return_model: fine.return_model
                                                };
                                                setSelectedLoan(loanData);
                                                setIsDetailModalOpen(true);
                                            }
                                        }}
                                        className="w-full mt-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-bold transition-all"
                                    >
                                        Lihat Detail
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <PayFineModal
                isOpen={isPayModalOpen}
                onClose={() => setIsPayModalOpen(false)}
                fine={selectedFine}
                onSuccess={handlePaymentSuccess}
            />

            <ReturnDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                loan={selectedLoan}
            />
        </div>
    );
};

export default FineHistoryPage;
