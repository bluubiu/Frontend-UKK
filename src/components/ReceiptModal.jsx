import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XCircle, Printer } from 'lucide-react';

const ReceiptModal = ({ isOpen, onClose, loan }) => {
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

    const handlePrint = () => {
        window.print();
    };

    if (!isOpen || !loan) return null;

    const formatDate = (dateString, includeTime = false) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric', month: 'long', day: 'numeric',
            ...(includeTime && { hour: '2-digit', minute: '2-digit' })
        });
    };

    return createPortal(
        <div className="fixed inset-0 w-full h-screen bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 font-sans animate-fade-in print:p-0 print:bg-white print:fixed print:inset-0">
            <div ref={modalRef} className="bg-white rounded-[32px] shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col print:shadow-none print:max-w-none print:h-full print:rounded-none">

                {/* Header (Screen) */}
                <div className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center print:hidden">
                    <h2 className="text-xl font-bold text-gray-900">Bukti Peminjaman</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="bg-white p-8 print:p-0">
                    <div className="text-center border-b-2 border-dashed border-gray-200 pb-6 mb-6 print:border-black">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">MediUKS Receipt</h1>
                        <p className="text-gray-500 text-sm mt-1 print:text-black">Official Loan Document</p>
                        <div className="w-full h-px bg-gray-100 my-4 print:hidden"></div>
                        <p className="text-sm font-medium text-emerald-600 border border-emerald-100 bg-emerald-50 rounded-lg inline-block px-3 py-1 print:border-black print:text-black print:bg-transparent">
                            #{loan.id} - APPROVED
                        </p>
                    </div>

                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500 print:text-black">Tanggal Request</span>
                            <span className="font-bold text-gray-900">{formatDate(loan.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 print:text-black">Disetujui Tanggal</span>
                            <span className="font-bold text-gray-900">{formatDate(loan.approved_at)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 print:text-black">Peminjam</span>
                            <span className="font-bold text-gray-900">{loan.user?.full_name}</span>
                        </div>
                    </div>

                    <div className="my-6 border-t border-gray-100 pt-6 print:border-black">
                        <h3 className="font-bold text-gray-900 mb-3 uppercase text-xs tracking-wider">Item Details</h3>
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-50 print:text-black print:bg-transparent print:border-b print:border-black">
                                <tr>
                                    <th className="py-2 pl-2">Item</th>
                                    <th className="py-2 text-right pr-2">Qty</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                                {loan.details?.map((detail, idx) => (
                                    <tr key={idx}>
                                        <td className="py-3 pl-2 font-medium text-gray-900">{detail.item?.name}</td>
                                        <td className="py-3 pr-2 text-right text-gray-600 font-bold">x{detail.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 text-center text-xs text-gray-500 print:bg-transparent print:text-black print:border print:border-black">
                        <p>Harap tunjukkan bukti ini saat mengambil barang.</p>
                        <p>Simpan dokumen ini hingga pengembalian selesai.</p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-white p-6 border-t border-gray-100 flex gap-3 print:hidden">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-all"
                    >
                        Tutup
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex-1 py-3 bg-gray-900 text-white font-bold hover:bg-black rounded-xl shadow-lg shadow-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                        <Printer className="w-4 h-4" /> Cetak
                    </button>
                </div>
            </div>
        </div>,
        document.getElementById('modal-root')
    );
};

export default ReceiptModal;
