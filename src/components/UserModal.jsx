import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from '../api/axios';
import { X, Eye, EyeOff } from 'lucide-react';

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
    const [showPassword, setShowPassword] = useState(false);

    // Password Confirmation & Validation State
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false
    });

    const validatePassword = (value) => {
        const criteria = {
            length: value.length >= 8,
            upper: /[A-Z]/.test(value),
            lower: /[a-z]/.test(value),
            number: /[0-9]/.test(value),
            special: /[@$!%*#?&]/.test(value)
        };
        setPasswordCriteria(criteria);
        return Object.values(criteria).every(Boolean);
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, password: value }));
        validatePassword(value);
    };

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
            // Reset validation state
            setPasswordConfirmation('');
            setPasswordCriteria({
                length: false,
                upper: false,
                lower: false,
                number: false,
                special: false
            });
        }
    }, [isOpen, initialData]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

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

            // Password Validation Logic
            if (dataToSubmit.password) {
                if (dataToSubmit.password !== passwordConfirmation) {
                    throw new Error("Password dan Konfirmasi Password tidak cocok.");
                }
                if (!validatePassword(dataToSubmit.password)) {
                    throw new Error("Password belum memenuhi kriteria keamanan.");
                }
                dataToSubmit.password_confirmation = passwordConfirmation;
            } else if (initialData) {
                // If editing and password is empty, remove it so it doesn't update
                delete dataToSubmit.password;
            } else {
                // If creating and password is empty (should be caught by required attribute, but safe check)
                throw new Error("Password wajib diisi untuk user baru.");
            }

            await onSubmit(dataToSubmit);
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.message || err.response?.data?.message || 'Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;



    return createPortal(
        <div
            className="fixed inset-0 w-full h-screen z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-fade-in-up max-h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 py-4 border-b rounded-t-lg border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-800">
                        {initialData ? 'Ubah User' : 'Tambah User Baru'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6">
                    <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
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

                        {/* Password Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {initialData ? 'Password Baru (Kosongkan jika tidak ingin mengubah)' : 'Password'}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handlePasswordChange}
                                    required={!initialData}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all pr-10"
                                    placeholder={initialData ? "Biarkan kosong untuk mempertahankan password lama" : "Buat password aman"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Visual Validation */}
                            {formData.password && (
                                <div className="mt-2 text-xs space-y-1 p-3 bg-gray-50 rounded-lg border border-gray-100 animate-fade-in-up">
                                    <p className="font-semibold text-gray-600 mb-2">Syarat Password:</p>
                                    <div className={`flex items-center ${passwordCriteria.length ? 'text-emerald-600' : 'text-gray-500'}`}>
                                        <span className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center border ${passwordCriteria.length ? 'bg-emerald-100 border-emerald-200' : 'border-gray-300'}`}>
                                            {passwordCriteria.length && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                        </span>
                                        Minimum 8 karakter
                                    </div>
                                    <div className={`flex items-center ${passwordCriteria.upper ? 'text-emerald-600' : 'text-gray-500'}`}>
                                        <span className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center border ${passwordCriteria.upper ? 'bg-emerald-100 border-emerald-200' : 'border-gray-300'}`}>
                                            {passwordCriteria.upper && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                        </span>
                                        Huruf kapital (A-Z)
                                    </div>
                                    <div className={`flex items-center ${passwordCriteria.lower ? 'text-emerald-600' : 'text-gray-500'}`}>
                                        <span className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center border ${passwordCriteria.lower ? 'bg-emerald-100 border-emerald-200' : 'border-gray-300'}`}>
                                            {passwordCriteria.lower && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                        </span>
                                        Huruf kecil (a-z)
                                    </div>
                                    <div className={`flex items-center ${passwordCriteria.number ? 'text-emerald-600' : 'text-gray-500'}`}>
                                        <span className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center border ${passwordCriteria.number ? 'bg-emerald-100 border-emerald-200' : 'border-gray-300'}`}>
                                            {passwordCriteria.number && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                        </span>
                                        Angka (0-9)
                                    </div>
                                    <div className={`flex items-center ${passwordCriteria.special ? 'text-emerald-600' : 'text-gray-500'}`}>
                                        <span className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center border ${passwordCriteria.special ? 'bg-emerald-100 border-emerald-200' : 'border-gray-300'}`}>
                                            {passwordCriteria.special && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                        </span>
                                        Karakter spesial (!@#$%^&*)
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Password Confirmation */}
                        {formData.password && (
                            <div className="animate-fade-in-up">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    required={!!formData.password}
                                    className={`w-full px-4 py-2 rounded-xl border ${passwordConfirmation && formData.password !== passwordConfirmation
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                                        } transition-all outline-none`}
                                    placeholder="Ulangi password"
                                />
                                {passwordConfirmation && formData.password !== passwordConfirmation && (
                                    <p className="text-red-500 text-xs mt-1">Password tidak cocok</p>
                                )}
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
                    </form>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
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
                        form="user-form" // Associate button with the form
                    >
                        {loading ? 'Saving...' : (initialData ? 'Update User' : 'Create User')}
                    </button>
                </div>
            </div>
        </div>,
        document.getElementById('modal-root')
    );
};

export default UserModal;
