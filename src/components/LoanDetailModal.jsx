import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, AlertCircle, Package, Calendar, Clock, User, FileText, Printer, Building2, UserCircle, Activity } from 'lucide-react';

const LoanDetailModal = ({ isOpen, onClose, loan, onApprove, onReject, onPrint }) => {
    const modalRef = useRef(null);

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

    if (!isOpen || !loan) return null;

    const formatDate = (dateString, includeTime = false) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            ...(includeTime && { hour: '2-digit', minute: '2-digit' })
        });
    };

    // The getScoreBadge and scoreBadge logic is no longer used in the new UI structure.
    // const getScoreBadge = (score) => {
    //     if (score >= 80) return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Sangat Baik' };
    //     if (score >= 60) return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Cukup' };
    //     if (score >= 50) return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Kurang' };
    //     return { bg: 'bg-red-100', text: 'text-red-700', label: 'Buruk' };
    // };
    // const scoreBadge = getScoreBadge(loan.user?.score || 0);

    // handlePrint is replaced by onPrint prop
    // const handlePrint = () => {
    //     window.print();
    // };

    return createPortal(
        <div className="fixed inset-0 w-full h-screen z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-fade-in">
            <div ref={modalRef} className="bg-white rounded-[32px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col my-8">
                {/* Header */}
                <div className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10 flex-shrink-0">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold text-gray-900">Detail Peminjaman</h2>
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold tracking-wider">#{loan.id}</span>
                        </div>
                        <p className="text-sm text-gray-500">
                            Status: <span className={`font-bold ${loan.status === 'BORROWED' ? 'text-blue-600' :
                                loan.status === 'RETURNED' ? 'text-emerald-600' :
                                    loan.status === 'PENDING' ? 'text-amber-600' :
                                        'text-red-500'
                                }`}>{loan.status}</span> • {formatDate(loan.created_at)}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/30 scrollbar-hide">
                    {/* User Info Section */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <UserCircle className="w-4 h-4 text-gray-400" /> Informasi Peminjam
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Nama Peminjam</p>
                                    <p className="font-bold text-gray-900">{loan.user?.full_name}</p>
                                    <p className="text-xs text-gray-500">{loan.user?.username}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Role / Jabatan</p>
                                    <p className="font-bold text-gray-900 uppercase">{loan.user?.role?.name}</p>
                                    <p className="text-xs text-gray-500">ID Member: {loan.user?.id}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loan Details Section */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Package className="w-4 h-4 text-emerald-500" /> Daftar Barang
                        </h3>
                        <div className="space-y-4">
                            {loan.details?.map((detail, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-400 border border-gray-100 group-hover:border-emerald-200 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                            <Package className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{detail.item?.name}</p>
                                            <p className="text-xs text-gray-500">Jumlah: {detail.quantity} unit</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="px-3 py-1 bg-white rounded-lg border border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                            Original Condition
                                        </div>
                                        <p className="text-sm font-bold text-gray-700 mt-1 uppercase">{detail.item?.condition || 'Baik'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-500" /> Timeline
                            </h3>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50"></div>
                                        <div className="w-0.5 h-12 bg-gray-100"></div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">Tgl Peminjaman</p>
                                        <p className="text-sm font-bold text-gray-900">{formatDate(loan.loan_date)}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full bg-red-500 ring-4 ring-red-50"></div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">Batas Pengembalian</p>
                                        <p className="text-sm font-bold text-gray-900">{formatDate(loan.return_date)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {loan.status === 'REJECTED' && (
                            <div className="bg-red-50 p-6 rounded-3xl border border-red-100 space-y-3">
                                <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> Alasan Penolakan
                                </h3>
                                <p className="text-red-700 font-bold">{loan.reason || 'Tidak ada alasan spesifik.'}</p>
                                {loan.notes && (
                                    <div className="bg-white/60 p-3 rounded-xl text-sm italic text-red-600">
                                        "{loan.notes}"
                                    </div>
                                )}
                            </div>
                        )}

                        {loan.status === 'RETURNED' && loan.return_model && (
                            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 space-y-3">
                                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> Dikembalikan Pada
                                </h3>
                                <p className="text-emerald-700 font-bold">{formatDate(loan.return_model.returned_at)}</p>
                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-white/60 px-3 py-1 rounded-full w-fit">
                                    Kondisi Akhir: <span className="uppercase">{loan.return_model.final_condition}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-8 border-t border-gray-100 flex gap-4 flex-shrink-0">
                    {onPrint && (
                        <button
                            onClick={() => onPrint(loan)}
                            className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Printer className="w-5 h-5" /> Cetak Bukti
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className={`${onPrint ? 'w-32' : 'flex-1'} py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95`}
                    >
                        Tutup
                    </button>
                </div>

            </div>
        </div>,
        document.getElementById('modal-root')
    );
};

export default LoanDetailModal;
