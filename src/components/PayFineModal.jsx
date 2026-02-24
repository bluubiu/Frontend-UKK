import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import axios from '../api/axios';
import { X, CheckCircle2, Upload, Image as ImageIcon, CreditCard, ArrowLeft, Wallet } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const PayFineModal = ({ isOpen, onClose, fine, onSuccess }) => {
    const [notes, setNotes] = useState('');
    const [proofOfPayment, setProofOfPayment] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // step: 'select' | 'transfer' | 'cash' | 'success'
    const [step, setStep] = useState('select');
    const modalRef = React.useRef(null);
    const fileInputRef = React.useRef(null);
    const { showToast } = useNotification();

    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    React.useEffect(() => {
        if (isOpen) {
            setStep('select');
            setNotes('');
            setProofOfPayment(null);
            setPreviewUrl(null);
            setIsSubmitting(false);
        }
    }, [isOpen]);

    if (!isOpen || !fine) return null;

    const formattedAmount = `Rp ${parseFloat(fine.total_fine).toLocaleString('id-ID')}`;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { showToast('Ukuran file maksimal 2MB', 'error'); return; }
        setProofOfPayment(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleTransferSubmit = async () => {
        if (!proofOfPayment) { showToast('Silakan unggah bukti pembayaran', 'error'); return; }
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('notes', notes);
            formData.append('proof_of_payment', proofOfPayment);
            formData.append('_method', 'PUT');
            await axios.post(`/fines/${fine.id}/confirm-payment`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setStep('success');
        } catch (error) {
            showToast(error.response?.data?.message || 'Gagal mengirim konfirmasi pembayaran.', 'error');
            setIsSubmitting(false);
        }
    };

    const handleCashSubmit = async () => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('notes', 'Pembayaran tunai langsung ke UKS');
            formData.append('_method', 'PUT');
            await axios.post(`/fines/${fine.id}/confirm-payment`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setStep('success');
        } catch (error) {
            showToast(error.response?.data?.message || 'Gagal mengirim konfirmasi pembayaran.', 'error');
            setIsSubmitting(false);
        }
    };

    const loanId = fine?.returnModel?.loan?.id ?? fine?.return_model?.loan_id ?? '-';

    // Shared wrapper
    const Shell = ({ children, onBack }) => (
        <div className="fixed inset-0 w-full h-screen bg-black/50 flex items-center justify-center z-[60] p-4 font-sans">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl max-w-md w-full flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                    {onBack && (
                        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                    )}
                    <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm">Bayar Denda</p>
                        <p className="text-xs text-gray-400">Fine #{fine.id}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );

    // Amount row
    const AmountRow = () => (
        <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-100">
            <span className="text-sm text-gray-500">Total Tagihan</span>
            <span className="font-bold text-gray-900">{formattedAmount}</span>
        </div>
    );

    // ── Success ──────────────────────────────────────────────────────
    if (step === 'success') return createPortal(
        <div className="fixed inset-0 w-full h-screen bg-black/50 flex items-center justify-center z-[60] p-4 font-sans">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8 text-center">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-7 h-7" />
                </div>
                <h2 className="text-base font-bold text-gray-900 mb-1">Konfirmasi Terkirim!</h2>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                    Bukti transfer sedang diverifikasi oleh petugas. Status akan berubah setelah dikonfirmasi.
                </p>
                <button onClick={onSuccess} className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
                    Selesai
                </button>
            </div>
        </div>,
        document.getElementById('modal-root')
    );

    // ── Method Selection ─────────────────────────────────────────────
    if (step === 'select') return createPortal(
        <Shell>
            <AmountRow />
            <div className="p-5 space-y-3">
                <p className="text-xs text-gray-400 font-medium mb-1">Pilih metode pembayaran</p>

                <button
                    onClick={() => setStep('transfer')}
                    className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all text-left group"
                >
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800">Transfer Bank</p>
                        <p className="text-xs text-gray-400">Transfer ke rekening UKS lalu upload buktinya</p>
                    </div>
                </button>

                <button
                    onClick={() => setStep('cash')}
                    className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
                >
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Wallet className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800">Bayar Langsung ke UKS</p>
                        <p className="text-xs text-gray-400">Datang ke ruang UKS dan bayar secara tunai</p>
                    </div>
                </button>
            </div>
        </Shell>,
        document.getElementById('modal-root')
    );

    // ── Bayar Langsung ───────────────────────────────────────────────
    if (step === 'cash') return createPortal(
        <Shell onBack={() => setStep('select')}>
            <AmountRow />
            <div className="p-5 space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 leading-relaxed">
                    Tunjukkan <strong>kode peminjaman</strong> di bawah kepada petugas UKS, lalu serahkan pembayaran tunai.
                </div>

                <div className="border border-gray-200 rounded-xl p-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Kode Peminjaman</span>
                        <span className="font-bold text-gray-900">#{loanId}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Lokasi</span>
                        <span className="font-medium text-gray-700">Ruang UKS Lantai 1</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Jam Operasional</span>
                        <span className="font-medium text-gray-700">Sen–Sab, 07.00–16.00</span>
                    </div>
                </div>

                <button
                    onClick={handleCashSubmit}
                    disabled={isSubmitting}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {isSubmitting
                        ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Mengirim...</>
                        : 'Konfirmasi Akan Bayar di UKS'
                    }
                </button>
            </div>
        </Shell>,
        document.getElementById('modal-root')
    );

    // ── Transfer Bank ────────────────────────────────────────────────
    return createPortal(
        <Shell onBack={() => setStep('select')}>
            <AmountRow />
            <div className="overflow-y-auto scrollbar-hide">
                <div className="p-5 space-y-4">
                    {/* Bank Info */}
                    <div className="border border-gray-200 rounded-xl p-4 space-y-2 text-sm">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Rekening Tujuan</p>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Bank</span>
                            <span className="font-semibold text-gray-800">Bank Mandiri</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">No. Rekening</span>
                            <span className="font-bold text-gray-900 tracking-wider">123-00-456789-0</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Atas Nama</span>
                            <span className="font-semibold text-gray-800">UKS MediUKS</span>
                        </div>
                    </div>

                    {/* Upload */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-2">Bukti Transfer</label>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                            ) : (
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    <ImageIcon className="w-4 h-4 text-gray-400" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                {proofOfPayment ? (
                                    <p className="text-xs font-medium text-gray-700 truncate">{proofOfPayment.name}</p>
                                ) : (
                                    <p className="text-xs text-gray-400">Belum ada file dipilih</p>
                                )}
                                <p className="text-[10px] text-gray-300 mt-0.5">JPG, PNG · Maks 2MB</p>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                                >
                                    {proofOfPayment ? 'Ganti' : 'Pilih File'}
                                </button>
                                {proofOfPayment && (
                                    <button
                                        onClick={() => { setProofOfPayment(null); setPreviewUrl(null); }}
                                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-2">Catatan <span className="font-normal">(opsional)</span></label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Contoh: Sudah transfer via m-Banking..."
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm resize-none transition-all"
                            rows={2}
                        />
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleTransferSubmit}
                        disabled={isSubmitting}
                        className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-900 hover:bg-black'
                            }`}
                    >
                        {isSubmitting
                            ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Mengirim...</>
                            : 'Konfirmasi Sudah Transfer'
                        }
                    </button>
                </div>
            </div>
        </Shell>,
        document.getElementById('modal-root')
    );
};

export default PayFineModal;
