import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, AlertCircle, Package, Calendar, Clock, DollarSign, TrendingUp, Search } from 'lucide-react';

const ReturnDetailModal = ({ isOpen, onClose, loan }) => {
    const modalRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !loan || !loan.return_model) return null;

    const returnModel = loan.return_model;
    const checklist = returnModel.checklist;
    const fine = returnModel.fine;

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

    const getConditionBadge = (condition) => {
        switch (condition?.toLowerCase()) {
            case 'baik':
                return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: <CheckCircle2 className="w-5 h-5" />, label: 'BAIK' };
            case 'perlu disterilkan':
                return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: <Package className="w-5 h-5" />, label: 'PERLU STERIL' };
            case 'rusak ringan':
                return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: <AlertCircle className="w-5 h-5" />, label: 'RUSAK RINGAN' };
            case 'rusak berat':
                return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: <XCircle className="w-5 h-5" />, label: 'RUSAK BERAT' };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: <Package className="w-5 h-5" />, label: condition || 'UNKOWN' };
        }
    };

    const conditionBadge = getConditionBadge(returnModel.final_condition);

    const checklistItems = [
        { label: 'Kelengkapan Alat', score: parseInt(checklist?.completeness || 0) },
        { label: 'Fungsi Alat', score: parseInt(checklist?.functionality || 0) },
        { label: 'Kebersihan', score: parseInt(checklist?.cleanliness || 0) },
        { label: 'Kondisi Fisik', score: parseInt(checklist?.physical_damage || 0) },
    ];

    const totalScore = checklistItems.reduce((acc, item) => acc + item.score, 0);
    const maxScore = 20;

    return createPortal(
        <div className="fixed inset-0 w-full h-screen bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 font-sans animate-fade-in">
            <div ref={modalRef} className="bg-white rounded-[32px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col my-8">
                {/* Header */}
                <div className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold text-gray-900">Detail Pengembalian</h2>
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold tracking-wider">#{loan.id}</span>
                        </div>
                        <p className="text-sm text-gray-500">Status: <span className="text-emerald-600 font-bold">RETURNED</span> • {formatDate(returnModel.returned_at)}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/30 scrollbar-hide">

                    {/* Tools Result */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Search className="w-4 h-4 text-emerald-500" /> Hasil Pemeriksaan Alat
                        </h3>
                        <div className="space-y-4">
                            {loan.details?.map((detail, index) => (
                                <div key={index} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-700">{index + 1}.</span>
                                        <div>
                                            <p className="font-bold text-gray-900">{detail.item?.name}</p>
                                            <p className="text-xs text-gray-500">{detail.quantity} unit</p>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${conditionBadge.bg} ${conditionBadge.border} ${conditionBadge.text}`}>
                                        {conditionBadge.icon}
                                        <span className="text-xs font-bold">{conditionBadge.label}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Scores Checklist */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Skor Checklist
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {checklistItems.map((item, i) => (
                                <div key={i} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0 md:border-0">
                                    <span className="text-gray-600 text-sm">{item.label}</span>
                                    <div className="flex items-center gap-1">
                                        <div className="flex text-amber-400 text-xs">
                                            {[...Array(5)].map((_, n) => (
                                                <span key={n} className={n < item.score ? "" : "text-gray-200"}>★</span>
                                            ))}
                                        </div>
                                        <span className="font-bold text-gray-900 text-sm ml-2">({item.score}/5)</span>
                                    </div>
                                </div>
                            ))}
                            {/* Late Status */}
                            <div className="flex justify-between items-center md:col-span-2 pt-2 border-t border-gray-100 md:border-t-0 md:pt-0">
                                <span className="text-gray-600 text-sm">Ketepatan Waktu</span>
                                {checklist?.on_time ? (
                                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                        <CheckCircle2 className="w-4 h-4" /> TEPAT WAKTU
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                                        <XCircle className="w-4 h-4" /> TELAT
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                            <span className="font-bold text-gray-500">Total Skor</span>
                            <span className="font-bold text-xl text-gray-900">{totalScore}/{maxScore}</span>
                        </div>
                    </div>

                    {/* Fines Section */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-red-500" /> Rincian Denda
                        </h3>
                        {returnModel.fine ? (
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Denda Keterlambatan ({returnModel.fine.late_days} hari)</span>
                                    <span className="font-semibold">Rp {(returnModel.fine.late_days * 5000).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Denda Kondisi ({conditionBadge.label})</span>
                                    <span className="font-semibold">Rp {parseFloat(returnModel.fine.condition_fine).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="border-t border-dashed border-gray-200 my-2 pt-2 flex justify-between font-bold text-lg">
                                    <span className="text-gray-900">Total Denda</span>
                                    <span className="text-red-600">Rp {parseFloat(returnModel.fine.total_fine).toLocaleString('id-ID')}</span>
                                </div>

                                <div className={`mt-3 p-3 rounded-lg text-center text-sm font-bold ${returnModel.fine.is_paid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                    Status: {returnModel.fine.is_paid ? 'LUNAS' : 'BELUM DIBAYAR'} {returnModel.fine.is_paid ? <CheckCircle2 className="inline w-4 h-4" /> : <XCircle className="inline w-4 h-4" />}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-500">
                                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                                <p>Tidak ada denda. Terima kasih!</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold transition-all"
                    >
                        Tutup
                    </button>
                </div>

            </div>
        </div>,
        document.getElementById('modal-root')
    );
};

export default ReturnDetailModal;
