import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from '../api/axios';

const ItemModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        stock: 0,
        condition: 'baik',
        description: '',
        is_active: true
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            if (initialData) {
                setFormData({
                    name: initialData.name,
                    category_id: initialData.category_id,
                    stock: initialData.stock,
                    condition: initialData.condition,
                    description: initialData.description || '',
                    is_active: initialData.is_active
                });

                if (initialData.image) {
                    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
                    const storageUrl = baseUrl.replace(/\/api$/, '');
                    const imgUrl = initialData.image.startsWith('http')
                        ? initialData.image
                        : `${storageUrl}/storage/${initialData.image}`;
                    setImagePreview(imgUrl);
                } else {
                    setImagePreview(null);
                }
            } else {
                setFormData({
                    name: '',
                    category_id: '',
                    stock: 0,
                    condition: 'baik',
                    description: '',
                    is_active: true
                });
                setImagePreview(null);
            }
            setImage(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }, [isOpen, initialData]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/categories');
            setCategories(response.data.data ? response.data.data : response.data);
        } catch (err) {
            console.error("Gagal mengambil kategori", err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Ukuran file terlalu besar. Maksimal 5MB.');
                return;
            }
            if (!file.type.match(/^image\/(jpeg|png|jpg|webp)$/)) {
                setError('Tipe file tidak valid. Hanya JPG, PNG, dan WebP yang diperbolehkan.');
                return;
            }

            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('category_id', formData.category_id);
            data.append('stock', formData.stock);
            data.append('condition', formData.condition);
            data.append('description', formData.description);
            data.append('is_active', formData.is_active ? '1' : '0');

            if (image) {
                data.append('image', image);
            }

            if (initialData) {
                data.append('_method', 'PUT');
                await onSubmit(data, initialData.id);
            } else {
                await onSubmit(data);
            }

            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Ada yang salah. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 w-full h-screen bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md my-8 overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-xl font-bold text-gray-900">
                        {initialData ? 'Edit Item' : 'Tambah Alat Baru'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto scrollbar-hide">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-2xl border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* Image Upload */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Gambar Barang</label>
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 rounded-[24px] bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center relative group">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/jpeg,image/png,image/webp"
                                    className="block w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all cursor-pointer"
                                />
                                <p className="text-[10px] text-gray-400 mt-2 font-medium">Format: JPG, PNG, WebP (Maks. 5MB)</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nama Barang</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-sm font-medium"
                            placeholder="Contoh: Stetoskop Digital Pro"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Kategori</label>
                            <select
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                required
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-sm font-medium"
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Stok</label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                                min="0"
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-sm font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Kondisi</label>
                        <select
                            name="condition"
                            value={formData.condition}
                            onChange={handleChange}
                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-sm font-medium"
                        >
                            <option value="baik">Kondisi Baik</option>
                            <option value="rusak ringan">Rusak Ringan</option>
                            <option value="rusak berat">Rusak Berat</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Deskripsi</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-sm font-medium resize-none"
                            placeholder="Informasi tambahan mengenai produk..."
                        ></textarea>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <input
                            type="checkbox"
                            name="is_active"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                            className="w-5 h-5 text-emerald-600 border-gray-200 rounded-lg focus:ring-emerald-500 transition-all cursor-pointer"
                        />
                        <label htmlFor="is_active" className="text-sm text-gray-700 font-bold cursor-pointer selection:bg-none">Tersedia untuk dipinjam?</label>
                    </div>

                    <div className="pt-2 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-2xl text-gray-600 font-bold hover:bg-gray-100 transition-all border border-gray-100 active:scale-95"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-4 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-100 active:scale-95"
                        >
                            {loading ? 'Menyimpan...' : (initialData ? 'Perbarui Alat' : 'Tambah Alat')}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.getElementById('modal-root')
    );
};

export default ItemModal;
