import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    CheckCircle2,
    XCircle,
    AlertCircle,
    Star,
    ShieldCheck,
    Hammer,
    Sparkles,
    Box,
    ChevronLeft,
    ChevronRight,
    Search
} from 'lucide-react';

const ReturnInspectionModal = ({ isOpen, onClose, returnData, onSubmit }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        completeness: 0,
        functionality: 0,
        cleanliness: 0,
        physical_damage: 0,
        notes: {
            completeness: '',
            functionality: '',
            cleanliness: '',
            physical_damage: ''
        }
    });

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1);
            setFormData({
                completeness: 0,
                functionality: 0,
                cleanliness: 0,
                physical_damage: 0,
                notes: { completeness: '', functionality: '', cleanliness: '', physical_damage: '' }
            });
        }
    }, [isOpen]);

    const calculateLateDays = () => {
        if (!returnData?.loan?.return_date || !returnData?.returned_at) return 0;
        const dueDate = new Date(returnData.loan.return_date);
        const returnDate = new Date(returnData.returned_at);
        const diffTime = returnDate - dueDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };

    const lateDays = calculateLateDays();
    const isOnTime = lateDays === 0;

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const getProgressPercentage = () => ((currentStep - 1) / 4) * 100;

    const canProceed = () => {
        switch (currentStep) {
            case 1: return formData.completeness > 0;
            case 2: return formData.functionality > 0;
            case 3: return formData.cleanliness > 0;
            case 4: return formData.physical_damage > 0;
            default: return true;
        }
    };

    const handleNext = () => canProceed() && currentStep < 5 && setCurrentStep(currentStep + 1);
    const handlePrevious = () => currentStep > 1 && setCurrentStep(currentStep - 1);
    const handleSubmit = () => {
        onSubmit({
            completeness: formData.completeness,
            functionality: formData.functionality,
            cleanliness: formData.cleanliness,
            physical_damage: formData.physical_damage
        });
    };

    const totalScore = formData.completeness + formData.functionality + formData.cleanliness + formData.physical_damage;
    const scorePercentage = (totalScore / 20) * 100;

    if (!isOpen) return null;

    // Reusable Rating Option Component
    const RatingOption = ({ value, label, description, current, onChange, color = "emerald" }) => (
        <label
            className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${current === value
                ? `border-${color}-500 bg-${color}-50 ring-1 ring-${color}-500`
                : 'border-gray-100 bg-white hover:border-emerald-200 hover:shadow-md'
                }`}
        >
            <input
                type="radio"
                name="rating"
                value={value}
                checked={current === value}
                onChange={() => onChange(value)}
                className="sr-only"
            />
            <div className={`p-2 rounded-full mr-4 transition-colors ${current === value ? `bg-${color}-500 text-white` : 'bg-gray-100 text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-600'
                }`}>
                {current === value ? (
                    <CheckCircle2 className="w-5 h-5" />
                ) : (
                    <span className="w-5 h-5 flex items-center justify-center font-bold text-xs">{value}</span>
                )}
            </div>
            <div>
                <p className={`font-bold text-sm ${current === value ? 'text-gray-900' : 'text-gray-700'}`}>{label}</p>
                {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
            </div>
            {current === value && (
                <div className={`absolute top-0 right-0 px-2 py-1 bg-${color}-500 text-white text-[10px] uppercase font-bold rounded-bl-lg rounded-tr-lg`}>
                    Selected
                </div>
            )}
        </label>
    );

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6 animate-fade-in-up">
                        {/* Item Info Card */}
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5 shadow-sm">
                            <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                                <Box className="w-5 h-5" />
                                Barang yang Diperiksa
                            </h4>
                            <div className="space-y-2 bg-white/60 rounded-xl p-1">
                                {returnData?.loan?.details?.map((detail, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 rounded-lg border border-emerald-100/50">
                                        <span className="font-semibold text-gray-800">{detail.item?.name}</span>
                                        <span className="text-xs font-bold bg-white px-2 py-1 rounded-md border border-emerald-100 text-emerald-700">x{detail.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="mb-4">
                                <label className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Box className="w-5 h-5 text-emerald-600" /> Check Kelengkapan
                                </label>
                                <p className="text-sm text-gray-500">Apakah semua bagian alat lengkap?</p>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <RatingOption value={5} label="Lengkap Sempurna" description="Semua bagian ada, tidak ada yang kurang." current={formData.completeness} onChange={(v) => setFormData({ ...formData, completeness: v })} />
                                <RatingOption value={4} label="Hampir Lengkap" description="Ada aksesoris kecil yang hilang." color="lime" current={formData.completeness} onChange={(v) => setFormData({ ...formData, completeness: v })} />
                                <RatingOption value={3} label="Kurang Lengkap" description="Bagian utama ada, aksesoris hilang." color="yellow" current={formData.completeness} onChange={(v) => setFormData({ ...formData, completeness: v })} />
                                <RatingOption value={2} label="Ada yang Hilang" description="Salah satu bagian utama tidak ada." color="orange" current={formData.completeness} onChange={(v) => setFormData({ ...formData, completeness: v })} />
                                <RatingOption value={1} label="Banyak Hilang" description="Hanya tersisa sebagian kecil." color="red" current={formData.completeness} onChange={(v) => setFormData({ ...formData, completeness: v })} />
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 animate-fade-in-up">
                        <div>
                            <div className="mb-4">
                                <label className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Hammer className="w-5 h-5 text-emerald-600" /> Check Fungsi
                                </label>
                                <p className="text-sm text-gray-500">Apakah alat berfungsi dengan normal?</p>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <RatingOption value={5} label="Berfungsi Normal" description="Semua fitur berjalan lancar." current={formData.functionality} onChange={(v) => setFormData({ ...formData, functionality: v })} />
                                <RatingOption value={4} label="Fungsi Minor Terganggu" description="Masih bisa dipakai, ada kendala kecil." color="lime" current={formData.functionality} onChange={(v) => setFormData({ ...formData, functionality: v })} />
                                <RatingOption value={3} label="Ada Masalah" description="Perlu perbaikan, tapi masih menyala." color="yellow" current={formData.functionality} onChange={(v) => setFormData({ ...formData, functionality: v })} />
                                <RatingOption value={2} label="Malfunction" description="Banyak error, sulit digunakan." color="orange" current={formData.functionality} onChange={(v) => setFormData({ ...formData, functionality: v })} />
                                <RatingOption value={1} label="Rusak Total" description="Mati total / tidak bisa dipakai." color="red" current={formData.functionality} onChange={(v) => setFormData({ ...formData, functionality: v })} />
                            </div>
                        </div>
                        <textarea
                            value={formData.notes.functionality}
                            onChange={(e) => setFormData({ ...formData, notes: { ...formData.notes, functionality: e.target.value } })}
                            rows={3}
                            placeholder="Catatan tambahan tentang fungsi..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm transition-all"
                        />
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 animate-fade-in-up">
                        <div>
                            <div className="mb-4">
                                <label className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-emerald-600" /> Check Kebersihan
                                </label>
                                <p className="text-sm text-gray-500">Bagaimana kondisi kebersihan alat saat dikembalikan?</p>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <RatingOption value={5} label="Sangat Bersih (Steril)" description="Sudah dibersihkan dengan baik/steril." current={formData.cleanliness} onChange={(v) => setFormData({ ...formData, cleanliness: v })} />
                                <RatingOption value={4} label="Bersih" description="Tampak bersih, siap simpan." color="lime" current={formData.cleanliness} onChange={(v) => setFormData({ ...formData, cleanliness: v })} />
                                <RatingOption value={3} label="Cukup Bersih" description="Ada sedikit debu/noda ringan." color="yellow" current={formData.cleanliness} onChange={(v) => setFormData({ ...formData, cleanliness: v })} />
                                <RatingOption value={2} label="Kotor" description="Banyak noda/debu, perlu dibersihkan." color="orange" current={formData.cleanliness} onChange={(v) => setFormData({ ...formData, cleanliness: v })} />
                                <RatingOption value={1} label="Sangat Kotor" description="Berminyak, berlumpur, atau bau." color="red" current={formData.cleanliness} onChange={(v) => setFormData({ ...formData, cleanliness: v })} />
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6 animate-fade-in-up">
                        <div>
                            <div className="mb-4">
                                <label className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-emerald-600" /> Check Fisik
                                </label>
                                <p className="text-sm text-gray-500">Apakah ada kerusakan fisik pada alat?</p>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <RatingOption value={5} label="Mulus Sempurna" description="Tidak ada lecet atau cacat fisik." current={formData.physical_damage} onChange={(v) => setFormData({ ...formData, physical_damage: v })} />
                                <RatingOption value={4} label="Lecet Halus" description="Goresan pemakaian wajar." color="lime" current={formData.physical_damage} onChange={(v) => setFormData({ ...formData, physical_damage: v })} />
                                <RatingOption value={3} label="Goresan Terlihat" description="Ada goresan atau penyok kecil." color="yellow" current={formData.physical_damage} onChange={(v) => setFormData({ ...formData, physical_damage: v })} />
                                <RatingOption value={2} label="Rusak Sedang" description="Retak casing, bagian longgar, dll." color="orange" current={formData.physical_damage} onChange={(v) => setFormData({ ...formData, physical_damage: v })} />
                                <RatingOption value={1} label="Hancur / Patah" description="Kerusakan fisik berat." color="red" current={formData.physical_damage} onChange={(v) => setFormData({ ...formData, physical_damage: v })} />
                            </div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <ShieldCheck className="w-32 h-32 text-emerald-600" />
                            </div>
                            <h4 className="font-bold text-emerald-800 mb-6 text-xl relative z-10 flex items-center gap-2">
                                <Search className="w-6 h-6" /> Hasil Pemeriksaan
                            </h4>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-emerald-100/50 relative z-10 space-y-3">
                                {[
                                    { label: 'Kelengkapan', score: formData.completeness },
                                    { label: 'Fungsi', score: formData.functionality },
                                    { label: 'Kebersihan', score: formData.cleanliness },
                                    { label: 'Fisik', score: formData.physical_damage }
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                                        <span className="text-gray-600 font-medium">{item.label}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="flex text-amber-400">
                                                {[...Array(5)].map((_, n) => (
                                                    <Star key={n} className={`w-3 h-3 ${n < item.score ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                                                ))}
                                            </div>
                                            <span className="font-bold text-gray-800 w-6 text-right">{item.score}/5</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 flex justify-between items-end relative z-10">
                                <div>
                                    <p className="text-sm text-emerald-600 font-medium">Total Skor</p>
                                    <p className="text-3xl font-bold text-emerald-800">{scorePercentage.toFixed(0)}%</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-emerald-600 font-medium mb-1">Status</p>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${scorePercentage >= 80 ? 'bg-emerald-200 text-emerald-800' :
                                        scorePercentage >= 60 ? 'bg-yellow-200 text-yellow-800' :
                                            'bg-red-200 text-red-800'
                                        }`}>
                                        {scorePercentage >= 80 ? 'SANGAT BAIK' : scorePercentage >= 60 ? 'CUKUP' : 'BURUK'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <AlertCircle className="w-5 h-5 text-gray-400 shrink-0" />
                            <p>
                                Dengan menekan tombol Submit, sistem akan otomatis menghitung denda keterlambatan dan kerusakan, serta mengupdate stok barang.
                            </p>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return createPortal(
        <div className="fixed inset-0 w-full h-screen bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 font-sans">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-white px-8 pt-6 pb-2 border-b border-gray-50">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold tracking-wider uppercase mb-2">Inspection</span>
                            <h2 className="text-2xl font-bold text-gray-900">Check Pengembalian</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>

                    {/* User & Loan Summary */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                {returnData?.loan?.user?.full_name?.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-700">{returnData?.loan?.user?.full_name}</span>
                        </div>
                        <div className="w-px h-4 bg-gray-200"></div>
                        <span>#{returnData?.loan?.id}</span>
                        <div className="w-px h-4 bg-gray-200"></div>
                        <span className={`${!isOnTime ? 'text-red-500 font-bold' : 'text-emerald-500 font-bold'} flex items-center gap-1`}>
                            {isOnTime ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {isOnTime ? 'Tepat Waktu' : `Telat ${lateDays} Hari`}
                        </span>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex justify-between items-center mb-2 px-1">
                        {['Kelengkapan', 'Fungsi', 'Kebersihan', 'Fisik', 'Review'].map((step, idx) => {
                            const stepNum = idx + 1;
                            const isActive = stepNum <= currentStep;
                            const isCurrent = stepNum === currentStep;

                            return (
                                <div key={idx} className="flex flex-col items-center gap-1 w-12">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${isActive
                                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200'
                                        : 'bg-white border-gray-200 text-gray-300'
                                        }`}>
                                        {isActive ? (isCurrent ? stepNum : <CheckCircle2 className="w-4 h-4" />) : stepNum}
                                    </div>
                                    <span className={`text-[9px] font-bold uppercase tracking-wider ${isCurrent ? 'text-emerald-600' : 'text-gray-300'}`}>
                                        {step.substring(0, 4)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    {/* Progress Line */}
                    <div className="w-full h-1 bg-gray-100 rounded-full mb-2 overflow-hidden relative top-[-26px] -z-10 mx-4" style={{ width: 'calc(100% - 32px)' }}>
                        <div
                            className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                            style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
                    {renderStepContent()}
                </div>

                {/* Footer */}
                <div className="bg-white p-6 border-t border-gray-100 flex justify-between gap-4">
                    <button
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${currentStep === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                    >
                        <ChevronLeft className="w-4 h-4" /> Kembali
                    </button>

                    {currentStep < 5 ? (
                        <button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className={`flex-1 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${canProceed()
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200 hover:shadow-emerald-300 transform active:scale-95'
                                : 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
                                }`}
                        >
                            Lanjut <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="flex-1 px-6 py-3 rounded-xl font-bold text-sm bg-gray-900 text-white hover:bg-black transition-all shadow-lg shadow-gray-300 transform active:scale-95 flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 className="w-4 h-4" /> Submit Hasil
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.getElementById('modal-root')
    );
};

export default ReturnInspectionModal;
