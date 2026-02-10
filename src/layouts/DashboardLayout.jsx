import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { Heart, ShoppingCart, Menu, Search, Bell } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import NotificationBell from '../components/ui/NotificationBell';

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const { cartCount } = useShop();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleBurgerClick = () => {
        // Mobile: toggle sidebar open/close
        // Desktop: toggle collapsed state
        if (window.innerWidth < 768) {
            setIsSidebarOpen(!isSidebarOpen);
        } else {
            setIsCollapsed(!isCollapsed);
        }
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
            {/* Sidebar (Mobile: Off-canvas, Desktop: Static) */}
            <div className={`fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar onClose={() => setIsSidebarOpen(false)} isCollapsed={isCollapsed} />
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative w-full">
                {/* Header */}
                <header className="bg-white/80 shadow backdrop-blur-md sticky top-0 z-20 px-8 py-4 flex items-center justify-between border-b border-gray-100">

                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={handleBurgerClick}
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Search Bar */}
                        <div className="relative w-96 hidden md:block">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari data, alat, atau laporan..."
                                className="block w-full pl-10 pr-12 py-3 border-none rounded-2xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 focus:bg-white focus:shadow-sm sm:text-sm transition-all"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <span className="text-gray-400 bg-white border border-gray-200 rounded-md px-2 py-0.5 text-xs font-semibold shadow-sm">⌘ F</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side Icons & Profile */}
                    <div className="flex items-center gap-6">
                        {/* Icons */}
                        <div className="flex items-center gap-4">
                            {/* Role based Icons */}
                            {user?.role?.name === 'peminjam' && (
                                <Link to="/wishlist" className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center group relative" title="Favorit Saya">
                                    <Heart className="h-5 w-5 group-hover:fill-current" />
                                </Link>
                            )}

                            {/* Notification Bell for Everyone */}
                            <NotificationBell />
                        </div>

                        {/* Profile User */}
                        <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-gray-800">
                                    {user?.full_name}
                                </p>
                                <p className="text-xs text-gray-400 font-medium">
                                    {user?.email}
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold overflow-hidden border-2 border-white shadow-sm cursor-pointer ring-2 ring-transparent hover:ring-emerald-500/20 transition-all">
                                {user?.profile_photo_path ? (
                                    <img
                                        src={`http://127.0.0.1:8000/storage/${user.profile_photo_path}`}
                                        alt="User"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                            e.target.parentNode.innerText = user?.full_name?.charAt(0);
                                        }}
                                    />
                                ) : (
                                    user?.full_name?.charAt(0)
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-8 scrollbar-hide bg-gray-100">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
