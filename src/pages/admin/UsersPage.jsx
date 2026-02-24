import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import UserModal from '../../components/UserModal';
import ResetPasswordModal from '../../components/ResetPasswordModal';
import { UserPlus, Search, Edit, Trash2, Printer, Key } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const { showToast, confirm } = useNotification();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Kesalahan saat mengambil data pengguna:", error);
            showToast('Gagal mengambil data pengguna', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleCreate = async (formData) => {
        try {
            await axios.post('/users', formData);
            showToast('Pengguna berhasil ditambahkan');
            fetchUsers();
        } catch (error) {
            showToast(error.response?.data?.message || 'Gagal menambahkan pengguna', 'error');
        }
    };

    const handleUpdate = async (formData) => {
        if (!currentUser) return;
        try {
            await axios.put(`/users/${currentUser.id}`, formData);
            showToast('Data pengguna berhasil diperbarui');
            fetchUsers();
        } catch (error) {
            showToast(error.response?.data?.message || 'Gagal memperbarui pengguna', 'error');
        }
    };

    const handleDelete = async (id) => {
        const isConfirmed = await confirm({
            title: 'Hapus Pengguna',
            message: 'Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
            type: 'danger'
        });

        if (isConfirmed) {
            try {
                await axios.delete(`/users/${id}`);
                showToast('Pengguna berhasil dihapus');
                fetchUsers();
            } catch (error) {
                console.error("Kesalahan saat menghapus pengguna:", error);
                showToast('Gagal menghapus pengguna', 'error');
            }
        }
    };

    const openCreateModal = () => {
        setCurrentUser(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setCurrentUser(user);
        setIsModalOpen(true);
    };

    const openResetModal = (user) => {
        setCurrentUser(user);
        setIsResetModalOpen(true);
    };

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        user.username?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.role?.name?.toLowerCase().includes(search.toLowerCase())
    );

    const getRoleBadgeColor = (roleName) => {
        switch (roleName) {
            case 'admin': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'petugas': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="space-y-6">
            {/* Print Header: Like LoanDetailModal */}
            {/* <div className="hidden print:block p-8 text-center border-b-2 border-black mb-6">
                <h1 className="text-2xl font-bold uppercase">Laporan Data Pengguna <br /> Inventaris Sekolah</h1>
                <h2 className="text-m font-bold">UKS MediUKS</h2>
                <p className="text-sm mt-2">Jl, Ngadiluwih, Kedungpedaringan, Kec. Kepanjen, <br /> Kabupaten Malang, Jawa Timur 65163</p>
                <p className="text-xs mt-4 text-right italic font-medium tracking-wider">Dicetak pada: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div> */}

            <div className="flex justify-between items-end print:hidden">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Manajemen Pengguna</h1>
                    <p className="text-gray-500 mt-2 font-medium">Kontrol akses pengguna dan kelola peran (role).</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="bg-white text-gray-700 px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-gray-50 border border-gray-200 transition-all flex items-center gap-2 shadow-sm"
                    >
                        <Printer className="w-5 h-5" />
                        Cetak Laporan
                    </button>
                    <button
                        onClick={openCreateModal}
                        className="bg-[#1C1F2B] text-white px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg shadow-gray-200"
                    >
                        <UserPlus className="w-5 h-5" />
                        Tambah Pengguna
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 print:hidden">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari pengguna berdasarkan nama, username, atau email..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden print:hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100 print:bg-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider print:text-black">Pengguna</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider print:text-black">Peran (Role)</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider print:text-black">Kontak</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider print:text-black">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider print:hidden">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Memuat pengguna...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Tidak ada pengguna ditemukan.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden border border-gray-100 relative">
                                                    <img
                                                        src={user.profile_photo_path ? (user.profile_photo_path.startsWith('http') ? user.profile_photo_path : `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/api$/, '')}/storage/${user.profile_photo_path}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=random`}
                                                        alt={user.full_name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-800">{user.full_name}</div>
                                                    <div className="text-xs text-gray-400">@{user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getRoleBadgeColor(user.role?.name)} uppercase tracking-wide`}>
                                                {user.role?.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600">{user.email}</div>
                                            {user.phone && <div className="text-xs text-gray-400">{user.phone}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                                <span className={`text-sm font-medium ${user.is_active ? 'text-gray-700' : 'text-gray-400'}`}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right print:hidden">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit User & Roles"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => openResetModal(user)}
                                                    className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                                                    title="Reset Password"
                                                >
                                                    <Key className="w-5 h-5" />
                                                </button>
                                                {user.id !== 1 && (
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Print Only: Table Style from LoanDetailModal */}
            <div className="hidden print:block w-full font-serif text-sm">
                {/* Header */}
                <div className="text-center border-b-2 border-black mb-6 pb-4">
                    <h1 className="text-2xl font-bold uppercase">Laporan Data Pengguna <br /> UKS Sekolah</h1>
                    <h2 className="text-m font-bold">MediUKS</h2>
                    <p className="text-sm mt-2">Jl, Ngadiluwih, Kedungpedaringan, Kec. Kepanjen, <br /> Kabupaten Malang, Jawa Timur 65163</p>
                    <p className="text-xs mt-4 text-center italic font-medium tracking-wider">
                        Dicetak pada: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                <h3 className="font-bold border-b border-black mb-2 pb-1 mt-6">Rincian Data Pengguna</h3>
                <table className="w-full border-collapse border border-black text-xs">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black px-2 py-1 text-center w-12">No</th>
                            <th className="border border-black px-2 py-1 text-left">Nama Lengkap</th>
                            <th className="border border-black px-2 py-1 text-center">Username</th>
                            <th className="border border-black px-2 py-1 text-left">Email</th>
                            <th className="border border-black px-2 py-1 text-center">Peran</th>
                            <th className="border border-black px-2 py-1 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user, index) => (
                            <tr key={user.id}>
                                <td className="border border-black px-2 py-1 text-center">{index + 1}</td>
                                <td className="border border-black px-2 py-1 font-medium">{user.full_name}</td>
                                <td className="border border-black px-2 py-1 text-center">@{user.username}</td>
                                <td className="border border-black px-2 py-1">{user.email}</td>
                                <td className="border border-black px-2 py-1 text-center uppercase font-bold">{user.role?.name}</td>
                                <td className="border border-black px-2 py-1 text-center font-bold">{user.is_active ? 'AKTIF' : 'NONAKTIF'}</td>
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


            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={currentUser ? handleUpdate : handleCreate}
                initialData={currentUser}
            />

            <ResetPasswordModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                user={currentUser}
            />
        </div >
    );
};

export default UsersPage;
