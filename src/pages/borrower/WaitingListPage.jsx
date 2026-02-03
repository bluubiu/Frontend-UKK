import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import {
    Clock,
    Bell,
    X,
    Package,
    AlertCircle,
    ArrowRight,
    Info,
    ShieldCheck,
    CalendarCheck,
    ArrowUpRight
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const WaitingListPage = () => {
    const [waitingList, setWaitingList] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast, confirm } = useNotification();

    useEffect(() => {
        fetchWaitingList();
    }, []);

    const fetchWaitingList = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/waiting-lists');
            setWaitingList(response.data.data || response.data);
        } catch (error) {
            console.error("Kesalahan saat mengambil daftar tunggu:", error);
            showToast('Gagal mengambil data daftar tunggu', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        const isConfirmed = await confirm({
            title: 'Batalkan Antrean',
            message: 'Apakah Anda yakin ingin membatalkan permintaan tunggu ini? Anda akan kehilangan posisi antrean Anda.',
            confirmText: 'Ya, Batalkan',
            cancelText: 'Tidak',
            type: 'danger'
        });

        if (!isConfirmed) return;

        try {
            await axios.delete(`/waiting-lists/${id}`);
            showToast('Permintaan tunggu berhasil dibatalkan');
            fetchWaitingList();
        } catch (error) {
            showToast('Gagal membatalkan permintaan', 'error');
        }
    };

    const formatDate = (dateString, includeTime = true) => {
        if (!dateString) return '-';
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const getImageUrl = (image) => {
        if (!image) return null;
        if (image.startsWith('http')) return image;
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        const storageUrl = baseUrl.replace(/\/api$/, '');
        return `${storageUrl}/storage/${image}`;
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Daftar Tunggu</h1>
                <p className="text-gray-500 mt-2 font-medium">Kelola posisi Anda dalam antrean untuk peralatan yang sedang kosong.</p>
            </div>

            <div className="bg-blue-50/50 rounded-[32px] p-8 border border-blue-100 flex flex-col md:flex-row gap-6 items-center">
                <div className="bg-white p-4 rounded-3xl shadow-sm text-blue-600">
                    <Bell className="w-8 h-8" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Notifikasi Antrean</h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">
                        Ketika barang yang Anda tunggu tersedia, sistem akan <span className="text-emerald-600 font-bold">otomatis membuat permohonan pinjam</span> untuk Anda. Anda dapat melihat perkiraan tanggal barang tersedia di kartu item di bawah ini.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="grid gap-4">
                    {[1, 2].map(i => (
                        <div key={i} className="bg-white rounded-[32px] p-8 border border-gray-100 h-40 animate-pulse"></div>
                    ))}
                </div>
            ) : waitingList.length === 0 ? (
                <div className="bg-white rounded-[40px] p-20 text-center border border-dashed border-gray-200 shadow-sm">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                        <Clock className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Antrean Anda kosong</h3>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto">Barang yang stoknya habis dapat ditambahkan ke daftar tunggu dari katalog.</p>
                    <button onClick={() => window.location.href = '/items'} className="mt-6 bg-gray-900 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-gray-200 hover:bg-black transition-all flex items-center gap-2 mx-auto">
                        Jelajahi Barang <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div className="grid gap-6">
                    {waitingList.map((entry) => (
                        <div key={entry.id} className="group bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-50/50 transition-all duration-500">
                            <div className="flex flex-col md:flex-row justify-between gap-8">
                                <div className="flex-1 flex flex-col md:flex-row gap-6">
                                    <div className="bg-gray-50 rounded-3xl p-6 w-32 h-32 flex items-center justify-center group-hover:bg-blue-50/50 transition-colors duration-500 shrink-0 overflow-hidden border border-gray-100/50">
                                        {entry.item?.image ? (
                                            <img
                                                src={getImageUrl(entry.item.image)}
                                                alt={entry.item.name}
                                                className="w-full h-full object-contain transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                                            />
                                        ) : (
                                            <Package className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-5">
                                        {/* Header: Name and Status Badge */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors duration-500">{entry.item?.name}</h3>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                    {entry.item?.category?.name || 'Equipment'} • Kondisi {entry.item?.condition || 'Baik'}
                                                </p>
                                            </div>
                                            <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border ${entry.status === 'converted'
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50'
                                                : 'bg-blue-50 text-blue-600 border-blue-100/50'
                                                } whitespace-nowrap w-fit`}>
                                                {entry.status === 'converted' ? 'Diproses ke Pinjaman' : 'Menunggu Antrean'}
                                            </div>
                                        </div>

                                        {/* Metadata area */}
                                        <div className="flex flex-wrap gap-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pt-5 border-t border-gray-50">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center">
                                                    <Clock className="w-3.5 h-3.5" />
                                                </div>
                                                <span>Joined {formatDate(entry.requested_at)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-blue-500">
                                                <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                                                    <ShieldCheck className="w-3.5 h-3.5" />
                                                </div>
                                                <span>QTY: {entry.quantity} UNIT</span>
                                            </div>
                                        </div>

                                        {/* Estimation or Conversion Alerts */}
                                        {(entry.status === 'waiting' && entry.estimated_available_at) || entry.status === 'converted' ? (
                                            <div className="pt-2">
                                                {entry.status === 'waiting' && entry.estimated_available_at && (
                                                    <div className="flex items-center gap-4 bg-amber-50/50 text-amber-700 px-5 py-4 rounded-[24px] border border-amber-100/30 group-hover:bg-amber-50 transition-colors duration-500">
                                                        <div className="bg-amber-100 p-2.5 rounded-xl">
                                                            <CalendarCheck className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 leading-none mb-1">Estimasi Tersedia</p>
                                                            <p className="text-sm font-black">{formatDate(entry.estimated_available_at, false)}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {entry.status === 'converted' && (
                                                    <div className="flex items-center gap-4 bg-emerald-50/50 text-emerald-700 px-5 py-4 rounded-[24px] border border-emerald-100/30 group-hover:bg-emerald-50 transition-colors duration-500">
                                                        <div className="bg-emerald-100 p-2.5 rounded-xl">
                                                            <AlertCircle className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 leading-none mb-1">Status Sistem</p>
                                                            <p className="text-sm font-black italic">Barang telah otomatis diajukan pinjam ke Dashboard Anda</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center items-center md:items-end gap-4 md:w-56 shrink-0 md:pl-8 md:border-l md:border-gray-50">
                                    {entry.status === 'converted' ? (
                                        <button
                                            onClick={() => window.location.href = '/my-loans'}
                                            className="w-full bg-indigo-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-gray-200 hover:bg-emerald-600 hover:shadow-emerald-200 transition-all duration-500 flex items-center justify-center gap-2 group/btn active:scale-95"
                                        >
                                            Lihat Pinjaman <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                        </button>
                                    ) : (
                                        <div className="w-full p-5 rounded-[24px] bg-gray-50/80 border border-gray-100/50 text-center">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 leading-none">Antrean Aktif</p>
                                            <p className="text-xs font-bold text-gray-800">Menunggu Restock</p>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => handleCancel(entry.id)}
                                        className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] hover:text-red-500 transition-all duration-300 py-2 flex items-center gap-2 hover:translate-x-1"
                                    >
                                        <X className="w-3.5 h-3.5" /> Batalkan Antrean
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-gray-50 rounded-[32px] p-6 flex gap-4 border border-gray-100 mt-12">
                <Info className="w-6 h-6 text-gray-300 shrink-0" />
                <p className="text-xs text-gray-400 font-medium leading-relaxed italic">
                    Catatan: Posisi antrean Anda diprioritaskan berdasarkan tanggal permintaan (FIFO). Pembatalan akan menghapus Anda secara permanen dari antrean saat ini.
                </p>
            </div>
        </div>
    );
};

export default WaitingListPage;
