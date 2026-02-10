import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import ReturnInspectionModal from '../../components/ReturnInspectionModal';
import InspectionResultModal from '../../components/InspectionResultModal';
import { FileText, CheckCircle, Clock, Search } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const ReturnsPage = () => {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { showToast } = useNotification();

    // Modal states
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [showInspectionModal, setShowInspectionModal] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [inspectionResult, setInspectionResult] = useState(null);

    useEffect(() => {
        fetchReturns();
    }, []);

    const fetchReturns = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/returns');
            setReturns(response.data.data || response.data);
        } catch (error) {
            console.error("Error fetching returns:", error);
            showToast('Gagal mengambil data pengembalian', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStartInspection = (returnItem) => {
        setSelectedReturn(returnItem);
        setShowInspectionModal(true);
    };

    const handleSubmitInspection = async (checklistData) => {
        try {
            const response = await axios.put(`/returns/${selectedReturn.id}/check`, checklistData);
            setInspectionResult(response.data);
            setShowInspectionModal(false);
            setShowResultModal(true);
            showToast('Pemeriksaan berhasil disubmit');
            fetchReturns();
        } catch (error) {
            console.error("Error submitting inspection:", error);
            showToast(error.response?.data?.message || 'Gagal submit pemeriksaan', 'error');
        }
    };

    const handleCloseResult = () => {
        setShowResultModal(false);
        setInspectionResult(null);
        setSelectedReturn(null);
    };

    const calculateLateDays = (returnDate, dueDate) => {
        if (!returnDate || !dueDate) return 0;
        const due = new Date(dueDate);
        const ret = new Date(returnDate);
        const diffTime = ret - due;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };

    const getLateBadge = (lateDays) => {
        if (lateDays === 0) {
            return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', label: 'Tepat Waktu' };
        } else if (lateDays <= 3) {
            return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', label: `Telat ${lateDays} hari` };
        } else {
            return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', label: `Telat ${lateDays} hari` };
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

    const pendingReturns = returns.filter(r => !r.checked_by);
    const completedReturns = returns.filter(r => r.checked_by);

    const filteredPendingReturns = pendingReturns.filter(ret => {
        const searchLower = search.toLowerCase();
        return (
            ret.id?.toString().includes(searchLower) ||
            ret.loan?.user?.full_name?.toLowerCase().includes(searchLower) ||
            ret.loan_id?.toString().includes(searchLower)
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Manajemen Pengembalian</h1>
                    <p className="text-gray-500 mt-2 font-medium">Pemeriksaan pengembalian alat kesehatan UKS</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 rounded-xl">
                            <FileText className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-amber-700 uppercase">Menunggu Cek</p>
                            <p className="text-2xl font-bold text-gray-800">{pendingReturns.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 rounded-xl">
                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-emerald-700 uppercase">Diproses</p>
                            <p className="text-2xl font-bold text-gray-800">{completedReturns.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-blue-700 uppercase">Total Pengembalian</p>
                            <p className="text-2xl font-bold text-gray-800">{returns.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari berdasarkan ID Pengembalian, ID Peminjaman, atau Nama Peminjam..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all outline-none text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Kembali</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Peminjam</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Barang</th>
                                <th className="px-20 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th className="px-20 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Memuat pengembalian...</td>
                                </tr>
                            ) : filteredPendingReturns.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        {search ? 'Tidak ada pengembalian yang cocok dengan pencarian Anda.' : 'Tidak ada pengembalian yang menunggu pemeriksaan.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredPendingReturns.map((ret) => {
                                    const lateDays = calculateLateDays(ret.returned_at, ret.loan?.return_date);
                                    const lateBadge = getLateBadge(lateDays);

                                    return (
                                        <tr key={ret.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-normal text-xs text-gray-800">Kembali #{ret.id}</div>
                                                <div className="text-xs text-gray-400">Pinjaman #{ret.loan_id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                                                        <img
                                                            src={ret.loan?.user?.profile_photo_path
                                                                ? (ret.loan.user.profile_photo_path.startsWith('http')
                                                                    ? ret.loan.user.profile_photo_path
                                                                    : `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/api$/, '')}/storage/${ret.loan.user.profile_photo_path}`)
                                                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(ret.loan?.user?.full_name || 'User')}&background=random`}
                                                            alt={ret.loan?.user?.full_name}
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(ret.loan?.user?.full_name || 'User')}&background=random`;
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-800 text-xs">{ret.loan?.user?.full_name}</div>
                                                        <div className="text-xs text-gray-400">{ret.loan?.user?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-700">
                                                    {ret.loan?.details?.reduce((acc, detail) => acc + (detail.quantity || 0), 0) || 0} unit
                                                </div>
                                                {ret.loan?.details && ret.loan.details.length > 0 && (
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        {ret.loan.details[0]?.item?.name}{ret.loan.details.length > 1 ? `, +${ret.loan.details.length - 1} lainnya` : ''}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-700">
                                                    <span className="text-gray-400 text-xs">Jatuh Tempo:</span> {formatDate(ret.loan?.return_date)}
                                                </div>
                                                <div className="text-sm text-gray-700">
                                                    <span className="text-gray-400 text-xs">Dikembalikan:</span> {formatDate(ret.returned_at)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-normal border ${lateBadge.bg} ${lateBadge.text} ${lateBadge.border}`}>
                                                    {lateBadge.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleStartInspection(ret)}
                                                    className="px-4 py-2 text-xs font-semibold text-white bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors shadow-lg shadow-purple-500/30"
                                                >
                                                    Mulai Pemeriksaan
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ReturnInspectionModal
                isOpen={showInspectionModal}
                onClose={() => {
                    setShowInspectionModal(false);
                    setSelectedReturn(null);
                }}
                returnData={selectedReturn}
                onSubmit={handleSubmitInspection}
            />

            <InspectionResultModal
                isOpen={showResultModal}
                onClose={handleCloseResult}
                result={inspectionResult}
            />
        </div>
    );
};

export default ReturnsPage;
