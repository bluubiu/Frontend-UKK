import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadialBarChart, RadialBar, Legend
} from 'recharts';
import {
    LayoutDashboard,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    Package,
    Calendar,
    Plus,
    MoreHorizontal,
    Trophy,
    User,
    ArrowUpRight,
    Search,
    Filter,
    Wallet,
    CreditCard,
    Users,
    ShoppingCart,
    Activity,
    ChevronDown
} from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        total_items: 0,
        active_loans: 0,
        returned_today: 0,
        pending_returns: 0,
        recent_loans: [],
        loan_trends: [],
        top_items: [],
        top_performers: [],
        total_fines_paid: 0,
        total_fines_unpaid: 0,
        total_loans: 0,
        loan_status_distribution: { pending: 0, approved: 0, returned: 0, rejected: 0 },
        category_distribution: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('/dashboard/stats');
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return <div className="p-8 flex justify-center text-gray-500 font-medium animate-pulse">Loading dashboard data...</div>;
    }

    const RADIAL_COLORS = ['#043915', '#4C763B', '#B0CE88'];

    const radialData = [...stats.category_distribution]
        .sort((a, b) => b.value - a.value)
        .slice(0, 3)
        .map((item, index) => ({
            name: item.name,
            uv: item.value,
            fill: RADIAL_COLORS[index]
        }));

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Title Section */}
            <div className="flex justify-between items-end">
                <div>
                    {user?.role?.name === 'admin' && (
                        <>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard Admin</h1>
                            <p className="text-gray-500 mt-1 font-medium">Ringkasan aktivitas dan performa sistem perpustakaan.</p>
                        </>
                    )}
                    {user?.role?.name === 'petugas' && (
                        <>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard Petugas</h1>
                            <p className="text-gray-500 mt-1 font-medium">Ringkasan aktivitas dan performa sistem perpustakaan.</p>
                        </>
                    )}
                </div>
                {user?.role?.name === 'admin' && (
                    <a href="/admin/items/create"><button className="bg-gray-900 text-white px-5 py-3 rounded-2xl text-sm font-bold hover:bg-black transition-all flex items-center gap-2 shadow-xl shadow-gray-100">
                        <Plus className="w-4 h-4" />
                        Tambah Barang
                    </button></a>
                )}
            </div>

            {/* Top Cards Section - Inspired by DealDeck */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1: Total Denda Dibayar (Hero Card) */}
                <div className="bg-gradient-to-br from-[#043915] to-[#4C763B] rounded-[32px] p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-sm">
                                +2.08%
                            </span>
                        </div>
                        <h3 className="text-gray-100 text-sm font-medium mb-1">Total Denda Dibayar</h3>
                        <h2 className="text-3xl font-extrabold">{formatCurrency(stats.total_fines_paid)}</h2>
                        <p className="text-xs text-blue-100 mt-2 opacity-80">Pendapatan denda terverifikasi</p>
                    </div>
                    {/* Decorative Circles */}
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
                    <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
                </div>

                {/* Card 2: Total Peminjaman */}
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex justify-between items-start mb-6">
                        <div className="bg-orange-50 p-3 rounded-2xl">
                            <ShoppingCart className="w-6 h-6 text-orange-500" />
                        </div>
                        <span className="bg-green-50 text-green-600 px-3 py-1 rounded-lg text-xs font-bold">
                            +12.4%
                        </span>
                    </div>
                    <h3 className="text-gray-400 text-sm font-bold mb-1">Total Peminjaman</h3>
                    <h2 className="text-3xl font-extrabold text-gray-900">{stats.total_loans}</h2>
                    <p className="text-xs text-gray-400 mt-2 font-medium">Bulan ini vs bulan lalu</p>
                </div>

                {/* Card 3: Belum Dibayar (Attention Card) */}
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex justify-between items-start mb-6">
                        <div className="bg-red-50 p-3 rounded-2xl">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                        </div>
                        <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs font-bold">
                            Action
                        </span>
                    </div>
                    <h3 className="text-gray-400 text-sm font-bold mb-1">Denda Belum Dibayar</h3>
                    <h2 className="text-3xl font-extrabold text-gray-900">{formatCurrency(stats.total_fines_unpaid)}</h2>
                    <p className="text-xs text-gray-400 mt-2 font-medium">Perlu penagihan</p>
                </div>

                {/* Card 4: Total Inventaris / Users */}
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex justify-between items-start mb-6">
                        <div className="bg-emerald-50 p-3 rounded-2xl">
                            <Package className="w-6 h-6 text-emerald-500" />
                        </div>
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-xs font-bold">
                            +5.21%
                        </span>
                    </div>
                    <h3 className="text-gray-400 text-sm font-bold mb-1">Total Inventaris</h3>
                    <h2 className="text-3xl font-extrabold text-gray-900">{stats.total_items}</h2>
                    <p className="text-xs text-gray-400 mt-2 font-medium">Item aktif tersedia</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Loan Analytics (Smooth Area Chart from Image 2) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Chart */}
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Statistik Peminjaman</h3>
                                <p className="text-sm text-gray-400 font-medium">Aktivitas peminjaman 7 hari terakhir</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="flex items-center gap-1 text-emerald-600 font-bold text-sm bg-emerald-50 px-2 py-1 rounded-lg">
                                    <TrendingUp className="w-4 h-4" /> +19.6%
                                </span>
                            </div>
                        </div>

                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.loan_trends}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4C763B" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8FA31E" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1C1F2B', color: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ color: '#fff', fontWeight: 700 }}
                                        cursor={{ stroke: '#4C763B', strokeWidth: 2 }}
                                    />
                                    <Area type="monotone" dataKey="count" stroke="#4C763B" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Loan Status Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex flex-col items-center text-center">
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Pending</span>
                            <span className="text-2xl font-black text-[#043915]">{stats.loan_status_distribution.pending}</span>
                        </div>
                        <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex flex-col items-center text-center">
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Approved</span>
                            <span className="text-2xl font-black text-[#4C763B]">{stats.loan_status_distribution.approved}</span>
                        </div>
                        <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex flex-col items-center text-center">
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Returned</span>
                            <span className="text-2xl font-black text-[#4C763B]">{stats.loan_status_distribution.returned}</span>
                        </div>
                        <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex flex-col items-center text-center">
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Rejected</span>
                            <span className="text-2xl font-black text-[#043915]">{stats.loan_status_distribution.rejected}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Category Distribution (Radial Chart from Image 3) */}
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col">
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Kategori Alat</h3>
                            <p className="text-sm text-gray-400 font-medium">Top 3 Popular Categories</p>
                        </div>
                        <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                            <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    <div className="flex-1 min-h-[250px] relative flex justify-center items-center">
                        <ResponsiveContainer width="100%" height={250}>
                            <RadialBarChart
                                cx="50%"
                                cy="50%"
                                innerRadius="30%"
                                outerRadius="100%"
                                barSize={20}
                                data={radialData}
                                startAngle={90}
                                endAngle={-270}
                            >
                                <RadialBar
                                    minAngle={15}
                                    label={{ position: 'insideStart', fill: '#fff', fontSize: 0 }} // hide label inside
                                    background
                                    clockWise
                                    dataKey="uv"
                                    cornerRadius={10}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value) => [value, 'Items']}
                                />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        {/* Center info */}
                        <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-gray-900">{radialData.reduce((acc, curr) => acc + curr.uv, 0)}</span>
                            <span className="text-[10px] uppercase font-bold text-gray-400">Total Top 3</span>
                        </div>
                    </div>

                    {/* Custom Legend similar to Image 3 */}
                    <div className="mt-6 space-y-4">
                        {radialData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-md" style={{ backgroundColor: item.fill }}></div>
                                    <span className="font-bold text-gray-700 text-sm group-hover:text-gray-900 transition-colors">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold text-gray-400">{item.uv}/{stats.total_items}</span>
                                    <span className="text-xs font-black text-gray-900">
                                        {Math.round((item.uv / (stats.total_items || 1)) * 100)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                        {stats.category_distribution.length === 0 && (
                            <div className="text-center text-gray-400 text-sm italic py-4">Belum ada data kategori</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Section: Top Performers / Customer Growth */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Performers */}
                <div className="lg:col-span-3 bg-gradient-to-br from-[#043915] to-[#4C763B] rounded-[32px] p-8 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-white">Pengguna Teraktif</h3>
                            <p className="text-sm text-gray-400 font-medium">Berdasarkan skor kepatuhan dan aktivitas</p>
                        </div>
                        <button className="text-sm font-bold bg-white/50 p-2 px-4 rounded-full text-black/60 hover:text-black">Lihat Semua</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.top_performers.slice(0, 4).map((user, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 bg-black/10 rounded-2xl border border-gray-50">
                                <div className="relative">
                                    <img
                                        src={user.profile_photo_path
                                            ? (user.profile_photo_path.startsWith('http')
                                                ? user.profile_photo_path
                                                : `http://127.0.0.1:8000/storage/${user.profile_photo_path}`)
                                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=random`}
                                        alt={user.full_name}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=random`;
                                        }}
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-400 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                                        {idx + 1}
                                    </div>
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="font-bold text-white truncate">{user.full_name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                                            {user.score} Poin
                                        </span>
                                        <span className="text-xs text-gray-400">{user.loans_count} Pinjam</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
