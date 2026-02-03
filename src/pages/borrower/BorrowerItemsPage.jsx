import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from '../../api/axios';
import {
    Search,
    Filter,
    Package,
    ArrowRight,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Info,
    Clock,
    ShoppingCart,
    X,
    TrendingUp
} from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { useNotification } from '../../context/NotificationContext';

const BorrowerItemsPage = () => {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const { showToast } = useNotification();

    // Borrow Modal State
    const [selectedItem, setSelectedItem] = useState(null);
    const [borrowData, setBorrowData] = useState({
        loan_date: new Date().toISOString().split('T')[0],
        return_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days default
        quantity: 1
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchItems();
        fetchCategories();
    }, [categoryFilter]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const params = {
                category_id: categoryFilter !== 'all' ? categoryFilter : undefined
            };
            const response = await axios.get('/items/available', { params });
            setItems(response.data.data || response.data);
        } catch (error) {
            console.error("Kesalahan saat mengambil item yang tersedia:", error);
            showToast('Gagal mengambil data barang', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error("Kesalahan saat mengambil kategori:", error);
        }
    };

    const handleAction = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const isWaitingList = selectedItem.available_stock === 0;

        try {
            if (isWaitingList) {
                const response = await axios.post('/waiting-lists', {
                    item_id: selectedItem.id,
                    quantity: borrowData.quantity
                });
                const estDate = response.data.estimated_available_at ? new Date(response.data.estimated_available_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'segera';
                showToast(`Anda telah masuk dalam daftar tunggu untuk ${selectedItem.name}. Estimasi tersedia: ${estDate}.`);
            } else {
                await axios.post('/loans', {
                    loan_date: borrowData.loan_date,
                    return_date: borrowData.return_date,
                    items: [
                        {
                            item_id: selectedItem.id,
                            quantity: borrowData.quantity
                        }
                    ]
                });
                showToast(`Permohonan pinjaman untuk ${selectedItem.name} telah diajukan!`);
            }
            setSelectedItem(null);
            fetchItems();
        } catch (error) {
            console.error("Kesalahan saat memproses permintaan:", error);
            showToast(error.response?.data?.message || 'Gagal memproses permintaan', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category?.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Hero/Header */}
            <div className="relative overflow-hidden rounded-[32px] bg-emerald-600 p-8 md:p-12 text-white shadow-2xl shadow-emerald-200">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                        Katalog Peralatan
                    </h1>
                    <p className="text-emerald-50 font-medium text-lg mb-8 leading-relaxed">
                        Pinjam peralatan berkualitas tinggi untuk kebutuhan Anda. Jelajahi inventaris kami dan ajukan peminjaman dalam hitungan detik.
                    </p>

                    <div className="relative group max-w-lg">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-300 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari alat, barang elektronik..."
                            className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder:text-emerald-200 focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-4 focus:ring-black/5 transition-all outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute right-10 bottom-10 opacity-20 hidden md:block">
                    <Package className="w-64 h-64 rotate-12" />
                </div>
            </div>

            {/* Filter Section */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-3 rounded-[24px] border border-gray-100 shadow-sm">
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-auto">
                    <button
                        onClick={() => setCategoryFilter('all')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${categoryFilter === 'all'
                            ? 'bg-gray-900 text-white shadow-lg'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        Semua Kategori
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setCategoryFilter(cat.id)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${categoryFilter === cat.id
                                ? 'bg-gray-900 text-white shadow-lg'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 text-gray-400 px-4 py-2 bg-gray-50 rounded-xl">
                    <Filter className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{filteredItems.length} Barang Ditemukan</span>
                </div>
            </div>

            {/* Items Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-[32px] p-6 h-[400px] animate-pulse border border-gray-100 shadow-sm flex flex-col gap-4">
                            <div className="w-full h-48 bg-gray-100 rounded-2xl"></div>
                            <div className="h-6 bg-gray-100 rounded-lg w-3/4"></div>
                            <div className="h-4 bg-gray-100 rounded-lg w-1/2"></div>
                            <div className="mt-auto h-12 bg-gray-100 rounded-2xl"></div>
                        </div>
                    ))}
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="bg-white rounded-[40px] p-20 text-center border border-dashed border-gray-200">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                        <Package className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Item tidak ditemukan</h3>
                    <p className="text-gray-400 max-w-xs mx-auto">Coba sesuaikan pencarian atau filter untuk menemukan yang Anda cari.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredItems.map(item => (
                        <ProductCard
                            key={item.id}
                            item={item}
                            onAction={setSelectedItem}
                        />
                    ))}
                </div>
            )}

            {/* Borrow Modal */}
            {selectedItem && createPortal(
                <div className="fixed inset-0 w-full h-screen z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-fade-in"
                        onClick={() => !submitting && setSelectedItem(null)}
                    ></div>

                    <div className="relative bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
                        <div className="px-8 py-8 md:p-10 overflow-y-auto scrollbar-hide">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="bg-emerald-50 p-4 rounded-3xl text-emerald-600">
                                        <ShoppingCart className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Pinjam Barang</h2>
                                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{selectedItem.name}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleAction} className="space-y-6">
                                {selectedItem.available_stock > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-600" /> Tanggal Pinjam
                                            </label>
                                            <input
                                                type="date"
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-emerald-500 focus:bg-white transition-all outline-none font-medium"
                                                value={borrowData.loan_date}
                                                onChange={e => setBorrowData({ ...borrowData, loan_date: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-emerald-600" /> Tanggal Kembali
                                            </label>
                                            <input
                                                type="date"
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-emerald-500 focus:bg-white transition-all outline-none font-medium"
                                                value={borrowData.return_date}
                                                onChange={e => setBorrowData({ ...borrowData, return_date: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <Package className="w-4 h-4 text-emerald-600" /> Jumlah (Quantity)
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="1"
                                            max={selectedItem.available_stock === 0 ? selectedItem.stock : selectedItem.available_stock}
                                            className="flex-1 accent-emerald-600"
                                            value={borrowData.quantity}
                                            onChange={e => setBorrowData({ ...borrowData, quantity: parseInt(e.target.value) })}
                                        />
                                        <span className="w-12 text-center font-bold text-xl text-gray-900">{borrowData.quantity}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                        {selectedItem.available_stock === 0 ? `Total stok: ${selectedItem.stock} unit` : `Max tersedia: ${selectedItem.available_stock} unit`}
                                    </p>
                                </div>

                                {selectedItem.available_stock === 0 ? (
                                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-4">
                                        <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                                        <p className="text-xs text-blue-800 font-medium leading-relaxed">
                                            Barang ini sedang habis. Dengan bergabung di daftar tunggu, Anda akan diprioritaskan saat barang sudah dikembalikan.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-4">
                                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                                        <p className="text-xs text-amber-800 font-medium leading-relaxed">
                                            Menunggu persetujuan petugas. Pastikan Anda mengembalikan barang tepat waktu untuk menjaga skor kepatuhan Anda.
                                        </p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full py-4 rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait ${selectedItem.available_stock === 0
                                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200'
                                        : 'bg-gray-900 hover:bg-black text-white shadow-gray-200'
                                        }`}
                                >
                                    {submitting ? (
                                        <>Memproses...</>
                                    ) : (
                                        <>
                                            {selectedItem.available_stock === 0 ? 'Gabung Daftar Tunggu' : 'Ajukan Permintaan'}
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>,
                document.getElementById('modal-root')
            )}
        </div>
    );
};

export default BorrowerItemsPage;
