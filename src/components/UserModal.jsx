import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from '../api/axios';
import { X } from 'lucide-react';

const UserModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
    const [formData, setFormData] = useState({
        username: '',
        full_name: '',
        email: '',
        phone: '',
        role_id: '',
        password: '', // Only for creation or if admin wants to reset (optional)
        is_active: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [roles, setRoles] = useState([]);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axios.get('/roles');
                setRoles(response.data);
            } catch (err) {
                console.error("Kesalahan saat mengambil peran:", err);
            }
        };
        fetchRoles();
    }, []);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    username: initialData.username,
                    full_name: initialData.full_name,
                    email: initialData.email,
                    phone: initialData.phone || '',
                    role_id: initialData.role_id,
                    password: '', // Don't show password
                    is_active: initialData.is_active
                });
            } else {
                setFormData({
                    username: '',
                    full_name: '',
                    email: '',
                    phone: '',
                    role_id: 3, // Default to peminjam
                    password: '',
                    is_active: true
                });
            }
        }
    }, [isOpen, initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const dataToSubmit = { ...formData };
            if (initialData && !dataToSubmit.password) {
                delete dataToSubmit.password;
            }
            await onSubmit(dataToSubmit);
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // ... (inside component)

    return createPortal(
        <div className="fixed inset-0 w-full h-screen z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">
                        {initialData ? 'Ubah User' : 'Tambah User Baru'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                disabled={!!initialData}
                                className={`w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${initialData ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                                disabled={!!initialData}
                                className={`w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${initialData ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={!!initialData}
                                className={`w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${initialData ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    if (value.length <= 12) {
                                        setFormData(prev => ({ ...prev, phone: value }));
                                    }
                                }}
                                disabled={!!initialData}
                                placeholder="081234567890"
                                className={`w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${initialData ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            name="role_id"
                            value={formData.role_id}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                        >
                            {roles.filter(role => role.name !== 'admin' || (initialData && initialData.role_id === role.id)).map(role => (
                                <option key={role.id} value={role.id}>{role.name.charAt(0).toUpperCase() + role.name.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    {!initialData && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required={!initialData}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                placeholder="Minimum 8 characters"
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            name="is_active"
                            id="is_active_user"
                            checked={formData.is_active}
                            onChange={handleChange}
                            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <label htmlFor="is_active_user" className="text-sm text-gray-700 font-medium">Active Account</label>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200"
                        >
                            {loading ? 'Saving...' : (initialData ? 'Update User' : 'Create User')}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.getElementById('modal-root')
    );
};

export default UserModal;
