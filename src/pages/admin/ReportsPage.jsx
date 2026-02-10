import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
    LayoutDashboard,
    ArrowLeftRight,
    Banknote,
    Trophy,
    Wrench,
    TrendingUp,
    Clock,
    CheckCircle2,
    XCircle,
    User,
    Mail,
    AlertCircle,
    Package,
    Calendar,
    Search,
    Filter,
    Printer
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const ReportsPage = () => {
    const [activeTab, setActiveTab] = useState('loans');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const { showToast } = useNotification();

    useEffect(() => {
        fetchReport();
    }, [activeTab]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/reports/${activeTab === 'items' ? 'items-condition' : activeTab}`);
            setReportData(response.data);
        } catch (error) {
            console.error("Error fetching report:", error);
            showToast('Gagal mengambil data laporan', 'error');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getTrendData = () => {
        if (!reportData?.data) return [];

        // Aggregate loans by date
        const aggregated = reportData.data.reduce((acc, item) => {
            // Use loan_date (YYYY-MM-DD)
            const dateStr = item.loan_date ? item.loan_date.split('T')[0] : '';
            if (!dateStr) return acc;

            if (!acc[dateStr]) {
                acc[dateStr] = 0;
            }
            acc[dateStr] += 1; // Count number of loans
            return acc;
        }, {});

        // Convert to array and sort by date ascending
        const sortedData = Object.keys(aggregated)
            .sort() // Lexicographical sort works for YYYY-MM-DD
            .map(dateKey => {
                const date = new Date(dateKey);
                return {
                    name: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                    value: aggregated[dateKey],
                    fullDate: date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                };
            });

        // Take the last 14 days of data to keep chart clean, or all if less
        return sortedData.length > 14 ? sortedData.slice(sortedData.length - 14) : sortedData;
    };

    const COLORS = ['#10B981', '#F59E0B', '#EF4444']; // Emerald, Amber, Red

    const tabs = [
        { id: 'loans', label: 'Peminjaman', icon: LayoutDashboard },
        { id: 'returns', label: 'Pengembalian', icon: ArrowLeftRight },
        { id: 'fines', label: 'Denda', icon: Banknote },
        { id: 'scores', label: 'Skor Kepatuhan', icon: Trophy },
        { id: 'items', label: 'Kondisi Barang', icon: Wrench }
    ];

    const StatCard = ({ title, value, subtext, icon: Icon, colorClass, bgClass }) => (
        <div className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${bgClass}`}>
                    <Icon className={`w-6 h-6 ${colorClass}`} />
                </div>
                {subtext && (
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${bgClass} ${colorClass}`}>
                        {subtext}
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 scrol">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analitik & Laporan</h1>
                    <p className="text-gray-500 mt-1 text-sm">Pantau kinerja sistem dan aktivitas operasional UKS</p>
                </div>

                <div className="bg-gray-100/50 p-1.5 rounded-xl inline-flex overflow-x-auto max-w-full scrollbar-hide">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${isActive
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={() => {
                        const iframe = document.createElement('iframe');
                        iframe.style.display = 'none';
                        iframe.src = `/admin/reports/print?tab=${activeTab}`;
                        document.body.appendChild(iframe);
                        setTimeout(() => document.body.removeChild(iframe), 60000);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-emerald-600 transition-all shadow-sm h-[42px]"
                >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Cetak Laporan</span>
                </button>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center bg-white rounded-[24px] border border-gray-100">
                    <div className="text-gray-400 flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-medium">Memuat data...</span>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in-up">
                    {activeTab === 'loans' && reportData && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard
                                    title="Total Peminjaman"
                                    value={reportData.total}
                                    icon={LayoutDashboard}
                                    colorClass="text-blue-600"
                                    bgClass="bg-blue-50"
                                    subtext="Aktif"
                                />
                                <StatCard
                                    title="Menunggu Persetujuan"
                                    value={reportData.summary.pending}
                                    icon={Clock}
                                    colorClass="text-amber-600"
                                    bgClass="bg-amber-50"
                                    subtext="Perlu Tindakan"
                                />
                                <StatCard
                                    title="Peminjaman Aktif"
                                    value={reportData.summary.approved}
                                    icon={CheckCircle2}
                                    colorClass="text-emerald-600"
                                    bgClass="bg-emerald-50"
                                />
                                <StatCard
                                    title="Ditolak"
                                    value={reportData.summary.rejected}
                                    icon={XCircle}
                                    colorClass="text-red-600"
                                    bgClass="bg-red-50"
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="font-bold text-gray-800">Frekuensi Peminjaman</h3>
                                            <p className="text-sm text-gray-400 mt-1">Ikhtisar volume peminjaman dari waktu ke waktu</p>
                                        </div>
                                        <div className="p-2 bg-gray-50 rounded-lg">
                                            <TrendingUp className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={getTrendData()}>
                                                <defs>
                                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#FFFFFF',
                                                        border: '1px solid #F3F4F6',
                                                        borderRadius: '12px',
                                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="value"
                                                    stroke="#10B981"
                                                    strokeWidth={3}
                                                    fillOpacity={1}
                                                    fill="url(#colorGradient)"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col">
                                    <h3 className="font-bold text-gray-800 mb-6">Rincian Status</h3>
                                    <div className="h-[250px] relative w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'Disetujui', value: reportData.summary.approved },
                                                        { name: 'Menunggu', value: reportData.summary.pending },
                                                        { name: 'Ditolak', value: reportData.summary.rejected }
                                                    ]}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={80}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    cornerRadius={6}
                                                >
                                                    {['#10B981', '#F59E0B', '#EF4444'].map((color, index) => (
                                                        <Cell key={`cell-${index}`} fill={color} strokeWidth={0} />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="text-3xl font-bold text-gray-900">{reportData.total}</span>
                                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total</span>
                                        </div>
                                    </div>
                                    <div className="mt-6 space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                                <span className="text-gray-600">Disetujui</span>
                                            </div>
                                            <span className="font-bold text-gray-900">{reportData.summary.approved}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                                <span className="text-gray-600">Menunggu</span>
                                            </div>
                                            <span className="font-bold text-gray-900">{reportData.summary.pending}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                                <span className="text-gray-600">Ditolak</span>
                                            </div>
                                            <span className="font-bold text-gray-900">{reportData.summary.rejected}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'fines' && reportData && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Total Denda Dibayar"
                                value={formatCurrency(reportData.summary.paid)}
                                icon={Banknote}
                                colorClass="text-emerald-600"
                                bgClass="bg-emerald-50"
                            />
                            <StatCard
                                title="Denda Belum Dibayar"
                                value={formatCurrency(reportData.summary.unpaid)}
                                icon={AlertCircle}
                                colorClass="text-red-600"
                                bgClass="bg-red-50"
                            />
                            <StatCard
                                title="Pembayaran Tertunda"
                                value={reportData.summary.count_unpaid}
                                icon={Clock}
                                colorClass="text-amber-600"
                                bgClass="bg-amber-50"
                                subtext="Transaksi"
                            />
                            <StatCard
                                title="Total Diterbitkan"
                                value={formatCurrency(reportData.summary.total_fines)}
                                icon={LayoutDashboard}
                                colorClass="text-blue-600"
                                bgClass="bg-blue-50"
                            />
                        </div>
                    )}

                    {activeTab === 'scores' && reportData && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Rata-rata Skor"
                                value={reportData.summary.average_score}
                                icon={Trophy}
                                colorClass="text-purple-600"
                                bgClass="bg-purple-50"
                            />
                            <StatCard
                                title="Skor Tertinggi"
                                value={reportData.summary.highest_score}
                                icon={TrendingUp}
                                colorClass="text-emerald-600"
                                bgClass="bg-emerald-50"
                            />
                            <StatCard
                                title="Risiko Tinggi (<50)"
                                value={reportData.summary.below_50}
                                icon={AlertCircle}
                                colorClass="text-red-600"
                                bgClass="bg-red-50"
                                subtext="Pengguna"
                            />
                        </div>
                    )}

                    {activeTab === 'items' && reportData && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Kondisi Baik"
                                value={reportData.summary.baik}
                                icon={CheckCircle2}
                                colorClass="text-emerald-600"
                                bgClass="bg-emerald-50"
                            />
                            <StatCard
                                title="Rusak Ringan"
                                value={reportData.summary.rusak_ringan}
                                icon={Wrench}
                                colorClass="text-amber-600"
                                bgClass="bg-amber-50"
                            />
                            <StatCard
                                title="Rusak Berat"
                                value={reportData.summary.rusak_berat}
                                icon={XCircle}
                                colorClass="text-red-600"
                                bgClass="bg-red-50"
                            />
                            <StatCard
                                title="Sedang Dipinjam"
                                value={reportData.summary.borrowed_stock}
                                icon={Package}
                                colorClass="text-blue-600"
                                bgClass="bg-blue-50"
                            />
                        </div>
                    )}

                    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <LayoutDashboard className="w-5 h-5 text-gray-400" />
                                Rekaman Terbaru
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        {activeTab === 'loans' && (
                                            <>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Detail Peminjaman</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Jumlah</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            </>
                                        )}
                                        {activeTab === 'returns' && (
                                            <>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Peminjam</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tgl Kembali</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kondisi</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Denda</th>
                                            </>
                                        )}
                                        {activeTab === 'scores' && (
                                            <>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pengguna</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Skor</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            </>
                                        )}
                                        {activeTab === 'items' && (
                                            <>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Barang</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kondisi</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stok</th>
                                            </>
                                        )}
                                        {activeTab === 'fines' && (
                                            <>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Peminjam</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Jumlah</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {reportData?.data?.slice(0, 8).map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                            {activeTab === 'loans' && (
                                                <>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                                                                #{item.id}
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-gray-900">{item.user?.full_name}</div>
                                                                <div className="text-xs text-gray-400">{item.user?.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Calendar className="w-4 h-4 text-gray-400" />
                                                            {formatDate(item.loan_date)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {item.details?.length || 0} Barang
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${item.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                            item.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100'
                                                            }`}>
                                                            {item.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                                                            {item.status === 'pending' && <Clock className="w-3 h-3" />}
                                                            {item.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                                            {item.status === 'approved' ? 'DISETUJUI' : item.status === 'pending' ? 'MENUNGGU' : 'DITOLAK'}
                                                        </span>
                                                    </td>
                                                </>
                                            )}
                                            {activeTab === 'returns' && (
                                                <>
                                                    <td className="px-6 py-4 font-medium text-gray-900">{item.loan?.user?.full_name || '-'}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(item.return_date)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-xs px-2 py-1 rounded-md font-bold uppercase ${item.condition === 'baik' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                            {item.condition}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-gray-900">
                                                        {item.fine ? formatCurrency(item.fine.total_fine) : '-'}
                                                    </td>
                                                </>
                                            )}
                                            {activeTab === 'scores' && (
                                                <>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                                {(item.name || 'U').charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-gray-900">{item.name || 'Tanpa Nama'}</div>
                                                                <div className="text-xs text-gray-400">{item.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="w-full max-w-[100px] h-2 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${item.score >= 80 ? 'bg-emerald-500' :
                                                                    item.score >= 50 ? 'bg-blue-500' : 'bg-red-500'
                                                                    }`}
                                                                style={{ width: `${item.score}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs font-semibold mt-1 block">{item.score}/100</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-xs px-2 py-1 rounded-md font-medium ${item.is_active ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {item.is_active ? 'Aktif' : 'Nonaktif'}
                                                        </span>
                                                    </td>
                                                </>
                                            )}
                                            {activeTab === 'items' && (
                                                <>
                                                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{item.category?.name || '-'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold uppercase ${item.condition === 'baik' ? 'bg-emerald-50 text-emerald-700' :
                                                            item.condition === 'rusak ringan' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                                                            }`}>
                                                            {item.condition}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                                                        {item.available_stock} <span className="text-gray-400 font-normal">/ {item.stock}</span>
                                                    </td>
                                                </>
                                            )}
                                            {activeTab === 'fines' && (
                                                <>
                                                    <td className="px-6 py-4 font-medium text-gray-900">{item.return_model?.loan?.user?.full_name || '-'}</td>
                                                    <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(item.total_fine)}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(item.created_at)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${item.is_paid ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                                            }`}>
                                                            {item.is_paid ? 'LUNAS' : 'BELUM BAYAR'}
                                                        </span>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                    {reportData?.data?.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Package className="w-10 h-10 opacity-20" />
                                                    <span className="text-sm">Tidak ada rekaman ditemukan</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
