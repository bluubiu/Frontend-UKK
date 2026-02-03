import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { XCircle, AlertCircle, MessageSquare, Send } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const RejectLoanModal = ({ isOpen, onClose, loan, onSubmit }) => {
    const [selectedReason, setSelectedReason] = useState('');
    const [notes, setNotes] = useState('');
    const { showToast } = useNotification();

    if (!isOpen) return null;

    const reasons = [
        "Stok tidak mencukupi",
        "Barang sedang dalam perbaikan/maintenance",
        "Skor kepatuhan peminjam terlalu rendah",
        "Durasi peminjaman terlalu lama",
        "Lainnya"
    ];

    const handleSubmit = () => {
        if (!selectedReason) {
            showToast('Mohon pilih alasan penolakan', 'warning');
            return;
        }
        onSubmit({ loanId: loan.id, reason: selectedReason, notes });
    };

    return createPortal(
        <div className="fixed inset-0 w-full h-screen bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 font-sans animate-fade-in">
            <div className="bg-white rounded-[32px] shadow-2xl max-w-md w-full my-8 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-red-50 px-8 py-6 border-b border-red-100 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-red-100">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Tolak Peminjaman</h2>
                            <p className="text-sm text-red-600 font-medium">#{loan.id} • {loan.user?.full_name}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500" /> Alasan Penolakan
                        </label>
                        <div className="grid grid-cols-1 gap-3">
                            {reasons.map((reason) => (
                                <button
                                    key={reason}
                                    onClick={() => setSelectedReason(reason)}
                                    className={`px-6 py-4 rounded-2xl text-left border-2 transition-all group relative overflow-hidden ${selectedReason === reason
                                        ? 'border-red-500 bg-red-50/50 shadow-lg shadow-red-100'
                                        : 'border-gray-100 hover:border-red-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`font-bold ${selectedReason === reason ? 'text-red-700' : 'text-gray-600'}`}>
                                            {reason}
                                        </span>
                                        {selectedReason === reason && (
                                            <div className="bg-red-500 text-white rounded-full p-1">
                                                <Send className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-gray-400" /> Catatan Tambahan <span className="text-gray-400 text-[10px] font-normal lowercase">(Opsional)</span>
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Berikan alasan mendalam kenapa alat ini ditolak..."
                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-red-300 focus:ring-4 focus:ring-red-100 outline-none transition-all text-sm min-h-[120px] resize-none"
                        />
                    </div>
                </div>

                <div className="p-8 bg-gray-50/50 flex gap-4 border-t border-gray-100 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all active:scale-95"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl font-bold shadow-xl shadow-red-200 hover:bg-red-700 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        Tolak Sekarang
                    </button>
                </div>

            </div>
        </div>,
        document.getElementById('modal-root')
    );
};

export default RejectLoanModal;
