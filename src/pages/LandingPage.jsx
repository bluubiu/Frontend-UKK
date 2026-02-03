import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import {
    Activity,
    ChevronRight,
    ShieldCheck,
    Clock,
    Zap,
    Package,
    Star,
    ChevronDown,
    ArrowRight,
    Play,
    CheckCircle2,
    Instagram,
    Twitter,
    Facebook,
    Mail,
    Users,
    Heart,
    Award,
    Target,
    MapPin
} from 'lucide-react';
import heroImage from '../assets/hero-illustration.png';
import aboutUsImage from '../assets/about-us.png';

const LandingPage = () => {
    const { user, token } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [popularItems, setPopularItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFaq, setActiveFaq] = useState(0);
    const [intersectedSections, setIntersectedSections] = useState(new Set());

    const dashboardPath = (user?.role?.name === 'admin' || user?.role?.name === 'petugas') ? '/admin/dashboard' : '/dashboard';

    const observer = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        fetchPopularItems();

        // Intersection Observer for scroll animations
        observer.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIntersectedSections(prev => new Set([...prev, entry.target.id]));
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('section').forEach(section => {
            observer.current.observe(section);
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (observer.current) observer.current.disconnect();
        };
    }, []);

    const fetchPopularItems = async () => {
        try {
            // Using a clean axios call (default_api uses '../api/axios' which usually has interceptors)
            // But since we moved it to public, this should work without a token.
            const response = await axios.get('/items/available');
            const items = response.data.data || response.data;
            setPopularItems(items.slice(0, 4));
        } catch (error) {
            console.error("Gagal mengambil item populer:", error);
        } finally {
            setLoading(false);
        }
    };

    const isVisible = (id) => intersectedSections.has(id);

    const features = [
        {
            icon: <Zap className="w-6 h-6 text-emerald-600" />,
            title: "Peminjaman Kilat",
            desc: "Proses pengajuan peminjaman hanya butuh beberapa detik langsung dari smartphone."
        },
        {
            icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
            title: "Terjamin & Aman",
            desc: "Setiap alat dipantau kondisinya dan data transaksi tersimpan dengan enkripsi."
        },
        {
            icon: <Clock className="w-6 h-6 text-purple-600" />,
            title: "Pengingat Otomatis",
            desc: "Dapatkan notifikasi pengembalian agar skor kepatuhan Anda tetap terjaga."
        },
        {
            icon: <Package className="w-6 h-6 text-amber-600" />,
            title: "Inventaris Lengkap",
            desc: "Akses ke berbagai peralatan medis mulai dari tensimeter hingga kursi roda."
        }
    ];

    const testimonials = [
        { name: "Siti Aminah", role: "Petugas UKS", stars: 5, msg: "Sangat membantu kami melacak ribuan alat kesehatan setiap harinya." },
        { name: "Andi Wijaya", role: "Siswa", stars: 4, msg: "Gampang banget pinjam tandu lewat hp saat ada teman yang pingsan." },
        { name: "Ibu Ratna", role: "Wakasek", stars: 5, msg: "Efisiensi meningkat tajam sejak meninggalkan pencatatan manual." },
        { name: "Budi Santoso", role: "Ketua PMR", stars: 5, msg: "Dashboardnya sangat intuitif, semua anggota PMR langsung paham." },
        { name: "Lina Marlina", role: "Siswa", stars: 5, msg: "Notifikasi pengembalian sangat membantu agar saya tidak pernah terlambat." },
        { name: "Rizky Fauzi", role: "Petugas", stars: 4, msg: "Verifikasi peminjaman jadi lebih cepat dengan sistem yang terintegrasi." },
        { name: "Maya Sari", role: "Siswa", stars: 5, msg: "Aplikasi UKS tercanggih yang pernah saya coba di sekolah." }
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden scroll-smooth scrollbar-hide">

            {/* Navigation */}
            <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-700 ${scrolled ? 'bg-white/90 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-4' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer transition-transform duration-500 hover:scale-105">
                        <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-lg shadow-emerald-200 group-hover:rotate-12 transition-transform">
                            <Activity className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter italic">Medi<span className="text-emerald-600">UKS</span></span>
                    </div>

                    <div className="hidden md:flex items-center gap-10">
                        {['Home', 'Tentang-Kami', 'Fitur', 'FAQ', 'Testimoni'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="text-[11px] font-black text-gray-400 hover:text-emerald-600 transition-all uppercase tracking-[0.2em] relative group">
                                {item.replace('-', ' ')}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 transition-all group-hover:w-full"></span>
                            </a>
                        ))}
                    </div>

                    {token ? (
                        <Link to={dashboardPath} className="bg-emerald-600 text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-200">
                            Ke Dashboard
                        </Link>
                    ) : (
                        <Link to="/login" className="bg-gray-900 text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-200 transition-all active:scale-95">
                            Masuk
                        </Link>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="relative pt-40 pb-20 px-8 overflow-hidden min-h-screen flex items-center">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div className={`relative z-10 transition-all duration-1000 ${scrolled ? 'opacity-100' : 'opacity-100'}`}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-8 animate-fade-in">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                            Portal Manajemen Kesehatan Digital
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight mb-8 animate-slide-up">
                            Solusi Manajemen <span className="relative inline-block">
                                <span className="relative z-10 text-emerald-600 italic">UKS</span>
                                <span className="absolute bottom-2 left-0 w-full h-4 bg-emerald-100 -z-10 rotate-1"></span>
                            </span> Terpadu
                        </h1>
                        <p className="text-lg text-gray-500 font-medium leading-relaxed mb-12 max-w-lg animate-slide-up-delay-1">
                            Modernisasi layanan kesehatan sekolah dengan MediUKS. Kelola peminjaman alat, stok obat, dan riwayat kesehatan dalam satu platform.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5 animate-slide-up-delay-2">
                            {token ? (
                                <Link to={dashboardPath} className="bg-emerald-600 text-white px-10 py-5 rounded-[24px] font-bold text-lg hover:bg-emerald-700 hover:shadow-2xl hover:shadow-emerald-200 transition-all flex items-center justify-center gap-3 group active:scale-95">
                                    Dashboard Saya <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ) : (
                                <Link to="/register" className="bg-emerald-600 text-white px-10 py-5 rounded-[24px] font-bold text-lg hover:bg-emerald-700 hover:shadow-2xl hover:shadow-emerald-200 transition-all flex items-center justify-center gap-3 group active:scale-95">
                                    Daftar Gratis <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}
                            <a href="#fitur" className="bg-white text-gray-900 border-2 border-gray-100 px-10 py-5 rounded-[24px] font-bold text-lg hover:border-emerald-600 hover:text-emerald-600 transition-all flex items-center justify-center gap-3 group">
                                <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" /> Lihat Fitur
                            </a>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-10 bg-emerald-100 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
                        <img
                            src={heroImage}
                            alt="MediUKS Hero"
                            className="relative w-full h-auto drop-shadow-[0_35px_35px_rgba(16,185,129,0.15)]"
                        />
                    </div>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
                    <ChevronDown className="w-6 h-6 text-gray-300" />
                </div>
            </section>

            {/* Tentang Kami Section */}
            <section id="tentang-kami" className="py-32 px-8 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        <div className={`space-y-8 transition-all duration-1000 ${isVisible('tentang-kami') ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
                            <div className="inline-block px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                Siapa Kami
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                                Dedikasi Kami Untuk <br /> <span className="text-emerald-600">Kesehatan Siswa</span>
                            </h2>
                            <p className="text-lg text-gray-500 font-medium leading-relaxed italic border-l-4 border-emerald-600 pl-6">
                                "Menjadi platform digital nomor satu di Indonesia yang mendigitalisasi setiap sudut layanan UKS, demi terciptanya generasi sekolah yang sehat dan tangguh."
                            </p>
                            <div className="grid grid-cols-2 gap-8 pt-4">
                                <div className="space-y-3">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                                        <Award className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-black text-gray-900">Visi Kami</h4>
                                    <p className="text-sm text-gray-400 font-medium">Mewujudkan UKS berbasis teknologi tinggi di seluruh Indonesia.</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                                        <Target className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-black text-gray-900">Misi Kami</h4>
                                    <p className="text-sm text-gray-400 font-medium">Meningkatkan akurasi data dan efisiensi petugas UKS.</p>
                                </div>
                            </div>
                        </div>

                        <div className={`relative transition-all duration-1000 delay-300 ${isVisible('tentang-kami') ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
                            <div className="bg-emerald-600 aspect-square rounded-[60px] relative overflow-hidden group shadow-2xl shadow-emerald-200">
                                <div className="absolute inset-0 bg-white group-hover:scale-110 transition-transform duration-700">
                                    <img src={aboutUsImage} alt="Tentang MediUKS" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute inset-0 bg-emerald-600/20 mix-blend-multiply"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-white/10 backdrop-blur-md p-10 rounded-full border border-white/20">
                                        <Activity className="w-20 h-20 text-white animate-pulse" />
                                    </div>
                                </div>
                            </div>

                            {/* Counter Stats */}
                            <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-[40px] shadow-2xl border border-gray-100 flex gap-10">
                                <div>
                                    <p className="text-4xl font-black text-emerald-600 leading-none mb-1">98%</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">User Satisfied</p>
                                </div>
                                <div className="w-px h-10 bg-gray-100"></div>
                                <div>
                                    <p className="text-4xl font-black text-gray-900 leading-none mb-1">10k+</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transactions</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="fitur" className="py-32 px-8 bg-[#FBFDFF]">
                <div className="max-w-7xl mx-auto">
                    <div className={`text-center max-w-2xl mx-auto mb-24 transition-all duration-1000 ${isVisible('fitur') ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                        <h2 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-6">Inovasi Digital</h2>
                        <h3 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">Fitur Unggulan Sistem MediUKS</h3>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {features.map((f, i) => (
                            <div key={i} className={`group bg-white p-10 rounded-[48px] border border-gray-50 shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.08)] transition-all duration-700 hover:-translate-y-4 ${isVisible('fitur') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{ transitionDelay: `${i * 150}ms` }}>
                                <div className="mb-10 inline-block p-6 bg-gray-50 rounded-3xl group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:rotate-6 transition-all duration-500">
                                    {f.icon}
                                </div>
                                <h4 className="text-2xl font-black text-gray-900 mb-5 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{f.title}</h4>
                                <p className="text-gray-500 font-medium leading-relaxed">
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Items Showcase */}
            <section className="py-32 px-8 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
                        <div className="max-w-2xl">
                            <h2 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-6">Katalog Alat</h2>
                            <h3 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Showcase Peralatan Terbaru</h3>
                        </div>
                        <Link to="/login" className="px-10 py-5 bg-gray-900 text-white rounded-[24px] font-bold text-lg hover:bg-emerald-600 hover:shadow-2xl transition-all active:scale-95 group">
                            Cari Semua Alat <ChevronRight className="inline-block w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        {loading ? (
                            [1, 2, 3, 4].map(i => <div key={i} className="h-[400px] bg-gray-50 rounded-[40px] animate-pulse"></div>)
                        ) : popularItems.length > 0 ? popularItems.map((item, i) => {
                            const getImageUrl = () => {
                                if (!item.image) return null;
                                if (item.image.startsWith('http')) return item.image;
                                const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
                                const storageUrl = baseUrl.replace(/\/api$/, '');
                                return `${storageUrl}/storage/${item.image}`;
                            };
                            const imgUrl = getImageUrl();

                            return (
                                <div key={item.id} className={`group bg-white rounded-[40px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden hover:shadow-2xl transition-all duration-1000 ${isVisible('fitur') ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`} style={{ transitionDelay: `${i * 100}ms` }}>
                                    <div className="aspect-[1/1] bg-[#F9FBFC] flex items-center justify-center p-8 relative">
                                        <div className="absolute inset-0 bg-emerald-600 scale-0 group-hover:scale-100 transition-transform duration-700 opacity-5"></div>
                                        {imgUrl ? (
                                            <img src={imgUrl} alt={item.name} className="w-full h-full object-contain transition-all duration-700 group-hover:scale-110 group-hover:rotate-3" />
                                        ) : (
                                            <Package className="w-20 h-20 text-gray-200 group-hover:text-emerald-500 transition-all duration-700 group-hover:scale-110 group-hover:rotate-3" />
                                        )}
                                        <div className="absolute top-6 right-6">
                                            {item.available_stock > 0 ? (
                                                <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">Ready</span>
                                            ) : (
                                                <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">Habis</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-8">
                                        <h4 className="font-black text-gray-900 text-xl truncate mb-2">{item.name}</h4>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-8">{item.category?.name || 'Medical Equipment'}</p>
                                        <Link to="/login" className="flex items-center justify-between w-full p-2 text-emerald-600 font-black text-sm uppercase group/btn">
                                            Lihat Detail <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="col-span-full py-20 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-100">
                                <Package className="w-20 h-20 text-gray-200 mx-auto mb-6" />
                                <p className="text-xl font-bold text-gray-400 uppercase tracking-widest italic">Belum ada item tersedia.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Counter Section */}
            <section className="py-24 bg-emerald-600 text-white">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                    {[
                        { val: '500+', label: 'Alat Aktif' },
                        { val: '24+', label: 'Sekolah' },
                        { val: '12k', label: 'Bantuan' },
                        { val: '15+', label: 'Petugas' }
                    ].map((s, i) => (
                        <div key={i} className="space-y-2">
                            <p className="text-5xl font-black italic tracking-tighter">{s.val}</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimoni" className="py-32 bg-gray-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 mb-20 text-center">
                    <h2 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-6">Testimoni Pengguna</h2>
                    <h3 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">Apa Kata Civitas Akademika?</h3>
                </div>

                <div className="flex gap-10 animate-marquee whitespace-nowrap px-10">
                    {[...testimonials, ...testimonials].map((t, i) => (
                        <div key={i} className="inline-block w-[320px] bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 shrink-0">
                            <div className="flex gap-1 mb-6">
                                {[...Array(t.stars)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                            </div>
                            <p className="text-sm text-gray-700 font-medium leading-relaxed mb-8 italic whitespace-normal">"{t.msg}"</p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-lg rotate-3 shadow-lg shadow-emerald-100">
                                    {t.name[0]}
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-sm text-gray-900 leading-none mb-1">{t.name}</p>
                                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em]">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-32 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-20 items-start">
                        <div>
                            <h2 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-6 text-left">Help Center</h2>
                            <h3 className="text-4xl font-black text-gray-900 tracking-tight leading-tight text-left mb-8">Punya Pertanyaan <br /> Mengenai Sistem?</h3>
                            <p className="text-gray-500 font-medium text-lg mb-12">Kami siap membantu mengoptimalkan pelayanan UKS di sekolah Anda kapan saja. Silahkan cek pertanyaan yang sering muncul.</p>
                            <div className="flex items-center gap-4 p-8 bg-emerald-50 rounded-[40px] border border-emerald-100">
                                <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shrink-0">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-black text-gray-900">Masih Bingung?</p>
                                    <p className="text-xs text-gray-500 font-medium">Hubungi kami di support@mediuks.com</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                {
                                    q: "Bagaimana cara meminjam alat?",
                                    a: "Siswa atau guru dapat mendaftarkan akun terlebih dahulu di platform MediUKS. Setelah akun diverifikasi, Anda dapat menjelajahi katalog alat kesehatan yang tersedia. Klik pada tombol 'Ajukan Pinjam', isi durasi peminjaman, dan petugas UKS akan menerima notifikasi untuk menyetujui permintaan Anda secara digital."
                                },
                                {
                                    q: "Berapa lama durasi peminjaman?",
                                    a: "Durasi peminjaman standar adalah 7 hari kalender. Namun, durasi ini dapat disesuaikan tergantung pada kebijakan masing-masing sekolah dan jenis alat yang dipinjam. Jika memerlukan perpanjangan, Anda dapat menghubungi petugas UKS melalui sistem sebelum masa pinjam berakhir."
                                },
                                {
                                    q: "Apa itu skor kepatuhan?",
                                    a: "Skor kepatuhan adalah sistem reputasi digital untuk setiap peminjam. Jika Anda mengembalikan alat tepat waktu dan dalam kondisi baik, skor Anda akan meningkat. Skor yang tinggi memberikan akses prioritas untuk peminjaman alat yang stoknya terbatas. Sebaliknya, keterlambatan akan mengurangi skor dan dapat membatasi hak peminjaman Anda sementara waktu."
                                },
                                {
                                    q: "Bagaimana jika alat rusak saat dipinjam?",
                                    a: "Keamanan dan pemeliharaan alat adalah tanggung jawab bersama. Jika terjadi kerusakan, segera laporkan melalui menu 'Peminjaman Saya' di dashboard Anda. Petugas akan melakukan verifikasi kondisi dan memberikan arahan lebih lanjut sesuai dengan SOP kesehatan sekolah yang berlaku."
                                }
                            ].map((f, i) => (
                                <div key={i} className="bg-white rounded-[32px] overflow-hidden border border-gray-100 hover:border-emerald-200 transition-all shadow-sm">
                                    <button
                                        onClick={() => setActiveFaq(activeFaq === i ? -1 : i)}
                                        className="w-full px-8 py-8 flex items-center justify-between text-left"
                                    >
                                        <span className="font-black text-gray-900 text-lg">{f.q}</span>
                                        <ChevronDown className={`w-6 h-6 text-emerald-600 transition-all duration-500 ${activeFaq === i ? 'rotate-180' : ''}`} />
                                    </button>
                                    <div className={`px-8 transition-all duration-700 ${activeFaq === i ? 'max-h-60 pb-8 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                        <div className="w-full h-px bg-gray-50 mb-8"></div>
                                        <p className="text-gray-500 font-medium leading-relaxed">{f.a}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-950 pt-32 pb-16 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 to-blue-600"></div>

                <div className="max-w-7xl mx-auto px-8">
                    <div className="grid lg:grid-cols-2 gap-24 mb-24">
                        <div className="max-w-sm space-y-10">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-600 p-2.5 rounded-2xl text-white">
                                    <Activity className="w-8 h-8" />
                                </div>
                                <span className="text-4xl font-black tracking-tighter text-white italic">Medi<span className="text-emerald-500">UKS</span></span>
                            </div>
                            <p className="text-xl text-emerald-100/40 font-medium leading-[1.6]">Sistem manajemen kesehatan digital tercanggih untuk ekosistem pendidikan masa depan.</p>
                            <div className="flex items-center gap-5">
                                {[Instagram, Twitter, Facebook].map((Icon, i) => (
                                    <a key={i} href="#" className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all border border-white/5 group">
                                        <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
                            <div>
                                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-10">Layanan</h4>
                                <ul className="space-y-6">
                                    {['Items', 'History', 'Fines', 'Profile'].map(i => (
                                        <li key={i}><a href="#" className="text-white/60 hover:text-white font-bold transition-colors uppercase text-xs tracking-wider">{i}</a></li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-10">Bantuan</h4>
                                <ul className="space-y-6">
                                    {['Support', 'Privacy', 'Legal', 'Security'].map(i => (
                                        <li key={i}><a href="#" className="text-white/60 hover:text-white font-bold transition-colors uppercase text-xs tracking-wider">{i}</a></li>
                                    ))}
                                </ul>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-10">Office</h4>
                                <p className="text-white/60 font-normal leading-relaxed flex items-start gap-3">
                                    <MapPin className="w-5 h-5 shrink-0" />
                                    Jl, Ngadiluwih, Kedungpedaringan, <br />Kec. Kepanjen,  Kabupaten Malang, Jawa Timur 65163
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-20 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-8">
                        <p className="text-[10px] font-black text-emerald-900 uppercase tracking-[0.5em]">
                            © 2026 MediUKS PLATFORM. ALL RIGHTS RESERVED.
                        </p>
                        <div className="flex gap-10">
                            <a href="#" className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] hover:text-emerald-500 transition-colors">Cookie Policy</a>
                            <a href="#" className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] hover:text-emerald-500 transition-colors">Data Privacy</a>
                        </div>
                    </div>
                </div>
            </footer>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0); }
                    50% { transform: translateY(-30px) rotate(1deg); }
                }
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(50px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
                .animate-marquee { animation: marquee 50s linear infinite; }
                .animate-marquee:hover { animation-play-state: paused; }
                .animate-slide-up { animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-slide-up-delay-1 { animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
                .animate-slide-up-delay-2 { animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards; opacity: 0; }
                .animate-fade-in { animation: fade-in 2s ease-in; }
                
                html { scroll-behavior: smooth; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default LandingPage;
