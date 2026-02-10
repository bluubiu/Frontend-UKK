import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Tag, Package, FileText, CheckCircle, Search, DollarSign, Home, Clock, User, LogOut, Settings, Activity, History } from 'lucide-react';

const Sidebar = ({ onClose, isCollapsed = false }) => {
    const { user, logout } = useAuth();
    const roleName = user?.role?.name;

    const getNavItems = () => {
        if (roleName === 'admin') {
            return [
                { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { to: '/admin/users', label: 'Pengguna', icon: Users },
                { to: '/admin/categories', label: 'Kategori', icon: Tag },
                { to: '/admin/items', label: 'Barang', icon: Package },
                { to: '/admin/reports', label: 'Laporan', icon: FileText },
                { to: '/admin/activity-logs', label: 'Log Aktivitas', icon: History },
            ];
        } else if (roleName === 'petugas') {
            return [
                { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { to: '/admin/loans', label: 'Persetujuan Peminjaman', icon: CheckCircle },
                { to: '/admin/returns', label: 'Cek Pengembalian', icon: Search },
                { to: '/admin/fines-verification', label: 'Verifikasi Denda', icon: DollarSign },
                { to: '/admin/reports', label: 'Laporan', icon: FileText },
            ];
        } else {
            return [
                { to: '/dashboard', label: 'Dashboard', icon: Home },
                { to: '/items', label: 'Katalog Barang', icon: Package },
                { to: '/my-loans', label: 'Peminjaman Saya', icon: FileText },
                { to: '/fines', label: 'Riwayat Denda', icon: DollarSign },
                { to: '/waiting-list', label: 'Daftar Tunggu', icon: Clock },
            ];
        }
    };

    const navItems = getNavItems();

    return (
        <aside className={`bg-white flex flex-col border-r border-gray-100 font-sans h-full transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
            {/* Brand */}
            <div className={`p-8 flex items-center gap-3 ${isCollapsed ? 'justify-center p-4' : ''}`}>
                <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-emerald-200 shadow-lg">
                    <Activity className="w-6 h-6" />
                </div>
                {!isCollapsed && (
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-800">Medi<span className="text-emerald-600">UKS</span></h1>
                        <p className="text-[10px] text-gray-400 font-medium tracking-wider">MANAGEMENT</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8 scrollbar-hide ">
                <div>
                    {!isCollapsed && <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Menu</p>}
                    <nav className="space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 relative group ${isActive ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-emerald-600 font-medium'
                                    } ${isCollapsed ? 'justify-center' : ''}`
                                }
                                title={isCollapsed ? item.label : ''}
                            >
                                {({ isActive }) => (
                                    <>
                                        {isActive && !isCollapsed && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-emerald-600 rounded-r-lg"></div>
                                        )}
                                        <item.icon className={`w-6 h-6 transition-colors ${isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-500'}`} />
                                        {!isCollapsed && <span className="text-sm whitespace-nowrap">{item.label}</span>}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div>
                    {!isCollapsed && <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">General</p>}
                    <nav className="space-y-2">
                        <NavLink
                            to="/profile"
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-all group ${isActive ? 'text-gray-900 font-bold bg-gray-50' : 'text-gray-500 hover:text-emerald-600'
                                } ${isCollapsed ? 'justify-center' : ''}`
                            }
                            title={isCollapsed ? 'My Profile' : ''}
                        >
                            <User className="w-6 h-6 text-gray-400 group-hover:text-emerald-500" />
                            {!isCollapsed && <span className="text-sm">Profil Saya</span>}
                        </NavLink>
                        <button
                            onClick={logout}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-gray-500 hover:text-red-600 font-medium transition-all group ${isCollapsed ? 'justify-center' : ''}`}
                            title={isCollapsed ? 'Logout' : ''}
                        >
                            <LogOut className="w-6 h-6 text-gray-400 group-hover:text-red-500" />
                            {!isCollapsed && <span className="text-sm">Keluar</span>}
                        </button>
                    </nav>
                </div>
            </div>

            {/* User Profile Summary */}
            {!isCollapsed && (
                <div className="p-4 mt-auto border-t border-gray-50 bg-gray-50/50">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                            {user?.profile_photo_path ? (
                                <img src={`http://127.0.0.1:8000/storage/${user.profile_photo_path}`} className="w-full h-full object-cover" alt="" />
                            ) : (
                                user?.full_name?.charAt(0)
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{user?.full_name}</p>
                            <p className="text-[10px] font-medium text-gray-400 truncate uppercase tracking-wider">{user?.role?.name}</p>
                        </div>
                        <NavLink to="/profile" className="p-2 text-gray-400 hover:text-emerald-600 transition-colors">
                            <Settings className="w-5 h-5" />
                        </NavLink>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
