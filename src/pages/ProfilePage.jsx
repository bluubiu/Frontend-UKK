import { useState, useEffect, useRef } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    User,
    Mail,
    Phone,
    Camera,
    ShieldCheck,
    TrendingUp,
    History,
    Save,
    Lock,
    Edit3,
    ArrowRight,
    Loader2,
    AlertCircle
} from 'lucide-react';

const ProfilePage = () => {
    const { user: authUser, setUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        username: '',
        phone: '',
        password: '',
        password_confirmation: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axios.get('/profile');
            setProfile(response.data);
            setFormData({
                full_name: response.data.full_name || '',
                email: response.data.email || '',
                username: response.data.username || '',
                phone: response.data.phone || '',
                password: '',
                password_confirmation: ''
            });
        } catch (error) {
            console.error("Kesalahan saat mengambil profil:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await axios.put('/profile', formData);
            setProfile(response.data.user);
            setUser(prev => ({ ...prev, ...response.data.user })); // Merge with context state
            setMessage({ type: 'success', text: 'Profil telah diperbarui dengan sukses!' });
            // Clear passwords
            setFormData(prev => ({ ...prev, password: '', password_confirmation: '' }));
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Gagal memperbarui profil.'
            });
        } finally {
            setUpdating(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('photo', file);

        setPhotoUploading(true);
        try {
            const response = await axios.post('/profile/photo', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfile(prev => ({ ...prev, profile_photo_path: response.data.profile_photo_path }));
            setUser(prev => ({ ...prev, profile_photo_path: response.data.profile_photo_path }));
            setMessage({ type: 'success', text: 'Foto telah diperbarui dengan sukses!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal mengunggah foto.' });
        } finally {
            setPhotoUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
                <p className="font-bold uppercase tracking-widest text-[10px]">Loading Profile...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fade-in">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-[40px] bg-[#1C1F2B] p-10 md:p-14 text-white shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                    {/* Avatar Section */}
                    <div className="relative group">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-[32px] bg-emerald-600/20 border-4 border-white/10 flex items-center justify-center text-white text-5xl font-black overflow-hidden shadow-2xl">
                            {profile?.profile_photo_path ? (
                                <img
                                    src={`http://127.0.0.1:8000/storage/${profile.profile_photo_path}`}
                                    className="w-full h-full object-cover"
                                    alt=""
                                />
                            ) : (
                                profile?.full_name?.charAt(0)
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={photoUploading}
                            className="absolute -bottom-2 -right-2 bg-emerald-600 p-3 rounded-2xl shadow-xl hover:bg-emerald-500 transition-all border-4 border-[#1C1F2B] disabled:opacity-50"
                        >
                            {photoUploading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Camera className="w-5 h-5" />
                            )}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                        />
                    </div>

                    <div className="flex-1 space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {profile?.role?.name} Akun
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{profile?.full_name}</h1>
                        <p className="text-gray-400 font-medium">@{profile?.username} • Member sejak {new Date(profile?.created_at).getFullYear()}</p>

                        <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
                            <div className="bg-white/10 px-5 py-3 rounded-2xl border border-white/5 flex items-center gap-3">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Skor Kepatuhan</p>
                                    <p className="text-lg font-black">{profile?.score || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative */}
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm relative group overflow-hidden">
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-3">
                                <Edit3 className="w-6 h-6 text-emerald-600" />
                                <h2 className="text-2xl font-bold text-gray-900">Informasi Pribadi</h2>
                            </div>
                        </div>

                        {message.text && (
                            <div className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 ${message.type === 'success'
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                : 'bg-red-50 border-red-100 text-red-700'
                                }`}>
                                {message.type === 'success' ? <ShieldCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                <span className="text-sm font-bold">{message.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nama Lengkap</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                        <input
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-[20px] focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all font-semibold"
                                            placeholder="Masukkan nama lengkap"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Alamat Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-[20px] focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all font-semibold"
                                            placeholder="Masukkan email"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Username</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-300 text-lg">@</span>
                                        <input
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-[20px] focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all font-semibold"
                                            placeholder="username"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nomor Telepon</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                if (value.length <= 15) setFormData({ ...formData, phone: value });
                                            }}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-[20px] focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all font-semibold"
                                            placeholder="081234567890"
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-50 my-4" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Password Baru (Opsional)</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-[20px] focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all font-semibold"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Konfirmasi Password Baru</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                        <input
                                            type="password"
                                            value={formData.password_confirmation}
                                            onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-[20px] focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all font-semibold"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="bg-emerald-600 text-white px-8 py-4 rounded-2xl text-sm font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-500 transition-all flex items-center gap-2 group disabled:opacity-70"
                                >
                                    {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Simpan Perubahan
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar Stats (Role Based) */}
                <div className="space-y-8">
                    {/* Borrower: Score History */}
                    {profile?.role?.name !== 'admin' && profile?.role?.name !== 'petugas' && (
                        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-3 mb-8">
                                <History className="w-6 h-6 text-gray-900" />
                                <h3 className="text-xl font-bold text-gray-900">Riwayat Skor</h3>
                            </div>

                            <div className="relative space-y-6">
                                {/* Roadmap Line */}
                                <div className="absolute left-[11px] top-0 bottom-4 w-0.5 bg-gray-50"></div>

                                {profile?.score_logs?.length > 0 ? (
                                    profile.score_logs.map((log, idx) => (
                                        <div key={idx} className="relative pl-8 group">
                                            <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${log.score_change >= 0 ? 'bg-emerald-500' : 'bg-red-500'
                                                }`}>
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <p className="font-bold text-sm text-gray-800">{log.reason}</p>
                                                    <span className={`text-xs font-black ${log.score_change >= 0 ? 'text-emerald-600' : 'text-red-500'
                                                        }`}>
                                                        {log.score_change >= 0 ? '+' : ''}{log.score_change}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                                                    {new Date(log.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-gray-300 italic font-medium">
                                        Tidak ada catatan.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Officer/Admin: Quick Stats (Placeholder) */}
                    {(profile?.role?.name === 'admin' || profile?.role?.name === 'petugas') && (
                        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Statistik Petugas</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4">
                                    <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Role</p>
                                        <p className="font-bold text-gray-900 capitalize">{profile?.role?.name}</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4">
                                    <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Status</p>
                                        <p className="font-bold text-gray-900">Petugas Aktif</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Account Stats */}
                    <div className="bg-[#1C1F2B] rounded-[32px] p-8 text-white relative overflow-hidden group">
                        <div className="relative z-10 space-y-6">
                            <h3 className="text-xl font-bold">Keanggotaan</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-gray-400">Tanggal Gabung</span>
                                    <span>{new Date(profile?.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-gray-400">Account ID</span>
                                    <span className="font-mono text-emerald-400">IDX-{profile?.id.toString().padStart(4, '0')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
