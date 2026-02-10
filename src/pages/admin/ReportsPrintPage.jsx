import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../../api/axios';
import { Loader2 } from 'lucide-react';

const ReportsPrintPage = () => {
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'loans';
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await axios.get(`/reports/${activeTab === 'items' ? 'items-condition' : activeTab}`);
                setReportData(response.data);
                document.title = `Laporan_${activeTab}_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}`;
            } catch (error) {
                console.error("Error fetching report:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [activeTab]);

    useEffect(() => {
        if (!loading && reportData) {
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [loading, reportData]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    const getTitle = () => {
        switch (activeTab) {
            case 'loans': return 'Laporan Peminjaman';
            case 'returns': return 'Laporan Pengembalian';
            case 'fines': return 'Laporan Denda';
            case 'scores': return 'Laporan Skor Kepatuhan';
            case 'items': return 'Laporan Kondisi Barang';
            default: return 'Laporan';
        }
    };

    return (
        <div className="bg-white p-8 max-w-[210mm] mx-auto print:p-0 font-serif text-sm">
            {/* Header */}
            <div className="text-center border-b-2 border-black mb-6 pb-4">
                <h1 className="text-2xl font-bold uppercase">{getTitle()} <br /> UKS Sekolah</h1>
                <h2 className="text-m font-bold">MediUKS</h2>
                <p className="text-sm mt-2">Jl, Ngadiluwih, Kedungpedaringan, Kec. Kepanjen, <br /> Kabupaten Malang, Jawa Timur 65163</p>
                <p className="text-xs mt-4 text-center italic font-medium tracking-wider">
                    Dicetak pada: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>

            {/* Summary Section */}
            {reportData && reportData.summary && (
                <div className="mb-8 p-4 border border-gray-300 rounded">
                    <h3 className="font-bold border-b border-gray-300 mb-2 pb-1">Ringkasan</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {activeTab === 'loans' && (
                            <>
                                <div>Total Peminjaman: {reportData.total}</div>
                                <div>Disetujui: {reportData.summary.approved}</div>
                                <div>Menunggu: {reportData.summary.pending}</div>
                                <div>Ditolak: {reportData.summary.rejected}</div>
                            </>
                        )}
                        {activeTab === 'fines' && (
                            <>
                                <div>Total Denda Dibayar: {formatCurrency(reportData.summary.paid)}</div>
                                <div>Denda Belum Dibayar: {formatCurrency(reportData.summary.unpaid)}</div>
                                <div>Total Diterbitkan: {formatCurrency(reportData.summary.total_fines)}</div>
                            </>
                        )}
                        {activeTab === 'scores' && (
                            <>
                                <div>Rata-rata Skor: {reportData.summary.average_score}</div>
                                <div>Skor Tertinggi: {reportData.summary.highest_score}</div>
                                <div>Risiko Tinggi ({'<'}50): {reportData.summary.below_50}</div>
                            </>
                        )}
                        {activeTab === 'items' && (
                            <>
                                <div>Kondisi Baik: {reportData.summary.baik}</div>
                                <div>Rusak Ringan: {reportData.summary.rusak_ringan}</div>
                                <div>Rusak Berat: {reportData.summary.rusak_berat}</div>
                                <div>Sedang Dipinjam: {reportData.summary.borrowed_stock}</div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Data Table */}
            <h3 className="font-bold border-b border-black mb-2 pb-1 mt-6">Rincian Data</h3>
            <table className="w-full border-collapse border border-black text-xs">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-black px-2 py-1 text-center w-10">No</th>
                        {activeTab === 'loans' && (
                            <>
                                <th className="border border-black px-2 py-1 text-left">Peminjam</th>
                                <th className="border border-black px-2 py-1 text-left">Detail</th>
                                <th className="border border-black px-2 py-1 text-left">Tanggal</th>
                                <th className="border border-black px-2 py-1 text-center">Status</th>
                            </>
                        )}
                        {activeTab === 'returns' && (
                            <>
                                <th className="border border-black px-2 py-1 text-left">Peminjam</th>
                                <th className="border border-black px-2 py-1 text-left">Tgl Kembali</th>
                                <th className="border border-black px-2 py-1 text-center">Kondisi</th>
                                <th className="border border-black px-2 py-1 text-right">Denda</th>
                            </>
                        )}
                        {activeTab === 'scores' && (
                            <>
                                <th className="border border-black px-2 py-1 text-left">Pengguna</th>
                                <th className="border border-black px-2 py-1 text-left">Email</th>
                                <th className="border border-black px-2 py-1 text-center">Skor</th>
                                <th className="border border-black px-2 py-1 text-center">Status</th>
                            </>
                        )}
                        {activeTab === 'items' && (
                            <>
                                <th className="border border-black px-2 py-1 text-left">Nama Barang</th>
                                <th className="border border-black px-2 py-1 text-left">Kategori</th>
                                <th className="border border-black px-2 py-1 text-center">Kondisi</th>
                                <th className="border border-black px-2 py-1 text-center">Stok</th>
                            </>
                        )}
                        {activeTab === 'fines' && (
                            <>
                                <th className="border border-black px-2 py-1 text-left">Peminjam</th>
                                <th className="border border-black px-2 py-1 text-right">Jumlah</th>
                                <th className="border border-black px-2 py-1 text-left">Tanggal</th>
                                <th className="border border-black px-2 py-1 text-center">Status</th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {reportData?.data?.map((item, index) => (
                        <tr key={index}>
                            <td className="border border-black px-2 py-1 text-center">{index + 1}</td>

                            {activeTab === 'loans' && (
                                <>
                                    <td className="border border-black px-2 py-1">
                                        <div className="font-semibold">{item.user?.full_name}</div>
                                        <div className="text-[10px] text-gray-500">{item.user?.email}</div>
                                    </td>
                                    <td className="border border-black px-2 py-1">
                                        {item.details?.length || 0} Barang
                                    </td>
                                    <td className="border border-black px-2 py-1">
                                        {formatDate(item.loan_date)}
                                    </td>
                                    <td className="border border-black px-2 py-1 text-center uppercase font-bold">
                                        {item.status === 'approved' ? 'Disetujui' : item.status === 'pending' ? 'Menunggu' : item.status}
                                    </td>
                                </>
                            )}
                            {activeTab === 'returns' && (
                                <>
                                    <td className="border border-black px-2 py-1">{item.loan?.user?.full_name || '-'}</td>
                                    <td className="border border-black px-2 py-1">{formatDate(item.return_date)}</td>
                                    <td className="border border-black px-2 py-1 text-center uppercase">{item.condition}</td>
                                    <td className="border border-black px-2 py-1 text-right">{item.fine ? formatCurrency(item.fine.total_fine) : '-'}</td>
                                </>
                            )}
                            {activeTab === 'scores' && (
                                <>
                                    <td className="border border-black px-2 py-1">{item.name || 'Tanpa Nama'}</td>
                                    <td className="border border-black px-2 py-1">{item.email}</td>
                                    <td className="border border-black px-2 py-1 text-center font-bold">{item.score}</td>
                                    <td className="border border-black px-2 py-1 text-center">{item.is_active ? 'Aktif' : 'Nonaktif'}</td>
                                </>
                            )}
                            {activeTab === 'items' && (
                                <>
                                    <td className="border border-black px-2 py-1">{item.name}</td>
                                    <td className="border border-black px-2 py-1">{item.category?.name || '-'}</td>
                                    <td className="border border-black px-2 py-1 text-center uppercase">{item.condition}</td>
                                    <td className="border border-black px-2 py-1 text-center">{item.available_stock} / {item.stock}</td>
                                </>
                            )}
                            {activeTab === 'fines' && (
                                <>
                                    <td className="border border-black px-2 py-1">{item.return_model?.loan?.user?.full_name || '-'}</td>
                                    <td className="border border-black px-2 py-1 text-right font-bold">{formatCurrency(item.total_fine)}</td>
                                    <td className="border border-black px-2 py-1">{formatDate(item.created_at)}</td>
                                    <td className="border border-black px-2 py-1 text-center font-bold">
                                        {item.is_paid ? 'LUNAS' : 'BELUM BAYAR'}
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                    {(!reportData?.data || reportData.data.length === 0) && (
                        <tr>
                            <td colSpan="5" className="border border-black px-2 py-4 text-center italic text-gray-500">
                                Tidak ada data.
                            </td>
                        </tr>
                    )}
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

            <div className="mt-8 text-center text-[10px] text-gray-400 font-mono">
                Dicetak pada: {new Date().toLocaleString('id-ID')}
            </div>
        </div>
    );
};

export default ReportsPrintPage;
