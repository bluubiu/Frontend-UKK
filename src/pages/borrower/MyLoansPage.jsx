import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import {
    Clock,
    CheckCircle2,
    XCircle,
    FileText,
    Calendar,
    Package,
    ArrowRight,
    AlertCircle,
    Download,
    History
} from 'lucide-react';

import ReturnDetailModal from '../../components/ReturnDetailModal';
import ReceiptModal from '../../components/ReceiptModal';
import { useNotification } from '../../context/NotificationContext';

const MyLoansPage = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const { showToast, confirm } = useNotification();

    useEffect(() => {
        fetchLoans();
    }, [statusFilter]);

    const fetchLoans = async () => {
        setLoading(true);
        try {
            const params = statusFilter !== 'all' ? { status: statusFilter } : {};
            const response = await axios.get('/loans', { params });
            // The API returns data wrapped in a "data" property if paginated, 
            // but we've refactored controllers to return get() directly in some cases.
            // Handling both potential response structures.
            const loansData = response.data.data || response.data;
            setLoans(Array.isArray(loansData) ? loansData : []);
        } catch (error) {
            console.error("Kesalahan saat mengambil data pinjaman saya:", error);
            showToast('Gagal mengambil data peminjaman', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status, isReturning) => {
        if (isReturning) return 'bg-indigo-50 text-indigo-600 border-indigo-100';

        switch (status) {
            case 'pending':
                return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'approved':
                return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'rejected':
                return 'bg-red-50 text-red-600 border-red-100';
            case 'returned':
                return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            default:
                return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    const getStatusIcon = (status, isReturning) => {
        if (isReturning) return <History className="w-4 h-4" />;

        switch (status) {
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'approved': return <CheckCircle2 className="w-4 h-4" />;
            case 'rejected': return <XCircle className="w-4 h-4" />;
            case 'returned': return <Package className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const [selectedReceiptLoan, setSelectedReceiptLoan] = useState(null);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

    const handleDownloadReceipt = (loan) => {
        setSelectedReceiptLoan(loan);
        setIsReceiptModalOpen(true);
    };

    const [processingLoanId, setProcessingLoanId] = useState(null);

    const handleSubmitReturn = async (loanId) => {
        const isConfirmed = await confirm({
            title: 'Ajukan Pengembalian',
            message: 'Apakah Anda yakin ingin mengajukan pengembalian alat ini? Petugas akan segera memeriksa kondisi alat.',
            confirmText: 'Ya, Ajukan',
            cancelText: 'Batal',
            type: 'info'
        });

        if (!isConfirmed) return;

        setProcessingLoanId(loanId);
        try {
            await axios.post('/returns', {
                loan_id: loanId,
                notes: 'Pengembalian alat'
            });
            showToast('Pengembalian berhasil disubmit! Menunggu pemeriksaan petugas');
            fetchLoans();
        } catch (error) {
            console.error('Kesalahan saat mengirimkan pengembalian:', error);
            showToast(error.response?.data?.message || 'Gagal submit pengembalian', 'error');
        } finally {
            setProcessingLoanId(null);
        }
    };

    const [selectedLoan, setSelectedLoan] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const handleViewDetail = (loan) => {
        setSelectedLoan(loan);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Peminjaman Saya</h1>
                    <p className="text-gray-500 mt-2 font-medium">Pantau permintaan dan riwayat peminjaman peralatan Anda.</p>
                </div>

                <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm self-start">
                    {['all', 'pending', 'approved', 'returned'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${statusFilter === status
                                ? 'bg-gray-900 text-white shadow-lg'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {status === 'all' ? 'Semua' : status === 'pending' ? 'Menunggu' : status === 'approved' ? 'Disetujui' : 'Dikembalikan'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 h-32 animate-pulse"></div>
                    ))}
                </div>
            ) : loans.length === 0 ? (
                <div className="bg-white rounded-[40px] p-20 text-center border border-dashed border-gray-200">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Tidak ada peminjaman ditemukan</h3>
                    <p className="text-gray-400 text-sm">Anda belum membuat permintaan peminjaman apapun.</p>
                    <button onClick={() => window.location.href = '/items'} className="mt-6 text-emerald-600 font-bold text-sm hover:underline flex items-center justify-center gap-2 mx-auto">
                        Lihat Katalog <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div className="grid gap-6">
                    {loans.map((loan) => {
                        const hasFine = loan.return_model?.fine;
                        const isUnpaid = hasFine && !hasFine.is_paid;
                        const isReturning = loan.status === 'approved' && loan.return_model;
                        const isReturned = loan.status === 'returned';

                        return (
                            <div
                                key={loan.id}
                                className={`group rounded-[32px] p-6 border transition-all duration-300 ${isReturned
                                        ? 'bg-gray-50/50 border-gray-100 opacity-90'
                                        : 'bg-white border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100'
                                    }`}
                            >
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-gray-400">#{loan.id}</span>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(loan.status, isReturning)} flex items-center gap-1.5`}>
                                                    {getStatusIcon(loan.status, isReturning)}
                                                    {isReturning ? 'PROSES KEMBALI' :
                                                        loan.status === 'pending' ? 'MENUNGGU' :
                                                            loan.status === 'approved' ? 'DISETUJUI' :
                                                                loan.status === 'rejected' ? 'DITOLAK' :
                                                                    loan.status === 'returned' ? 'KEMBALI' : loan.status}
                                                </span>
                                                {isUnpaid && (
                                                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600 border border-red-200 animate-pulse">
                                                        DENDA BELUM DIBAYAR
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs font-bold text-gray-400 flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5" />
                                                Diajukan pada {formatDate(loan.created_at)}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {loan.details?.map((detail, idx) => (
                                                <div key={idx} className="bg-gray-50 px-4 py-2 rounded-xl flex items-center gap-3 border border-gray-100/50">
                                                    <Package className="w-4 h-4 text-emerald-500" />
                                                    <span className="text-sm font-bold text-gray-800">{detail.item?.name}</span>
                                                    <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-md">x{detail.quantity}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100/30">
                                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Tanggal Pinjam</p>
                                                <p className="text-sm font-bold text-gray-700">{formatDate(loan.loan_date)}</p>
                                            </div>
                                            <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100/30">
                                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Tenggat Kembali</p>
                                                <p className="text-sm font-bold text-gray-700">{formatDate(loan.return_date)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:w-64 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6">
                                        {loan.status === 'pending' && (
                                            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100/50">
                                                <p className="text-xs text-amber-800 font-medium leading-relaxed flex gap-2">
                                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                                    Permintaan Anda sedang menunggu tinjauan petugas.
                                                </p>
                                            </div>
                                        )}

                                        {(loan.status === 'approved' && !loan.return_model) && (
                                            <div className="space-y-3">
                                                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100/50">
                                                    <p className="text-xs text-emerald-800 font-medium leading-relaxed flex gap-2">
                                                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                                                        Disetujui! Silakan ambil barang di kantor UKS.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleDownloadReceipt(loan)}
                                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all shadow-lg shadow-gray-200"
                                                >
                                                    <Download className="w-4 h-4" /> Unduh Bukti
                                                </button>
                                                <button
                                                    onClick={() => handleSubmitReturn(loan.id)}
                                                    disabled={processingLoanId === loan.id}
                                                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${processingLoanId === loan.id
                                                        ? 'bg-purple-400 text-white cursor-wait'
                                                        : 'bg-purple-500 text-white hover:bg-purple-600 shadow-purple-200'
                                                        }`}
                                                >
                                                    {processingLoanId === loan.id ? (
                                                        <>Memproses...</>
                                                    ) : (
                                                        <><Package className="w-4 h-4" /> Ajukan Pengembalian</>
                                                    )}
                                                </button>
                                            </div>
                                        )}

                                        {isReturning && (
                                            <div className="space-y-3">
                                                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100/50">
                                                    <p className="text-xs text-indigo-800 font-medium leading-relaxed flex gap-2">
                                                        <Clock className="w-4 h-4 shrink-0" />
                                                        Pengembalian diajukan. Menunggu verifikasi petugas.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleDownloadReceipt(loan)}
                                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all border border-gray-200"
                                                >
                                                    <Download className="w-4 h-4" /> Unduh Bukti
                                                </button>
                                            </div>
                                        )}

                                        {isReturned && (
                                            <div className="space-y-3">
                                                <div className={`p-4 rounded-2xl border ${isUnpaid ? 'bg-red-50 border-red-100' : 'bg-indigo-50 border-indigo-100'}`}>
                                                    <p className={`text-xs font-medium leading-relaxed ${isUnpaid ? 'text-red-700' : 'text-indigo-700'}`}>
                                                        {isUnpaid ? (
                                                            <span className='font-bold flex items-center gap-1'><AlertCircle className="w-3 h-3" /> Ada Denda: Rp {(parseFloat(hasFine.total_fine)).toLocaleString('id-ID')}</span>
                                                        ) : (
                                                            "Barang telah dikembalikan dan diverifikasi."
                                                        )}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => handleViewDetail(loan)}
                                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all shadow-sm"
                                                >
                                                    Lihat Detail
                                                </button>

                                                {isUnpaid && !hasFine.payment_confirmed_by_user && (
                                                    <a href="/fines" className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200">
                                                        Bayar Denda
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        {loan.status === 'rejected' && (
                                            <div className="bg-red-50 p-4 rounded-2xl border border-red-100/50">
                                                <p className="text-xs text-red-800 font-medium leading-relaxed">
                                                    Permintaan ini ditolak. Silakan hubungi petugas untuk detail.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <ReturnDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                loan={selectedLoan}
            />

            <ReceiptModal
                isOpen={isReceiptModalOpen}
                onClose={() => setIsReceiptModalOpen(false)}
                loan={selectedReceiptLoan}
            />
        </div>
    );
};

export default MyLoansPage;
