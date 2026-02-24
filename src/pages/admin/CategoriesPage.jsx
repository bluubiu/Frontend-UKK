import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import CategoryModal from '../../components/CategoryModal';
import { Plus, Search, Edit, Trash2, Printer, Package } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const { showToast, confirm } = useNotification();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/categories');
            setCategories(response.data.data ? response.data.data : response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
            showToast('Gagal mengambil data kategori', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (formData) => {
        try {
            await axios.post('/categories', formData);
            showToast('Kategori berhasil ditambahkan');
            fetchCategories();
        } catch (error) {
            showToast(error.response?.data?.message || 'Gagal menambahkan kategori', 'error');
        }
    };

    const handleUpdate = async (formData) => {
        if (!currentCategory) return;
        try {
            await axios.put(`/categories/${currentCategory.id}`, formData);
            showToast('Kategori berhasil diperbarui');
            fetchCategories();
        } catch (error) {
            showToast(error.response?.data?.message || 'Gagal memperbarui kategori', 'error');
        }
    };

    const handleDelete = async (id) => {
        const isConfirmed = await confirm({
            title: 'Hapus Kategori',
            message: 'Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
            type: 'danger'
        });

        if (isConfirmed) {
            try {
                await axios.delete(`/categories/${id}`);
                showToast('Kategori berhasil dihapus');
                fetchCategories();
            } catch (error) {
                console.error("Kesalahan saat menghapus kategori:", error);
                showToast('Gagal menghapus kategori. Mungkin sedang digunakan oleh item.', 'error');
            }
        }
    };

    const openCreateModal = () => {
        setCurrentCategory(null);
        setIsModalOpen(true);
    };

    const openEditModal = (cat) => {
        setCurrentCategory(cat);
        setIsModalOpen(true);
    };

    const handlePrint = () => {
        window.print();
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="space-y-6 print:hidden">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Kategori</h1>
                        <p className="text-gray-500 mt-2 font-medium">Atur jenis dan pengelompokan peralatan.</p>
                    </div>
                    <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="bg-white text-gray-700 px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-gray-50 border border-gray-200 transition-all flex items-center gap-2 shadow-sm"
                    >
                        <Printer className="w-5 h-5" />
                        Cetak
                    </button>
                    <button
                        onClick={openCreateModal}
                        className="bg-[#1C1F2B] text-white px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg shadow-gray-200"
                    >
                        <Plus className="w-5 h-5" />
                        Tambah Kategori
                    </button>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 max-w-xl">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari kategori..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-10 text-center text-gray-400">Memuat kategori...</div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="col-span-full py-10 text-center text-gray-400">Tidak ada kategori ditemukan.</div>
                    ) : (
                        filteredCategories.map((cat) => (
                            <div key={cat.id} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform duration-300 group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <span className="font-bold text-lg">{cat.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(cat)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-1">{cat.name}</h3>
                                <p className="text-sm text-gray-400 font-medium">
                                    {cat.description ? cat.description : 'No description provided'}
                                </p>
                                <div className="flex item-center gap-2 pt-3 border-3 border-gray-100">
                                    <Package className="w-4 h-4 text-emerald-500" />
                                    <span className='text-sm font-semibold text-emerald-600'>{cat.items_count ?? 0}

                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>  

            {/* Print Only Table */}
            <div className="hidden print:block w-full font-serif text-sm">
                {/* Header */}
                <div className="text-center border-b-2 border-black mb-6 pb-4">
                    <h1 className="text-2xl font-bold uppercase">Laporan Kategori Barang <br /> UKS Sekolah</h1>
                    <h2 className="text-m font-bold">MediUKS</h2>
                    <p className="text-sm mt-2">Jl, Ngadiluwih, Kedungpedaringan, Kec. Kepanjen, <br /> Kabupaten Malang, Jawa Timur 65163</p>
                    <p className="text-xs mt-4 text-center italic font-medium tracking-wider">
                        Dicetak pada: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                {/* Data Table */}
                <h3 className="font-bold border-b border-black mb-2 pb-1 mt-6">Rincian Data Kategori</h3>
                <table className="w-full border-collapse border border-black text-xs">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black px-2 py-1 text-center w-12">No</th>
                            <th className="border border-black px-2 py-1 text-left">Nama Kategori</th>
                            <th className="border border-black px-2 py-1 text-left">Deskripsi</th>
                            <th className="border border-black px-2 py-1 text-center w-24">Jumlah Item</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCategories.map((cat, index) => (
                            <tr key={cat.id}>
                                <td className="border border-black px-2 py-1 text-center">{index + 1}</td>
                                <td className="border border-black px-2 py-1 font-bold">{cat.name}</td>
                                <td className="border border-black px-2 py-1">{cat.description || '-'}</td>
                                <td className="border border-black px-2 py-1 text-center">{cat.items_count || 0}</td>
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


            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={currentCategory ? handleUpdate : handleCreate}
                initialData={currentCategory}
            />
        </div >
    );
};

export default CategoriesPage;
