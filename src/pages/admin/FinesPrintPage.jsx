import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../../api/axios';
import { Loader2 } from 'lucide-react';

const FinesPrintPage = () => {
    const [searchParams] = useSearchParams();
    const filter = searchParams.get('status') || 'pending_verification';
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFines = async () => {
            try {
                const params = filter === 'pending_verification' ? { status: 'pending_verification' } : {};
                const response = await axios.get('/fines', { params });
                setFines(response.data);
                document.title = `Laporan_Denda_${filter}_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}`;
            } catch (error) {
                console.error("Error fetching fines:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFines();
    }, [filter]);

    useEffect(() => {
        if (!loading && fines) {
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [loading, fines]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="bg-white p-8 max-w-[210mm] mx-auto print:p-0 font-serif text-sm">
            {/* Header */}
            <div className="text-center border-b-2 border-black mb-6 pb-4">
                <h1 className="text-2xl font-bold uppercase">Laporan Verifikasi Denda <br /> UKS Sekolah</h1>
                <h2 className="text-m font-bold">MediUKS</h2>
                <p className="text-sm mt-2">Jl, Ngadiluwih, Kedungpedaringan, Kec. Kepanjen, <br /> Kabupaten Malang, Jawa Timur 65163</p>
                <p className="text-xs mt-4 text-center italic font-medium tracking-wider">
                    Dicetak pada: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>

            <div className="mb-4">
                <span className="font-bold">Filter Status: </span>
                <span className="uppercase">{filter === 'pending_verification' ? 'Menunggu Verifikasi' : 'Semua Data'}</span>
            </div>

            {/* Data Table */}
            <table className="w-full border-collapse border border-black text-xs">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-black px-2 py-1 text-center w-10">No</th>
                        <th className="border border-black px-2 py-1 text-left">Peminjam</th>
                        <th className="border border-black px-2 py-1 text-left">ID Pinjam</th>
                        <th className="border border-black px-2 py-1 text-right">Total Denda</th>
                        <th className="border border-black px-2 py-1 text-left">Tgl Pembayaran</th>
                        <th className="border border-black px-2 py-1 text-center">Status</th>
                        <th className="border border-black px-2 py-1 text-left">Catatan</th>
                    </tr>
                </thead>
                <tbody>
                    {fines.map((fine, index) => (
                        <tr key={index}>
                            <td className="border border-black px-2 py-1 text-center">{index + 1}</td>
                            <td className="border border-black px-2 py-1 font-semibold">{fine.return_model?.loan?.user?.full_name}</td>
                            <td className="border border-black px-2 py-1 text-center font-mono">#{fine.return_model?.loan_id}</td>
                            <td className="border border-black px-2 py-1 text-right font-bold">{formatCurrency(fine.total_fine)}</td>
                            <td className="border border-black px-2 py-1">{formatDate(fine.user_payment_date)}</td>
                            <td className="border border-black px-2 py-1 text-center uppercase font-bold">
                                {fine.is_paid ? 'LUNAS' : fine.payment_confirmed_by_user ? 'BUTUH VERIFIKASI' : 'BELUM DIBAYAR'}
                            </td>
                            <td className="border border-black px-2 py-1 italic text-gray-600">{fine.user_notes || '-'}</td>
                        </tr>
                    ))}
                    {fines.length === 0 && (
                        <tr>
                            <td colSpan="7" className="border border-black px-2 py-4 text-center italic text-gray-500">
                                Tidak ada data denda ditemukan.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Signatures */}
            <div className="mt-12 grid grid-cols-2 gap-8 text-center break-inside-avoid">
                <div></div>
                <div>
                    <p className="mb-16">Petugas Verifikator,</p>
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

export default FinesPrintPage;
