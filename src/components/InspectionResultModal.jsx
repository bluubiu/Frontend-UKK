import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, AlertCircle, Package, TrendingUp, DollarSign } from 'lucide-react';

const InspectionResultModal = ({ isOpen, onClose, result }) => {
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

    if (!isOpen || !result) return null;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

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
                return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: <Package className="w-5 h-5" />, label: condition || 'UNKNOWN' };
        }
    };

    const conditionBadge = getConditionBadge(result.return?.final_condition);

    return createPortal(
        <div className="fixed inset-0 w-full h-screen z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-fade-in">
            <div ref={modalRef} className="bg-white rounded-[32px] shadow-2xl max-w-lg w-full overflow-hidden relative">

                {/* Decorative Background */}
                <div className="absolute top-0 w-full h-32 bg-gradient-to-br from-emerald-500 to-teal-600 z-0"></div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                >
                    <XCircle className="w-6 h-6" />
                </button>

                {/* Content Container */}
                <div className="relative z-10 px-8 pt-8 pb-6 flex flex-col items-center text-center">

                    {/* Success Icon */}
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl mb-4 text-emerald-500 ring-4 ring-emerald-500/30">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Pemeriksaan Selesai!</h2>
                    <p className="text-gray-500 text-sm mb-6">Hasil pemeriksaan telah tersimpan di sistem.</p>

                    {/* Result Card */}
                    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50 overflow-hidden mb-6">
                        {/* Condition Status */}
                        <div className={`p-6 border-b border-gray-50 bg-gradient-to-b ${conditionBadge.bg.replace('100', '50')} to-white`}>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Kondisi Akhir</p>
                            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl border-2 ${conditionBadge.bg} ${conditionBadge.border} ${conditionBadge.text}`}>
                                <span className="text-2xl">{conditionBadge.icon}</span>
                                <span className="text-xl font-bold tracking-tight">{conditionBadge.label}</span>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 divide-x divide-gray-50 border-b border-gray-50">
                            <div className="p-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                                    <DollarSign className="w-3 h-3" /> Total Denda
                                </p>
                                <p className={`text-lg font-bold ${result.return?.fine?.total_fine > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {formatCurrency(result.return?.fine?.total_fine || 0)}
                                </p>
                            </div>
                            <div className="p-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> Skor Peminjam
                                </p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-gray-400 line-through text-sm">{result.user_new_score - result.score_change}</span>
                                    <span className={`text-lg font-bold ${result.score_change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {result.user_new_score}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Stock Info */}
                        {result.return?.loan?.details && (
                            <div className="p-4 bg-gray-50/50">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 text-left flex items-center gap-2">
                                    <Package className="w-3 h-3" /> Stok Dikembalikan
                                </p>
                                <div className="space-y-2">
                                    {result.return.loan.details.map((detail, index) => (
                                        <div key={index} className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                                            <span className="text-sm font-medium text-gray-700">{detail.item?.name}</span>
                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">+{detail.quantity} unit</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-gray-200 transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span>Selesai & Tutup</span>
                        <CheckCircle2 className="w-4 h-4" />
                    </button>

                </div>
            </div>
        </div>,
        document.getElementById('modal-root')
    );
};

export default InspectionResultModal;
