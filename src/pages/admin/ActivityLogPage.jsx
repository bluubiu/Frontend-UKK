import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import axios from '../../api/axios';
import { Search, History, Activity, Clock, ChevronDown, Filter, User, Globe, Laptop, X, Eye, ArrowRight } from 'lucide-react';

const ActivityLogPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('Semua');
    const [selectedLog, setSelectedLog] = useState(null);

    const tabs = [
        { name: 'Semua', count: logs.length },
        { name: 'Autentikasi', filter: ['Login', 'Register', 'Logout'] },
        { name: 'Peminjaman', filter: ['Loan Request', 'Approve Loan', 'Reject Loan'] },
        { name: 'Pengembalian', filter: ['Return Items', 'Verify Return'] },
        { name: 'Data', filter: ['Create User', 'Update User', 'Delete User', 'Create Category', 'Update Category', 'Delete Category', 'Create Item', 'Update Item', 'Delete Item'] },
        { name: 'Lainnya', filter: ['Fine Creation', 'Fine Payment', 'Fine Verification', 'Score Change', 'Waiting List Entry', 'Waiting List Cancellation', 'Waiting List Processing', 'Report Generation', 'Suspicious Activity'] }
    ];

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await axios.get('/activity-logs');
            console.log("Log aktivitas yang diterima:", response.data);
            setLogs(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Kesalahan saat mengambil log aktivitas:", error);
        } finally {
            setLoading(false);
        }
    };

    const timeAgo = (dateString) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffInMs = now - past;
        const diffInMins = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInMins < 1) return 'Baru saja';
        if (diffInMins < 60) return `${diffInMins} mnt lalu`;
        if (diffInHours < 24) return `${diffInHours} jam lalu`;
        if (diffInDays === 1) return 'Kemarin';
        return `${diffInDays} hari lalu`;
    };

    const formatTime = (dateString) => {
        return new Intl.DateTimeFormat('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    };

    const formatDateGroup = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Hari Ini';
        if (date.toDateString() === yesterday.toDateString()) return 'Kemarin';

        return new Intl.DateTimeFormat('id-ID', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).format(date);
    };

    const filteredLogs = useMemo(() => {
        if (!Array.isArray(logs)) return [];

        let result = logs.filter(log => {
            const searchLower = search.toLowerCase();
            const userName = (log.user?.full_name || '').toLowerCase();
            const action = (log.action || '').toLowerCase();
            const description = (log.description || '').toLowerCase();
            const ip = (log.ip_address || '').toLowerCase();

            return userName.includes(searchLower) ||
                action.includes(searchLower) ||
                description.includes(searchLower) ||
                ip.includes(searchLower);
        });

        const currentTab = tabs.find(t => t.name === activeTab);
        if (currentTab && currentTab.filter) {
            result = result.filter(log => currentTab.filter.includes(log.action));
        }

        return result;
    }, [logs, search, activeTab]);

    const groupedLogs = useMemo(() => {
        if (!Array.isArray(filteredLogs)) return [];

        const groups = {};
        filteredLogs.forEach(log => {
            if (!log.created_at) return;
            const dateKey = new Date(log.created_at).toDateString();
            if (!groups[dateKey]) {
                groups[dateKey] = {
                    label: formatDateGroup(log.created_at),
                    items: []
                };
            }
            groups[dateKey].items.push(log);
        });
        return Object.values(groups);
    }, [filteredLogs]);

    const getStatusBadgeColor = (action) => {
        const a = action.toLowerCase();
        if (a.includes('reject') || a.includes('delete') || a.includes('suspicious')) return 'text-red-600 bg-red-50 border-red-100';
        if (a.includes('approve') || a.includes('verify') || a.includes('accept')) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (a.includes('request') || a.includes('entry') || a.includes('generation')) return 'text-blue-600 bg-blue-50 border-blue-100';
        if (a.includes('score') || a.includes('fine')) return 'text-amber-600 bg-amber-50 border-amber-100';
        return 'text-gray-600 bg-gray-50 border-gray-100';
    };

    const parseBrowser = (ua) => {
        if (!ua) return 'Unknown Device';
        if (ua.includes('Chrome')) return 'Chrome Browser';
        if (ua.includes('Firefox')) return 'Firefox Browser';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari Browser';
        if (ua.includes('Edge')) return 'Edge Browser';
        return 'Web Browser';
    };

    const DetailModal = () => {
        if (!selectedLog) return null;

        return createPortal(
            <div className="fixed inset-0 w-full h-screen z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl h-[90vh] overflow-hidden animate-scale-up">
                    <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h3 className="text-xl font-extrabold text-gray-900">Detail Aktivitas</h3>
                            <p className="text-sm text-gray-500 font-medium">Audit Trail ID: #{selectedLog.id}</p>
                        </div>
                        <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm">
                            <X className="w-6 h-6 text-gray-400" />
                        </button>
                    </div>

                    <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                        {/* Summary Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Aksi</span>
                                <span className="font-bold text-blue-700">{selectedLog.action}</span>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Waktu</span>
                                <span className="font-bold text-gray-700">{new Date(selectedLog.created_at).toLocaleString('id-ID')}</span>
                            </div>
                        </div>

                        {/* Network/Device Info */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <Globe className="w-4 h-4 text-blue-500" /> Informasi Teknis
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Globe className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400">IP Address</span>
                                        <span className="text-xs font-bold text-gray-700">{selectedLog.ip_address || 'Unavailable'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl">
                                    <div className="p-2 bg-amber-50 rounded-lg">
                                        <Laptop className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400">User Agent</span>
                                        <span className="text-xs font-bold text-gray-700 truncate max-w-[150px]">{selectedLog.user_agent || 'Unknown'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Data Changes */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <Activity className="w-4 h-4 text-emerald-500" /> Data Snapshot
                            </h4>

                            {(!selectedLog.old_values && !selectedLog.new_values) ? (
                                <div className="p-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                    <p className="text-sm text-gray-400 font-bold italic">Tidak ada snapshot data untuk aktivitas ini.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Old Values */}
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                                            <ArrowRight className="w-3 h-3 rotate-180" /> Datanya Sebelum
                                        </span>
                                        <div className="bg-red-50/30 border border-red-100 rounded-3xl p-5 overflow-x-auto">
                                            {selectedLog.old_values ? (
                                                <pre className="text-[11px] font-mono text-gray-600 leading-relaxed">
                                                    {JSON.stringify(selectedLog.old_values, null, 2)}
                                                </pre>
                                            ) : (
                                                <p className="text-[11px] text-red-300 italic">N/A (Data Baru)</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* New Values */}
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                                            <ArrowRight className="w-3 h-3" /> Data Sesudah
                                        </span>
                                        <div className="bg-emerald-50/30 border border-emerald-100 rounded-3xl p-5 overflow-x-auto">
                                            {selectedLog.new_values ? (
                                                <pre className="text-[11px] font-mono text-emerald-900 leading-relaxed">
                                                    {JSON.stringify(selectedLog.new_values, null, 2)}
                                                </pre>
                                            ) : (
                                                <p className="text-[11px] text-emerald-300 italic">N/A (Data Dihapus)</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <button onClick={() => setSelectedLog(null)} className="px-8 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all">
                            Tutup
                        </button>
                    </div>
                </div>
            </div>,
            document.getElementById('modal-root')
        );
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-24">
            <DetailModal />

            {/* Header Section */}
            <div className="flex justify-between items-center px-2">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">Audit Trail & Log</h1>
                    <p className="text-gray-400 mt-1 font-medium italic">Monitoring aktivitas sistem dengan detail forensik.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchLogs} className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all shadow-sm group">
                        <History className="w-5 h-5 text-gray-400 group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                {/* Tabs Header */}
                <div className="flex border-b border-gray-100 px-8 bg-gray-50/50 overflow-x-auto scrollbar-hide">
                    {tabs.map(tab => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`px-6 py-6 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === tab.name ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab.name}
                            {tab.count !== undefined && <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{tab.count}</span>}
                            {activeTab === tab.name && (
                                <div className="absolute bottom-0 left-6 right-6 h-1 bg-blue-600 rounded-t-full"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search & Filter Bar */}
                <div className="p-8 border-b border-gray-100 flex gap-4 bg-white">
                    <div className="flex-1 relative group">
                        <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari berdasarkan aksi, user, deskripsi, atau IP Address..."
                            className="w-full pl-14 pr-4 py-4 rounded-[24px] bg-gray-50 focus:bg-white border-2 border-transparent focus:border-blue-500/10 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-sm font-semibold text-gray-700 placeholder:text-gray-300 shadow-inner"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Timeline Content */}
                <div className="p-8 md:p-12 space-y-12 bg-white/50">
                    {loading ? (
                        <div className="py-32 text-center">
                            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"></div>
                            <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">Menyusun Audit Trail...</p>
                        </div>
                    ) : groupedLogs.length === 0 ? (
                        <div className="py-32 text-center bg-gray-50/50 rounded-[48px] border-4 border-dotted border-gray-100">
                            <Activity className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                            <p className="text-gray-400 font-extrabold text-xl">Audit Log Kosong</p>
                            <p className="text-gray-400 text-sm mt-1 font-medium italic">Belum ada aktivitas yang tercatat untuk filter ini.</p>
                        </div>
                    ) : (
                        groupedLogs.map((group, gIndex) => (
                            <div key={group.label} className="space-y-8 animate-fade-in-up" style={{ animationDelay: `${gIndex * 100}ms` }}>
                                {/* Group Header */}
                                <div className="flex items-center gap-5 sticky top-0 z-10 py-2">
                                    <div className="h-0.5 flex-1 bg-gray-50"></div>
                                    <div className="flex items-center gap-3 px-6 py-2 bg-white border border-gray-100 rounded-full shadow-sm">
                                        <Clock className="w-4 h-4 text-blue-500" />
                                        <h3 className="text-[11px] font-black text-gray-400 tracking-[0.2em] uppercase">{group.label}</h3>
                                    </div>
                                    <div className="h-0.5 flex-1 bg-gray-50"></div>
                                </div>

                                {/* Items in Group */}
                                <div className="space-y-6">
                                    {group.items.map((log, lIndex) => (
                                        <div key={log.id} className="relative flex gap-8 md:gap-12 pl-4">
                                            {/* Vertical Line Connector */}
                                            {lIndex !== group.items.length - 1 && (
                                                <div className="absolute left-[24px] top-12 bottom-[-32px] w-0.5 bg-gradient-to-b from-gray-100 via-gray-50 to-transparent"></div>
                                            )}

                                            {/* Dot & Time */}
                                            <div className="flex flex-col items-center gap-2 w-20 shrink-0 pt-3">
                                                <div className={`w-3 h-3 rounded-full border-2 border-white shadow-[0_0_0_4px_rgba(59,130,246,0.1)] mb-4 ${log.action.toLowerCase().includes('suspicious') ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
                                                    }`}></div>
                                                <span className="text-[11px] font-black text-gray-600 whitespace-nowrap">{formatTime(log.created_at)}</span>
                                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">{timeAgo(log.created_at)}</span>
                                            </div>

                                            {/* Main Card */}
                                            <div className="flex-1 bg-white border border-gray-100 rounded-[32px] p-6 md:p-8 hover:shadow-2xl hover:shadow-gray-200/50 transition-all hover:-translate-y-1 group/card active:scale-[0.99]">
                                                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 shadow-inner border border-white flex items-center justify-center overflow-hidden shrink-0 ring-4 ring-gray-50">
                                                            {log.user?.profile_photo_path ? (
                                                                <img
                                                                    src={`http://127.0.0.1:8000/storage/${log.user.profile_photo_path}`}
                                                                    className="w-full h-full object-cover"
                                                                    alt=""
                                                                />
                                                            ) : (
                                                                <span className="text-blue-600 font-black text-xl">{log.user?.full_name?.charAt(0) || '?'}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="text-base font-black text-gray-900">{log.user?.full_name || 'System / Unidentified'}</span>
                                                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg border border-gray-100">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{log.user?.role?.name || 'System'}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4 mt-2">
                                                                <div className="flex items-center gap-1.5 text-gray-400">
                                                                    <Globe className="w-3.5 h-3.5" />
                                                                    <span className="text-[11px] font-bold">{log.ip_address || '0.0.0.0'}</span>
                                                                </div>
                                                                <div className="h-3 w-px bg-gray-100"></div>
                                                                <div className="flex items-center gap-1.5 text-gray-400">
                                                                    <Laptop className="w-3.5 h-3.5" />
                                                                    <span className="text-[11px] font-bold">{parseBrowser(log.user_agent)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={`px-5 py-2 rounded-2xl text-[10px] font-black border ${getStatusBadgeColor(log.action)} uppercase tracking-[0.15em] shadow-sm`}>
                                                        {log.action}
                                                    </div>
                                                </div>

                                                <div className="relative">
                                                    <div className="absolute -left-6 top-0 bottom-0 w-1 bg-blue-100 rounded-full opacity-50"></div>
                                                    <p className="text-sm text-gray-600 leading-relaxed font-bold bg-blue-50/20 p-5 rounded-[20px] border border-blue-50/50 italic">
                                                        "{log.description}"
                                                    </p>
                                                </div>

                                                <div className="mt-8 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-100">
                                                            <Activity className="w-3.5 h-3.5" />
                                                            <span className="text-[10px] font-black uppercase tracking-wider">Secured</span>
                                                        </div>
                                                        {log.old_values || log.new_values ? (
                                                            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl border border-amber-100">
                                                                <Eye className="w-3.5 h-3.5" />
                                                                <span className="text-[10px] font-black uppercase tracking-wider">Snapshot Available</span>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                    <button
                                                        onClick={() => setSelectedLog(log)}
                                                        className="group/btn flex items-center gap-2 px-6 py-2.5 bg-[#111827] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all hover:shadow-lg hover:shadow-blue-200"
                                                    >
                                                        Detail Audit
                                                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Global Styles for Animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes scale-up {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
                .animate-scale-up { animation: scale-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            ` }} />
        </div>
    );
};

export default ActivityLogPage;
