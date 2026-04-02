import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LoanDetailModal from '../../components/LoanDetailModal';
import RejectLoanModal from '../../components/RejectLoanModal';
import { Search, CheckCircle, Printer } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const LoansPage = () => {
    const { user } = useAuth();
    const isPetugas = user?.role?.name === 'petugas';
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const { showToast, confirm } = useNotification();

    useEffect(() => {
        fetchLoans();
    }, [statusFilter]);

    const fetchLoans = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }
            const response = await axios.get('/loans', { params });
            setLoans(response.data.data ? response.data.data : response.data);
        } catch (error) {
            console.error("Error fetching loans:", error);
            showToast('Gagal mengambil data peminjaman', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (loan) => {
        setSelectedLoan(loan);
        setShowDetailModal(true);
    };

    const handleApprove = async (loan) => {
        const isConfirmed = await confirm({
            title: 'Setujui Peminjaman',
            message: `Apakah Anda yakin ingin menyetujui peminjaman untuk ${loan.user?.full_name}? Stok barang akan dikurangi otomatis.`,
            confirmText: 'Ya, Setujui',
            cancelText: 'Batal',
            type: 'info'
        });

        if (!isConfirmed) return;

        try {
            await axios.put(`/loans/${loan.id}/approve`);
            showToast('Peminjaman berhasil disetujui');
            fetchLoans();
        } catch (error) {
            console.error("Error approving loan:", error);
            showToast(error.response?.data?.message || 'Gagal menyetujui peminjaman', 'error');
        }
    };

    const handleRejectClick = (loan) => {
        setSelectedLoan(loan);
        setShowDetailModal(false);
        setShowRejectModal(true);
    };

    const handleReject = async ({ loanId, reason, notes }) => {
        try {
            await axios.put(`/loans/${loanId}/reject`, {
                rejection_reason: reason,
                rejection_notes: notes
            });
            showToast('Peminjaman telah ditolak', 'warning');
            setShowRejectModal(false);
            fetchLoans();
        } catch (error) {
            console.error("Error rejecting loan:", error);
            showToast('Gagal menolak peminjaman', 'error');
        }
    };

    const filteredLoans = loans.filter(loan => {
        const searchLower = search.toLowerCase();
        return (
            loan.user?.full_name?.toLowerCase().includes(searchLower) ||
            loan.user?.email?.toLowerCase().includes(searchLower) ||
            loan.id?.toString().includes(searchLower)
        );
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'approved':
                return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'rejected':
                return 'bg-red-50 text-red-600 border-red-200';
            case 'returned':
                return 'bg-blue-50 text-blue-600 border-blue-200';
            default:
                return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const getScoreBadge = (score) => {
        if (score >= 80) return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' };
        if (score >= 60) return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' };
        if (score >= 50) return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' };
        return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' };
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            <div className="space-y-6 print:hidden">
                <div className="flex justify-between items-end flex-col sm:flex-row gap-4 sm:gap-0">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Manajemen Peminjaman</h1>
                        <p className="text-gray-500 mt-2 font-medium">Tinjau dan setujui permintaan peminjaman peralatan.</p>
                    </div>
                    <div className='flex gap-2 w-full sm:w-auto'>
                        <button
                            onClick={handlePrint}
                            className="bg-[#1C1F2B] text-white px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-200 w-full sm:w-auto"
                        >
                            <Printer className="w-5 h-5" />
                            Cetak
                        </button>
                    </div>
                </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari berdasarkan nama peminjam, email, atau ID..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-sm font-medium text-gray-700"
                >
                    <option value="all">Semua Status</option>
                    <option value="pending">Menunggu</option>
                    <option value="approved">Disetujui</option>
                    <option value="rejected">Ditolak</option>
                    <option value="returned">Dikembalikan</option>
                </select>
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Pinjam</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Peminjam</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Barang</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Memuat data peminjaman...</td>
                                </tr>
                            ) : filteredLoans.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Tidak ada data peminjaman ditemukan.</td>
                                </tr>
                            ) : (
                                filteredLoans.map((loan) => {
                                    const scoreBadge = getScoreBadge(loan.user?.score || 0);
                                    return (
                                        <tr key={loan.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => handleViewDetail(loan)}>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-800">#{loan.id}</div>
                                                <div className="text-xs text-gray-400">{formatDate(loan.created_at)}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                                                        <img
                                                            src={loan.user?.profile_photo_path
                                                                ? (loan.user.profile_photo_path.startsWith('http')
                                                                    ? loan.user.profile_photo_path
                                                                    : `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/api$/, '')}/storage/${loan.user.profile_photo_path}`)
                                                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(loan.user?.full_name || 'User')}&background=random`}
                                                            alt={loan.user?.full_name}
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(loan.user?.full_name || 'User')}&background=random`;
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-800 text-sm">{loan.user?.full_name}</div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-xs text-gray-400">{loan.user?.email}</span>
                                                            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${scoreBadge.bg} ${scoreBadge.text} ${scoreBadge.border}`}>
                                                                {loan.user?.score}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-700">
                                                    {loan.details?.reduce((acc, detail) => acc + (detail.quantity || 0), 0) || 0} unit
                                                </div>
                                                {loan.details && loan.details.length > 0 && (
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        {loan.details[0]?.item?.name}{loan.details.length > 1 ? `, +${loan.details.length - 1} lainnya` : ''}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-700">
                                                    <span className="text-gray-400 text-xs">Pinjam:</span> {formatDate(loan.loan_date)}
                                                </div>
                                                <div className="text-sm font-medium text-gray-700">
                                                    <span className="text-gray-400 text-xs">Kembali:</span> {formatDate(loan.return_date)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusBadge(loan.status)} uppercase tracking-wide`}>
                                                    {loan.status === 'pending' ? 'MENUNGGU' :
                                                        loan.status === 'approved' ? 'DISETUJUI' :
                                                            loan.status === 'rejected' ? 'DITOLAK' :
                                                                loan.status === 'returned' ? 'KEMBALI' : loan.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                {loan.status === 'pending' ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        {isPetugas ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(loan)}
                                                                    className="px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                                                                    title="Setujui Peminjaman"
                                                                >
                                                                    Setujui
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRejectClick(loan)}
                                                                    className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                                                                    title="Tolak Peminjaman"
                                                                >
                                                                    Tolak
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-amber-500 font-bold italic">Menunggu Petugas</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-end gap-2">
                                                        {loan.status === 'approved' && (
                                                            <button
                                                                onClick={() => {
                                                                    // Create a hidden iframe to print without opening a new tab
                                                                    const iframe = document.createElement('iframe');
                                                                    iframe.style.display = 'none';
                                                                    iframe.src = `/admin/loans/${loan.id}/print`;
                                                                    document.body.appendChild(iframe);

                                                                    // Clean up iframe after printing (roughly)
                                                                    // Note: precise cleanup after print dialog is tricky, 
                                                                    // but removing after a delay is a simple failsafe.
                                                                    setTimeout(() => {
                                                                        document.body.removeChild(iframe);
                                                                    }, 60000);
                                                                }}
                                                                className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all hover:shadow-md hover:shadow-emerald-50 flex items-center gap-1.5"
                                                                title="Cetak Bukti Peminjaman"
                                                            >
                                                                <Printer size={14} className="text-gray-500" />
                                                                <span>Cetak</span>
                                                            </button>
                                                        )}
                                                        <div className="text-xs text-gray-400 font-medium">
                                                            {loan.status === 'approved' && loan.approved_at && (
                                                                <span>Disetujui {formatDate(loan.approved_at)}</span>
                                                            )}
                                                            {loan.status === 'rejected' && (
                                                                <span>Ditolak</span>
                                                            )}
                                                            {loan.status === 'returned' && (
                                                                <span>Selesai</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                </div>
            </div>

            {/* Print Only Table */}
            <div className="hidden print:block w-full font-serif text-sm">
                <div className="text-center border-b-2 border-black mb-6 pb-4">
                    <h1 className="text-2xl font-bold uppercase">Laporan Peminjaman Peralatan <br /> UKS Sekolah</h1>
                    <h2 className="text-m font-bold">MediUKS</h2>
                    <p className="text-sm mt-2">Jl, Ngadiluwih, Kedungpedaringan, Kec. Kepanjen, <br /> Kabupaten Malang, Jawa Timur 65163</p>
                    <p className="text-xs mt-4 text-center italic font-medium tracking-wider">
                        Dicetak pada: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                <div className="mb-4 text-xs font-semibold">
                    <p>Status Filter: {statusFilter === 'all' ? 'Semua Status' : statusFilter === 'pending' ? 'Menunggu' : statusFilter === 'approved' ? 'Disetujui' : statusFilter === 'rejected' ? 'Ditolak' : statusFilter === 'returned' ? 'Dikembalikan' : statusFilter}</p>
                    {search && <p>Pencarian: "{search}"</p>}
                </div>

                <h3 className="font-bold border-b border-black mb-2 pb-1 mt-2">Daftar Peminjaman</h3>
                <table className="w-full border-collapse border border-black text-xs">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black px-2 py-1 text-center w-12">ID</th>
                            <th className="border border-black px-2 py-1 text-left">Peminjam</th>
                            <th className="border border-black px-2 py-1 text-left">Barang Dipinjam</th>
                            <th className="border border-black px-2 py-1 text-center">Tgl Pinjam</th>
                            <th className="border border-black px-2 py-1 text-center">Tgl Kembali</th>
                            <th className="border border-black px-2 py-1 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLoans.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="border border-black px-2 py-4 text-center italic text-gray-500">Tidak ada data peminjaman ditemukan.</td>
                            </tr>
                        ) : (
                            filteredLoans.map((loan) => (
                                <tr key={loan.id}>
                                    <td className="border border-black px-2 py-1 text-center w-12">#{loan.id}</td>
                                    <td className="border border-black px-2 py-1 font-medium">
                                        {loan.user?.full_name}
                                        <div className="text-[10px] text-gray-500 font-normal">{loan.user?.email}</div>
                                    </td>
                                    <td className="border border-black px-2 py-1">
                                        <ul className="list-disc pl-3 m-0 space-y-0.5">
                                            {loan.details?.map((detail, idx) => (
                                                <li key={idx} className="text-[10px]">{detail.item?.name} (x{detail.quantity})</li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="border border-black px-2 py-1 text-center">{formatDate(loan.loan_date)}</td>
                                    <td className="border border-black px-2 py-1 text-center">{formatDate(loan.return_date)}</td>
                                    <td className="border border-black px-2 py-1 text-center uppercase font-bold text-[10px]">
                                        {loan.status === 'pending' ? 'MENUNGGU' :
                                         loan.status === 'approved' ? 'DISETUJUI' :
                                         loan.status === 'rejected' ? 'DITOLAK' :
                                         loan.status === 'returned' ? 'KEMBALI' : loan.status}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <div className="mt-12 grid grid-cols-2 gap-8 text-center break-inside-avoid">
                    <div></div>
                    <div>
                        <p className="mb-16">Mengetahui,<br />Kepala UKS / Koordinator</p>
                        <p className="font-bold underline">_________________________</p>
                        <p className="text-xs">NIP. .........................</p>
                    </div>
                </div>
            </div>

            <LoanDetailModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                loan={selectedLoan}
                onApprove={handleApprove}
                onReject={handleRejectClick}
            />

            <RejectLoanModal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                loan={selectedLoan}
                onSubmit={handleReject}
            />
        </div>
    );
};

export default LoansPage;
