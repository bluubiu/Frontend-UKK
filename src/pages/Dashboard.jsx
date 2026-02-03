import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import {
    LayoutDashboard,
    Wallet,
    CreditCard,
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    CheckCircle2,
    XCircle,
    Bell,
    Package,
    History,
    FileText,
    User,
    TrendingUp,
    ChevronRight,
    Sparkles,
    Heart
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis } from 'recharts';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        user: {},
        active_loans: 0,
        active_items_count: 0,
        active_item_names: [],
        pending_returns: 0,
        total_fines: 0,
        compliance_score: 100,
        recent_activity: [],
        next_return_date: null,
        loan_status_counts: { approved: 0, returned: 0, rejected: 0, pending: 0 }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('/user/dashboard/stats');
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching user stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatRupiah = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Soft & Harmonious Chart Colors
    const dataChart = [
        { name: 'Aktif', value: stats.loan_status_counts?.approved || 0, color: '#34D399' },
        { name: 'Selesai', value: stats.loan_status_counts?.returned || 0, color: '#A7F3D0' },
        { name: 'Menunggu', value: stats.loan_status_counts?.pending || 0, color: '#E0F2FE' },
        { name: 'Ditolak', value: stats.loan_status_counts?.rejected || 0, color: '#FDA4AF' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto ">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 ">
                {/* Main Content Column (Span 2) */}
                <div className="xl:col-span-2 space-y-8 ">

                    {/* Banner Card */}
                    <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-emerald-600 to-emerald-500 p-8 md:p-10 text-white shadow-xl shadow-indigo-200">
                        <div className="relative z-10 max-w-xl">
                            <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wider mb-4 border border-white/10">
                                SISTEM PEMINJAMAN
                            </span>
                            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
                                Platform peminjaman  <br /> alat UKS
                            </h2>
                            <p className="text-indigo-100 mb-8 max-w-md text-sm md:text-base leading-relaxed">
                                alat UKS berbasis web yang dirancang agar proses pengajuan lebih cepat, data lebih rapi, dan penggunaan lebih nyaman.
                            </p>
                            <button
                                onClick={() => navigate('/items')}
                                className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-full font-bold transition-transform hover:scale-105 flex items-center gap-2 group text-sm"
                            >
                                Lihat Katalog
                                <div className="bg-white rounded-full p-1 text-gray-900 group-hover:translate-x-1 transition-transform">
                                    <ChevronRight size={14} strokeWidth={3} />
                                </div>
                            </button>
                        </div>

                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none mix-blend-overlay"></div>
                        <div className="absolute bottom-0 right-20 w-64 h-64 bg-emerald-400/30 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute right-0 bottom-0 opacity-20 transform translate-y-10 translate-x-10">
                            <Sparkles size={200} />
                        </div>
                    </div>

                    {/* Stats Cards Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            {
                                label: 'Peminjaman Aktif',
                                value: stats.active_loans,
                                total: 'Item',
                                icon: Package,
                                color: 'bg-indigo-50 text-indigo-600',
                            },
                            {
                                label: 'Menunggu Kembali',
                                value: stats.pending_returns,
                                total: 'Aksi',
                                icon: Clock,
                                color: 'bg-rose-50 text-rose-600',
                            },
                            {
                                label: 'Selesai',
                                value: stats.loan_status_counts?.returned || 0,
                                total: 'Riwayat',
                                icon: CheckCircle2,
                                color: 'bg-emerald-50 text-emerald-600',
                            }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-all group flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                                    <item.icon size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-2xl font-black text-gray-900">{item.value}</span>
                                        <button className="text-gray-300 hover:text-gray-500"><ChevronRight size={14} /></button>
                                    </div>
                                    <h4 className="font-bold text-gray-400 text-xs uppercase tracking-wider">{item.label}</h4>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Active Loans Section */}
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Peminjaman Aktif</h3>
                            <div className="flex gap-2">
                                <button onClick={() => navigate('/my-loans')} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                                    <ArrowDownLeft size={16} />
                                </button>
                                <button className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-black transition-colors">
                                    <ArrowUpRight size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {stats.recent_activity.slice(0, 3).map((loan, idx) => (
                                <div key={idx} className="bg-white rounded-[24px] p-4 border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-100 transition-all cursor-pointer group flex flex-col h-full" onClick={() => navigate('/my-loans')}>
                                    {/* Large Image Area */}
                                    <div className="h-32 w-full bg-gray-100 rounded-[20px] mb-4 overflow-hidden relative group-hover:bg-emerald-50 transition-colors">
                                        {loan.items && loan.items[0]?.image ? (
                                            <img src={`http://127.0.0.1:8000/storage/${loan.items[0].image}`} className="w-full h-full object-cover" alt={loan.items[0].name} />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-300">
                                                <Package size={32} />
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-full text-gray-400 hover:text-red-500 transition-colors">
                                            <Heart size={14} />
                                        </div>
                                        <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 backdrop-blur rounded-lg text-white text-[10px] font-bold uppercase">
                                            {loan.status}
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">DIPINJAM</span>
                                        </div>
                                        <h4 className="font-bold text-gray-900 text-base mb-1 line-clamp-2">
                                            {loan.items && loan.items.length > 0 ? loan.items[0].name : 'Item Tidak Dikenal'}
                                        </h4>
                                        <p className="text-xs text-gray-400 mb-4">
                                            Jatuh Tempo: {formatDate(loan.return_date)}
                                        </p>
                                    </div>

                                    {/* Footer / Lender Info */}
                                    <div className="flex items-center gap-2 pt-3 border-t border-gray-50 mt-auto">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                                            {/* Lender Avatar Placeholder */}
                                            <img src={`https://ui-avatars.com/api/?name=Admin&background=random`} alt="Lender" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-500">Petugas Lab</span>
                                    </div>
                                </div>
                            ))}
                            {/* Fallback if no loans */}
                            {stats.recent_activity.length === 0 && (
                                <div className="col-span-3 py-10 text-center border-2 border-dashed border-gray-200 rounded-[24px]">
                                    <p className="text-gray-400 font-bold">Tidak ada peminjaman aktif saat ini.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar Column (Span 1) */}
                <div className="space-y-6">

                    {/* Widget 1: Most Day Active (Area Chart - Pulse Style) */}
                    <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Aktivitas Harian</h3>
                                <p className="text-xs text-gray-400 font-medium">Tren peminjaman 7 hari terakhir</p>
                            </div>
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                            </div>
                        </div>

                        <div className="h-40 w-full relative">
                            {stats.loan_trends && stats.loan_trends.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={stats.loan_trends}
                                        margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#44ef86ff" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#44ef86ff" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <RechartsTooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            cursor={{ stroke: '#b4fca5ff', strokeWidth: 1, strokeDasharray: '4 4' }}
                                        />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(str) => str ? str.substring(0, 3) : ''}
                                            tick={{ fontSize: 10, fill: '#9ca3af' }}
                                            axisLine={false}
                                            tickLine={false}
                                            dy={10}
                                        />
                                        <YAxis hide domain={[0, 'auto']} />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#47da42ff"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorCount)"
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 font-medium text-sm animate-pulse">Belum ada data</div>
                            )}
                        </div>
                    </div>

                    {/* Widget 2: Compliance Score (Gauge Style) */}
                    <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-gray-900 text-lg">Skor Kepatuhan</h3>
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                            </div>
                        </div>

                        <div className="relative flex flex-col items-center justify-center pt-4 pb-2">
                            {/* Semicircle Gauge */}
                            <div className="relative w-48 h-24 overflow-hidden mb-4">
                                <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[14px] border-slate-100 box-border"></div>
                                <div
                                    className="absolute top-0 left-0 w-48 h-48 rounded-full border-[14px] border-emerald-500 box-border transition-transform duration-1000 ease-out origin-center"
                                    style={{
                                        clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)',
                                        transform: `rotate(${(stats.compliance_score / 100) * 180 - 180}deg)`
                                    }}
                                ></div>
                            </div>

                            {/* Score Display (Centered) */}
                            <div className="absolute top-14 flex flex-col items-center">
                                <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{stats.compliance_score}%</span>
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md mt-1
                                    ${stats.compliance_score >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}
                                `}>
                                    {stats.compliance_score >= 80 ? 'Sangat Baik' : stats.compliance_score >= 50 ? 'Cukup' : 'Perlu Perhatian'}
                                </span>
                            </div>
                        </div>

                        <div className="text-center mt-2">
                            <p className="text-gray-400 text-xs mb-4">Pertahankan skor Anda tetap tinggi!</p>
                        </div>
                    </div>

                    {/* Widget 3: Replaced "Profile" with "Next Return / Fines" */}
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[32px] p-6 text-white shadow-lg shadow-indigo-200 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Clock size={20} className="text-white" />
                            </div>
                            <h4 className="font-bold text-indigo-100 text-sm">Jadwal Pengembalian</h4>
                        </div>

                        <div className="relative z-10">
                            {stats.next_return_date ? (
                                <div>
                                    <p className="text-indigo-200 text-xs mb-1">Jatuh tempo berikutnya</p>
                                    <h3 className="text-2xl font-extrabold mb-1">
                                        {formatDate(stats.next_return_date)}
                                    </h3>
                                    <p className="text-[10px] bg-emerald-500/50 inline-block px-2 py-1 rounded-lg border border-emerald-400/30">
                                        Pastikan kembali tepat waktu
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <h3 className="text-xl font-bold mb-1">Tidak Ada Tanggungan</h3>
                                    <p className="text-indigo-200 text-xs">Anda bebas dari jadwal pengembalian.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;
