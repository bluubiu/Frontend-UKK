import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import axios from '../api/axios';
import { XCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const PayFineModal = ({ isOpen, onClose, fine, onSuccess }) => {
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const modalRef = React.useRef(null);
    const { showToast } = useNotification();

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen || !fine) return null;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await axios.put(`/fines/${fine.id}/confirm-payment`, { notes });
            setStep(2);
        } catch (error) {
            console.error('Payment confirmation failed:', error);
            showToast('Gagal mengirim konfirmasi pembayaran.', 'error');
            setIsSubmitting(false);
        }
    };

    if (step === 2) {
        return createPortal(
            <div className="fixed inset-0 w-full h-screen bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 font-sans animate-fade-in">
                <div className="bg-white rounded-[32px] shadow-2xl max-w-sm w-full p-8 text-center border-4 border-emerald-50">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Konfirmasi Terkirim!</h2>
                    <p className="text-gray-500 text-sm mb-6">
                        Pembayaran Anda sedang diverifikasi oleh petugas. Status akan berubah setelah dikonfirmasi.
                    </p>
                    <button
                        onClick={onSuccess}
                        className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                    >
                        Tutup
                    </button>
                </div>
            </div>,
            document.getElementById('modal-root')
        );
    }

    return createPortal(
        <div className="fixed inset-0 w-full h-screen bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 font-sans animate-fade-in">
            <div ref={modalRef} className="bg-white rounded-[32px] shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Konfirmasi Pembayaran</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Fine #{fine.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto scrollbar-hide">
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 text-center border border-red-100 mb-8">
                        <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Total Tagihan</span>
                        <div className="text-4xl font-black text-gray-900 mt-2 tracking-tight">
                            Rp {parseFloat(fine.total_fine).toLocaleString('id-ID')}
                        </div>
                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-red-100 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            <span className="text-xs font-bold text-red-600">Belum Lunas</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                                <AlertCircle className="w-4 h-4 text-amber-500" /> Instruksi Pembayaran
                            </h4>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm text-gray-600 space-y-2">
                                <p>1. Silakan datang ke ruang administrasi UKS.</p>
                                <p>2. Lakukan pembayaran tunai kepada petugas.</p>
                                <p>3. Setelah membayar, isi catatan di bawah (opsional) dan klik tombol konfirmasi.</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Catatan Tambahan</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Contoh: Sudah bayar ke Ibu Siti jam 10 pagi..."
                                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm resize-none shadow-sm"
                                rows={3}
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 ${isSubmitting ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-gray-900 hover:bg-black shadow-gray-200'
                                    }`}
                            >
                                {isSubmitting ? 'Mengirim...' : 'Konfirmasi Sudah Bayar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.getElementById('modal-root')
    );
};


export default PayFineModal;
