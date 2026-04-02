import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import ItemModal from '../../components/ItemModal';
import { Plus, Search, Image, Edit, Trash2, Printer } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { getImageUrl } from '../../utils/imageUrl';

const ItemsPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterCondition, setFilterCondition] = useState('all');
    const [filterStock, setFilterStock] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const { showToast, confirm } = useNotification();

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await axios.get('/items');
            setItems(response.data.data ? response.data.data : response.data);
        } catch (error) {
            console.error("Error fetching items:", error);
            showToast('Gagal mengambil data inventaris', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (formData) => {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        };
        try {
            await axios.post('/items', formData, config);
            showToast('Barang berhasil ditambahkan');
            fetchItems();
        } catch (error) {
            showToast(error.response?.data?.message || 'Gagal menambahkan barang', 'error');
        }
    };

    const handleUpdate = async (formData, id) => {
        if (!id) return;
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        };
        try {
            await axios.post(`/items/${id}`, formData, config);
            showToast('Barang berhasil diperbarui');
            fetchItems();
        } catch (error) {
            showToast(error.response?.data?.message || 'Gagal memperbarui barang', 'error');
        }
    };

    const handleDelete = async (id) => {
        const isConfirmed = await confirm({
            title: 'Hapus Barang',
            message: 'Apakah Anda yakin ingin menghapus barang ini? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
            type: 'danger'
        });

        if (isConfirmed) {
            try {
                await axios.delete(`/items/${id}`);
                showToast('Barang berhasil dihapus');
                fetchItems();
            } catch (error) {
                console.error("Error deleting item:", error);
                showToast('Gagal menghapus barang. Mungkin sedang digunakan oleh peminjaman aktif.', 'error');
            }
        }
    };

    const openCreateModal = () => {
        setCurrentItem(null);
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const handlePrint = () => {
        window.print();
    };

    const categories = [...new Set(items.map(i => i.category?.name).filter(Boolean))];

    const filteredItems = items.filter(item => {
        const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
            (item.category?.name || '').toLowerCase().includes(search.toLowerCase());
            
        const matchCategory = filterCategory === 'all' || item.category?.name === filterCategory;
        const matchCondition = filterCondition === 'all' || item.condition === filterCondition;
        
        let matchStock = true;
        if (filterStock === 'available') matchStock = item.available_stock > 0;
        else if (filterStock === 'empty') matchStock = item.available_stock === 0;

        return matchSearch && matchCategory && matchCondition && matchStock;
    });

    return (
        <div className="space-y-6">
            <div className="space-y-6 print:hidden">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Inventaris</h1>
                        <p className="text-gray-500 mt-2 font-medium">Kelola peralatan medis dan detail stok.</p>
                    </div>
                    <div className='flex gap-2'>
                        <button
                            onClick={openCreateModal}
                            className="bg-gray-800 text-white px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg shadow-gray-200"
                        >
                            <Plus className="w-5 h-5" />
                            Tambah Barang
                        </button>
                        <button
                            onClick={handlePrint}
                            className="bg-white text-gray-700 px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-gray-50 border border-gray-200 transition-all flex items-center gap-2 shadow-sm"
                        >
                            <Printer className="w-5 h-5" />
                            Cetak
                        </button>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari barang berdasarkan nama atau kategori..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-sm font-medium text-gray-700 min-w-[140px]"
                        >
                            <option value="all">Semua Kategori</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <select
                            value={filterCondition}
                            onChange={(e) => setFilterCondition(e.target.value)}
                            className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-sm font-medium text-gray-700 min-w-[140px]"
                        >
                            <option value="all">Semua Kondisi</option>
                            <option value="baik">Kondisi: Baik</option>
                            <option value="rusak ringan">Kondisi: Rusak Ringan</option>
                            <option value="rusak berat">Kondisi: Rusak Berat</option>
                        </select>
                        <select
                            value={filterStock}
                            onChange={(e) => setFilterStock(e.target.value)}
                            className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-sm font-medium text-gray-700 min-w-[140px]"
                        >
                            <option value="all">Semua Stok</option>
                            <option value="available">Stok Tersedia</option>
                            <option value="empty">Stok Habis</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Gambar</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Barang</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stok</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kondisi</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Memuat inventaris...</td>
                                    </tr>
                                ) : filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Tidak ada barang ditemukan.</td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-200">
                                                    {item.image ? (
                                                        <img
                                                            src={getImageUrl(item.image)}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.parentElement.innerHTML = '<svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                                                            }}
                                                        />
                                                    ) : (
                                                        <Image className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-800">{item.name}</div>
                                                <div className="text-xs text-gray-400">{item.description?.substring(0, 30)}...</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-xs font-medium">
                                                    {item.category?.name || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-700">
                                                    {item.available_stock} <span className="text-gray-400">/ {item.stock}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1
                                                    ${item.condition === 'baik' ? 'bg-emerald-50 text-emerald-600' :
                                                        item.condition === 'rusak ringan' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${item.condition === 'baik' ? 'bg-emerald-500' : item.condition === 'rusak ringan' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                                                    {item.condition}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-medium ${item.is_active ? 'text-gray-600' : 'text-gray-400'}`}>
                                                    {item.is_active ? 'Active' : 'Archived'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openEditModal(item)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Print Only Table */}
            <div className="hidden print:block w-full font-serif text-sm">
                {/* Header */}
                <div className="text-center border-b-2 border-black mb-6 pb-4">
                    <h1 className="text-2xl font-bold uppercase">Laporan Inventaris Barang <br /> UKS Sekolah</h1>
                    <h2 className="text-m font-bold">MediUKS</h2>
                    <p className="text-sm mt-2">Jl, Ngadiluwih, Kedungpedaringan, Kec. Kepanjen, <br /> Kabupaten Malang, Jawa Timur 65163</p>
                    <p className="text-xs mt-4 text-center italic font-medium tracking-wider">
                        Dicetak pada: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                {/* Data Table */}
                <h3 className="font-bold border-b border-black mb-2 pb-1 mt-6">Rincian Data Barang</h3>
                <table className="w-full border-collapse border border-black text-xs">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black px-2 py-1 text-center w-12">No</th>
                            <th className="border border-black px-2 py-1 text-left">Nama Barang</th>
                            <th className="border border-black px-2 py-1 text-left">Kategori</th>
                            <th className="border border-black px-2 py-1 text-center">Stok</th>
                            <th className="border border-black px-2 py-1 text-center">Kondisi</th>
                            <th className="border border-black px-2 py-1 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map((item, index) => (
                            <tr key={item.id}>
                                <td className="border border-black px-2 py-1 text-center w-12">{index + 1}</td>
                                <td className="border border-black px-2 py-1 font-medium">
                                    {item.name}
                                    <div className="text-[10px] text-gray-500">{item.description}</div>
                                </td>
                                <td className="border border-black px-2 py-1">{item.category?.name || '-'}</td>
                                <td className="border border-black px-2 py-1 text-center">{item.available_stock} / {item.stock}</td>
                                <td className="border border-black px-2 py-1 text-center uppercase">{item.condition}</td>
                                <td className="border border-black px-2 py-1 text-center">{item.is_active ? 'Aktif' : 'Arsip'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Signatures */}
                <div className="mt-12 grid grid-cols-2 gap-8 text-center break-inside-avoid">
                    <div></div>
                    <div>
                        <p className="mb-16">Mengetahui,<br />Kepala UKS / Koordinator</p>
                        <p className="font-bold underline">_________________________</p>
                        <p className="text-xs">NIP. .........................</p>
                    </div>
                </div>
            </div>


            <ItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={currentItem ? (formData) => handleUpdate(formData, currentItem.id) : handleCreate}
                initialData={currentItem}
            />
        </div >
    );
};

export default ItemsPage;
