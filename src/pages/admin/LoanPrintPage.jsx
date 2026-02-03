import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../api/axios';
import { Loader2 } from 'lucide-react';

const LoanPrintPage = () => {
    const { id } = useParams();
    const [loan, setLoan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLoan = async () => {
            try {
                const response = await axios.get(`/loans/${id}`);
                setLoan(response.data);
                document.title = `Bukti_Peminjaman_${response.data.id}`;
            } catch (error) {
                console.error("Error fetching loan:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLoan();
    }, [id]);

    useEffect(() => {
        if (!loading && loan) {
            window.print();
        }
    }, [loading, loan]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!loan) {
        return (
            <div className="flex items-center justify-center min-h-screen text-red-500">
                Data peminjaman tidak ditemukan.
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-white p-8 max-w-4xl mx-auto print:p-0 font-serif">
            {/* Header */}
                <div className="hidden print:block p-8 text-center border-b-2 border-black mb-6">
                    <h1 className="text-2xl font-bold uppercase">Laporan Bukti Peminjaman <br /> UKS Sekolah</h1>
                    <h2 className="text-m font-bold">MediUKS</h2>
                    <p className="text-sm mt-2">Jl, Ngadiluwih, Kedungpedaringan, Kec. Kepanjen, <br /> Kabupaten Malang, Jawa Timur 65163</p>
                    <p className="text-xs mt-4 text-center italic font-medium tracking-wider">Dicetak pada: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="mt-2 font-mono text-sm">NO: {loan.id.toString().padStart(6, '0')}</p>
            </div>
            {/* Loan Info */}
            <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                <div>
                    <h3 className="font-bold border-b border-gray-300 mb-2 pb-1">DATA PEMINJAM</h3>
                    <table className="w-full">
                        <tbody>
                            <tr>
                                <td className="py-1 w-32 text-gray-600">Nama Lengkap</td>
                                <td className="py-1 font-semibold">: {loan.user?.full_name}</td>
                            </tr>
                            <tr>
                                <td className="py-1 text-gray-600">ID Anggota</td>
                                <td className="py-1">: {loan.user?.id}</td>
                            </tr>
                            <tr>
                                <td className="py-1 text-gray-600">Email</td>
                                <td className="py-1">: {loan.user?.email}</td>
                            </tr>
                            <tr>
                                <td className="py-1 text-gray-600">Kelas/Jabatan</td>
                                <td className="py-1">: {loan.user?.class || '-'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div>
                    <h3 className="font-bold border-b border-gray-300 mb-2 pb-1">DETAIL PINJAM</h3>
                    <table className="w-full">
                        <tbody>
                            <tr>
                                <td className="py-1 w-32 text-gray-600">Tanggal Pinjam</td>
                                <td className="py-1">: {formatDate(loan.loan_date)}</td>
                            </tr>
                            <tr>
                                <td className="py-1 text-gray-600">Jatuh Tempo</td>
                                <td className="py-1 font-bold text-red-600">: {formatDate(loan.return_date)}</td>
                            </tr>
                            <tr>
                                <td className="py-1 text-gray-600">Status</td>
                                <td className="py-1 uppercase font-semibold">: {loan.status === 'approved' ? 'Disetujui' : loan.status}</td>
                            </tr>
                            <tr>
                                <td className="py-1 text-gray-600">Petugas Acc</td>
                                <td className="py-1">: {loan.approver?.full_name || '-'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Items Table */}
            <h3 className="font-bold border-b border-gray-300 mb-2 pb-1 text-sm">DAFTAR BARANG DIPINJAM</h3>
            <table className="w-full border-collapse border border-gray-300 mb-8 text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border border-gray-300 px-3 py-2 text-left w-12">No</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Nama Barang</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Kode Barang</th>
                        <th className="border border-gray-300 px-3 py-2 text-center w-24">Jumlah</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Kondisi Awal</th>
                    </tr>
                </thead>
                <tbody>
                    {loan.details?.map((detail, index) => (
                        <tr key={index}>
                            <td className="border border-gray-300 px-3 py-2 text-center">{index + 1}</td>
                            <td className="border border-gray-300 px-3 py-2 font-medium">{detail.item?.name}</td>
                            <td className="border border-gray-300 px-3 py-2 text-gray-600 font-mono text-xs">{detail.item?.code || '-'}</td>
                            <td className="border border-gray-300 px-3 py-2 text-center font-bold">{detail.quantity}</td>
                            <td className="border border-gray-300 px-3 py-2 text-gray-600">Baik</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Terms */}
            <div className="mb-12 text-xs text-gray-500 italic border border-gray-200 p-3 rounded">
                <p><strong>Catatan:</strong></p>
                <ol className="list-decimal pl-4 space-y-1">
                    <li>Peminjam bertanggung jawab penuh atas barang yang dipinjam.</li>
                    <li>Keterlambatan pengembalian akan dikenakan denda sesuai peraturan yang berlaku.</li>
                    <li>Kehilangan atau kerusakan barang menjadi tanggung jawab peminjam untuk mengganti.</li>
                    <li>Harap membawa bukti ini saat melakukan pengembalian barang.</li>
                </ol>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-8 text-center text-sm">
                <div>
                    <p className="mb-16">Mengetahui,<br />Kepala Lab</p>
                    <p className="font-bold underline">____________________</p>
                    <p className="text-xs">NIP. ....................</p>
                </div>
                <div>
                    <p className="mb-16">Petugas,<br />&nbsp;</p>
                    <p className="font-bold underline">{loan.approver?.full_name || '....................'}</p>
                    <p className="text-xs">Staff Admin</p>
                </div>
                <div>
                    <p className="mb-16">Peminjam,<br />&nbsp;</p>
                    <p className="font-bold underline">{loan.user?.full_name}</p>
                    <p className="text-xs">Tanda Tangan & Nama Terang</p>
                </div>
            </div>

            <div className="mt-12 text-center text-[10px] text-gray-400 font-mono">
                Dicetak pada: {new Date().toLocaleString('id-ID')} | System ID: {loan.id}
            </div>
        </div>
    );
};

export default LoanPrintPage;
