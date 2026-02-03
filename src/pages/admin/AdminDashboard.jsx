import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
    Filter
} from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        total_items: 0,
        active_loans: 0,
        returned_today: 0,
        pending_returns: 0,
        recent_loans: [],
        loan_trends: [],
        top_items: [],
        top_performers: []
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

    if (loading) {
        return <div className="p-8 flex justify-center text-gray-500 font-medium animate-pulse">Loading dashboard data...</div>;
    }

    const summaryColors = [
        { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-400' },
        { bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-400' },
        { bg: 'bg-pink-50', text: 'text-pink-600', dot: 'bg-pink-400' },
        { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-400' },
        { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400' },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Title Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Ringkasan Sistem</h1>
                    <p className="text-gray-500 mt-1 font-medium">Memantau inventaris UKS dan kepatuhan secara real-time.</p>
                </div>
                <button className="bg-gray-900 text-white px-5 py-3 rounded-2xl text-sm font-bold hover:bg-black transition-all flex items-center gap-2 shadow-xl shadow-gray-100">
                    <Plus className="w-4 h-4" />
                    Tambah Alat
                </button>
            </div>

            {/* Stats Cards - Updated Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Inventaris', value: stats.total_items, color: 'bg-emerald-600', icon: Package, trend: 'Semua Alat' },
                    { label: 'Peminjaman Aktif', value: stats.active_loans, color: 'bg-white', text: 'text-gray-900', icon: Clock, trend: 'Saat Ini' },
                    { label: 'Kembali Hari Ini', value: stats.returned_today, color: 'bg-white', text: 'text-gray-900', icon: CheckCircle2, trend: 'Terbaru' },
                    { label: 'Perlu Tindakan', value: stats.pending_returns, color: 'bg-white', text: 'text-gray-900', icon: AlertCircle, trend: 'Terlambat/Denda' },
                ].map((item, i) => (
                    <div key={i} className={`${item.color} ${item.text || 'text-white'} rounded-[32px] p-6 shadow-sm border ${item.color === 'bg-white' ? 'border-gray-100' : 'border-emerald-600'} hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group`}>
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`${item.color === 'bg-white' ? 'bg-gray-50 text-gray-400' : 'bg-white/20 text-white'} p-3 rounded-2xl`}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${item.color === 'bg-white' ? 'bg-emerald-50 text-emerald-600' : 'bg-white/30 text-white'}`}>
                                    {item.trend}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-4xl font-extrabold mb-1">{item.value}</h3>
                                <p className={`text-sm font-medium ${item.color === 'bg-white' ? 'text-gray-400' : 'text-emerald-100'}`}>
                                    {item.label}
                                </p>
                            </div>
                        </div>
                        {item.color === 'bg-emerald-600' && (
                            <div className="absolute -right-6 -bottom-6 w-24 h-24 border-[16px] border-white/10 rounded-full"></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Loan Analytics (Area Chart) */}
                <div className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Intensitas Peminjaman</h3>
                            <p className="text-sm text-gray-400 font-medium">Tren aktivitas selama 7 hari terakhir</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.loan_trends}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1C1F2B', color: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: '#fff', fontWeight: 700 }}
                                    cursor={{ stroke: '#10B981', strokeWidth: 2 }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Summary Section (New Visual from Image) */}
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold text-gray-900">Paling Sering Dipinjam</h3>
                        <MoreHorizontal className="w-5 h-5 text-gray-300" />
                    </div>

                    <div className="space-y-4">
                        {stats.top_items.length > 0 ? (
                            stats.top_items.map((item, idx) => {
                                const color = summaryColors[idx % summaryColors.length];
                                return (
                                    <div key={idx} className={`${color.bg} ${color.text} flex items-center justify-between p-4 rounded-2xl transition-all hover:scale-[1.02]`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${color.dot} ring-4 ring-white`}></div>
                                            <span className="font-bold text-sm truncate max-w-[120px]">{item.name}</span>
                                        </div>
                                        <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-xl text-xs font-black shadow-sm">
                                            {item.loans_count.toLocaleString()}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-10 text-gray-300 font-medium italic">Belum ada data peminjaman</div>
                        )}

                        {/* Placeholder items if data is short to match image aesthetic */}
                        {stats.top_items.length < 4 && Array(4 - stats.top_items.length).fill(0).map((_, i) => (
                            <div key={`p-${i}`} className="bg-gray-50 flex items-center justify-between p-4 rounded-2xl opacity-40 grayscale italic">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-gray-300 ring-4 ring-white"></div>
                                    <span className="font-bold text-sm text-gray-400">Reserved Space</span>
                                </div>
                                <div className="bg-white px-3 py-1 rounded-xl text-xs font-black">
                                    0
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Performers Section (New Requested Section) */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-200">
                            <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Pengguna Terbaik</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Berdasarkan Skor Kepatuhan</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari pengguna..."
                                className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-48 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 border-b border-gray-50">
                                <th className="px-8 py-5">Peringkat</th>
                                <th className="px-8 py-5">Peminjam</th>
                                <th className="px-8 py-5">Total Pinjam</th>
                                <th className="px-8 py-5 text-right">Skor Kepatuhan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {stats.top_performers?.length > 0 ? (
                                stats.top_performers.map((user, idx) => (
                                    <tr key={idx} className="group hover:bg-gray-50/80 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${idx === 0 ? 'bg-amber-100 text-amber-600' :
                                                idx === 1 ? 'bg-gray-100 text-gray-600' :
                                                    idx === 2 ? 'bg-orange-100 text-orange-600' :
                                                        'text-gray-400'
                                                }`}>
                                                {idx + 1}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-gray-100 flex-shrink-0 flex items-center justify-center font-bold text-emerald-600 overflow-hidden border border-white">
                                                    <div className="h-9 w-9 rounded-full bg-gray-100 overflow-hidden border border-gray-100 shrink-0">
                                                        <img
                                                            src={user.profile_photo_path
                                                                ? (user.profile_photo_path.startsWith('http')
                                                                    ? user.profile_photo_path
                                                                    : `http://127.0.0.1:8000/storage/${user.profile_photo_path}`)
                                                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=random`}
                                                            alt={user.full_name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=random`;
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{user.full_name}</p>
                                                    <p className="text-xs text-gray-400 font-medium">@{user.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                                <Package className="w-4 h-4 text-gray-300" />
                                                <span>{user.loans_count} Pinjaman</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="inline-flex items-center gap-3">
                                                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${Math.min((user.score / 120) * 100, 100)}%` }}></div>
                                                </div>
                                                <span className="font-black text-emerald-600 text-sm">{user.score}</span>
                                                <ArrowUpRight className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-all -translate-y-1" />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-10 text-center text-gray-400 font-medium italic">Tidak ada pengguna aktif.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-gray-50/30 text-center border-t border-gray-50">
                    <button className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-emerald-600 transition-colors">
                        Lihat Peringkat Lengkap
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
