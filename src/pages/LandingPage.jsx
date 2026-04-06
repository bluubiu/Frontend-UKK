import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { Activity, ChevronRight, ShieldCheck, Clock, Zap, Package, Star, ChevronDown, ArrowRight, Play, Instagram, Twitter, Facebook, Mail, Award, Target, MapPin } from 'lucide-react';
import aboutUsImage from '../assets/about-us.png';
import { useInView, useCounter, useScrollProgress, useScrollSpy } from '../hooks/useLanding';

const Reveal = ({ children, className = '', delay = 0, y = 60 }) => {
    const [ref, vis] = useInView(0.15);
    return (
        <div ref={ref} className={className} style={{
            transition: `opacity 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 1.4s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
            opacity: vis ? 1 : 0, transform: vis ? 'none' : `translateY(${y}px)`
        }}>{children}</div>
    );
};

const Stat = ({ t, s = '', label, setRef }) => {
    return (
        <div>
            <p className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-none">
                <span ref={setRef} data-target={t}>0</span>{s}
            </p>
            <div className="mt-4 pt-4 border-t-2 border-emerald-500 w-12"></div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mt-4">{label}</p>
        </div>
    );
};

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export default function LandingPage() {
    const { user, token } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [faq, setFaq] = useState(0);
    const [scrolled, setScrolled] = useState(false);
    const [statsRef, statsVis] = useInView(.2);
    const prog = useScrollProgress();
    const activeNav = useScrollSpy(['home', 'tentang-kami', 'fitur', 'showcase', 'testimoni', 'faq'], 200);

    const heroImgRef = useRef(null);
    const aboutImgRef = useRef(null);
    const statsNumbersRef = useRef([]);
    const testiScrollRef = useRef(null);

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
        let raf;
        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const y = window.scrollY;
                const h = window.innerHeight;
                if (heroImgRef.current) heroImgRef.current.style.transform = `translateY(${y * 0.15}px)`;
                if (aboutImgRef.current) {
                    const rect = aboutImgRef.current.parentElement.getBoundingClientRect();
                    const offset = (h - rect.top) * 0.1;
                    aboutImgRef.current.style.transform = `translateY(${offset}px) scale(1.05)`;
                }
                if (statsNumbersRef.current) {
                    statsNumbersRef.current.forEach(el => {
                        if (!el) return;
                        const rect = el.getBoundingClientRect();
                        let progress = (h - rect.top) / (h * 0.6);
                        progress = Math.max(0, Math.min(1, progress));
                        const target = parseInt(el.dataset.target, 10);
                        if (!isNaN(target)) el.innerText = Math.floor(progress * target);
                    });
                }
                if (testiScrollRef.current) {
                    const rect = testiScrollRef.current.closest('section').getBoundingClientRect();
                    const scrollDistance = h - rect.top;
                    if (scrollDistance > 0 && rect.bottom > 0) {
                        testiScrollRef.current.style.transform = `translateX(${-scrollDistance * 0.6}px)`;
                    }
                }
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
    }, []);

    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 80);
        window.addEventListener('scroll', h, { passive: true });
        return () => window.removeEventListener('scroll', h);
    }, []);

    useEffect(() => {
        axios.get('/items/available')
            .then(r => setItems((r.data.data || r.data).slice(0, 4)))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const dashPath = (user?.role?.name === 'admin' || user?.role?.name === 'petugas') ? '/admin/dashboard' : '/dashboard';
    const imgUrl = item => {
        if (!item.image) return null;
        if (item.image.startsWith('http')) return item.image;
        return `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/api$/, '')}/storage/${item.image}`;
    };

    const features = [
        { icon: <Zap className="w-8 h-8" />, title: 'Peminjaman Kilat', desc: 'Proses pengajuan hanya butuh beberapa detik dari smartphone.' },
        { icon: <ShieldCheck className="w-8 h-8" />, title: 'Terjamin & Aman', desc: 'Alat dipantau kondisinya, transaksi tersimpan terenkripsi.' },
        { icon: <Clock className="w-8 h-8" />, title: 'Pengingat Otomatis', desc: 'Notifikasi pengembalian agar skor kepatuhan tetap terjaga.' },
        { icon: <Package className="w-8 h-8" />, title: 'Inventaris Lengkap', desc: 'Dari tensimeter hingga kursi roda — semua tercatat rapi.' },
    ];

    const testimonials = [
        { name: 'Siti Aminah', role: 'Petugas UKS', stars: 5, msg: 'Sangat membantu kami melacak ribuan alat kesehatan setiap harinya.' },
        { name: 'Andi Wijaya', role: 'Siswa', stars: 4, msg: 'Gampang banget pinjam tandu lewat hp saat ada teman yang pingsan.' },
        { name: 'Ibu Ratna', role: 'Wakasek', stars: 5, msg: 'Efisiensi meningkat tajam sejak meninggalkan pencatatan manual.' },
        { name: 'Budi Santoso', role: 'Ketua PMR', stars: 5, msg: 'Dashboardnya sangat intuitif, semua anggota PMR langsung paham.' },
    ];

    const faqs = [
        { q: 'Bagaimana cara meminjam alat?', a: 'Daftarkan akun di MediUKS, jelajahi katalog alat, klik "Ajukan Pinjam", isi durasi, dan petugas UKS akan menerima notifikasi untuk menyetujui permintaan secara digital.' },
        { q: 'Berapa lama durasi peminjaman?', a: 'Standar 7 hari kalender. Durasi bisa disesuaikan sesuai kebijakan sekolah. Perpanjangan bisa diajukan sebelum masa pinjam berakhir.' },
        { q: 'Apa itu skor kepatuhan?', a: 'Sistem reputasi digital. Pengembalian tepat waktu dan kondisi baik meningkatkan skor. Skor tinggi memberi akses prioritas. Keterlambatan mengurangi skor sementara.' },
        { q: 'Bagaimana jika alat rusak saat dipinjam?', a: 'Segera laporkan di "Peminjaman Saya". Petugas verifikasi kondisi dan beri arahan sesuai SOP kesehatan sekolah.' },
    ];

    const navLinks = [{ label: 'Home', id: 'home' }, { label: 'Tentang Kami', id: 'tentang-kami' }, { label: 'Fitur', id: 'fitur' }, { label: 'Showcase', id: 'showcase' }, { label: 'Testimoni', id: 'testimoni' }, { label: 'FAQ', id: 'faq' }];

    return (
        <div className="lp min-h-screen bg-[#FDFDFD] text-gray-900 selection:bg-emerald-500 selection:text-white font-sans overflow-x-hidden">

            {/* ── Progress bar ── */}
            <div className="fixed top-0 left-0 right-0 z-[200] h-[4px] pointer-events-none">
                <div className="h-full bg-emerald-500" style={{ width: `${prog * 100}%`, transition: 'width .1s ease-out' }} />
            </div>

            {/* ══ NAV ══ */}
            <nav className="fixed w-full z-[100] transition-all duration-500" style={{
                background: scrolled ? 'rgba(253, 253, 253, 0.95)' : 'transparent',
                backdropFilter: scrolled ? 'blur(16px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(0,0,0,0.05)' : '1px solid transparent',
                padding: scrolled ? '16px 0' : '32px 0',
            }}>
                <div className="max-w-[1600px] mx-auto px-8 lg:px-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-600 p-2.5 rounded-none text-white"><Activity className="w-5 h-5" /></div>
                        <span className="text-2xl font-black tracking-tighter uppercase">Medi<span className="text-emerald-600">UKS</span></span>
                    </div>
                    <div className="hidden lg:flex items-center gap-10">
                        {navLinks.map(({ label, id }) => (
                            <a key={id} href={`#${id}`}
                                className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 relative group overflow-hidden ${activeNav === id ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}>
                                {label}
                                <span className={`absolute left-0 bottom-0 w-full h-[2px] bg-emerald-500 origin-left transition-transform duration-300 ${activeNav === id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                            </a>
                        ))}
                    </div>
                    <div>
                        {token
                            ? <Link to={dashPath} className="px-6 py-3 bg-gray-900 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors duration-300">Dashboard</Link>
                            : <Link to="/login" className="px-6 py-3 bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors duration-300">Masuk / Daftar</Link>}
                    </div>
                </div>
            </nav>

            {/* ══ HERO  ══ */}
            <section id="home" className="relative min-h-screen flex items-center pt-32 pb-40 px-8 lg:px-16 max-w-[1600px] mx-auto">
                <div className="w-full flex flex-col lg:flex-row gap-16 lg:gap-8 justify-between items-center relative z-10">
                    <div className="flex-1 w-full relative z-10">
                        <Reveal>
                            <p className="text-emerald-600 font-bold uppercase tracking-[0.25em] text-[11px] mb-8 lg:mb-12 flex items-center gap-4 before:content-[''] before:w-16 before:h-px before:bg-emerald-600">
                                Portal Manajemen Kesehatan
                            </p>
                        </Reveal>
                        <Reveal delay={100}>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl 2xl:text-7xl font-black text-gray-950 leading-[1.1] tracking-tight mb-8">
                                SOLUSI<br />
                                <span className="font-light italic text-emerald-600 tracking-[-0.02em]">UKS</span><br />
                                TERPADU.
                            </h1>
                        </Reveal>
                        <Reveal delay={200}>
                            <div className="flex flex-col sm:flex-row gap-6 max-w-xl">
                                <p className="text-base font-light text-gray-500 leading-relaxed sm:border-l-[1.5px] sm:border-emerald-500 sm:pl-6">
                                    Modernisasi layanan kesehatan sekolah dengan MediUKS. Kelola peminjaman alat, stok obat, & riwayat kesehatan.
                                </p>
                            </div>
                        </Reveal>
                        <Reveal delay={300} className="mt-16 flex items-center gap-6">
                            {token
                                ? <Link to={dashPath} className="flex items-center gap-4 text-emerald-600 hover:text-gray-900 font-bold uppercase tracking-widest text-sm transition-colors group">
                                    <span className="w-14 h-14 rounded-full border border-emerald-200 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                    Dashboard Saya
                                </Link>
                                : <Link to="/register" className="flex items-center gap-4 text-emerald-600 hover:text-gray-900 font-bold uppercase tracking-widest text-sm transition-colors group">
                                    <span className="w-14 h-14 rounded-full border border-emerald-200 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                    Mulai Gratis
                                </Link>}
                        </Reveal>
                    </div>

                    <div className="flex-1 w-full hidden lg:flex justify-end pr-8" style={{ perspective: '1000px' }}>
                        <div ref={heroImgRef} className="w-full max-w-md aspect-[3/4] bg-emerald-50 p-12 relative flex items-center justify-center mix-blend-multiply transition-transform duration-1000 ease-out" style={{ transformStyle: 'preserve-3d' }}>
                            <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-emerald-500" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-emerald-500" />
                            <svg viewBox="0 0 400 460" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[120%] h-auto absolute right-[-10%] opacity-90 drop-shadow-2xl">
                                <path d="M148 80 C148 80 120 72 108 92 C96 112 100 148 100 148" stroke="#059669" strokeWidth="18" strokeLinecap="square" />
                                <path d="M252 80 C252 80 280 72 292 92 C304 112 300 148 300 148" stroke="#059669" strokeWidth="18" strokeLinecap="square" />
                                <rect x="90" y="142" width="20" height="20" fill="#047857" />
                                <rect x="290" y="142" width="20" height="20" fill="#047857" />
                                <path d="M100 162 C100 230 140 260 200 260" stroke="#059669" strokeWidth="18" strokeLinecap="square" />
                                <path d="M300 162 C300 230 260 260 200 260" stroke="#059669" strokeWidth="18" strokeLinecap="square" />
                                <path d="M200 260 V340" stroke="#059669" strokeWidth="18" />
                                <circle cx="200" cy="370" r="50" stroke="#059669" strokeWidth="18" fill="white" />
                                <circle cx="200" cy="370" r="20" fill="#059669" />
                            </svg>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ TENTANG KAMI ══ */}
            <section id="tentang-kami" className="relative bg-black text-white py-40 px-8 lg:px-16 overflow-hidden">
                <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-24 items-start">
                    <div className="lg:w-5/12 lg:sticky lg:top-40 pl-0">
                        <Reveal>
                            <p className="text-emerald-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-8 flex items-center gap-4">
                                <span className="w-12 h-px bg-emerald-500"></span> Siapa Kami
                            </p>
                            <h2 className="text-3xl lg:text-5xl font-black leading-[1.1] tracking-tight mb-8">
                                DEDIKASI<br />
                                KESEHATAN<br />
                                <span className="text-emerald-400 italic font-light">SISWA.</span>
                            </h2>
                            <div className="w-16 h-1 bg-emerald-600"></div>
                        </Reveal>
                    </div>

                    <div className="lg:w-7/12 flex flex-col gap-24">
                        <Reveal delay={100}>
                            <h3 className="text-xl lg:text-2xl font-light text-gray-300 leading-snug border-l border-white/20 pl-6 lg:pl-12 py-2">
                                "Menjadi platform digital nomor satu di Indonesia yang mendigitalisasi setiap sudut layanan UKS, demi generasi yang sehat dan tangguh."
                            </h3>
                        </Reveal>

                        <div className="grid sm:grid-cols-2 gap-12 lg:pl-16">
                            {[
                                { Icon: Award, title: 'Visi Sistem', desc: 'Mewujudkan UKS berbasis teknologi tinggi di seluruh Indonesia, tanpa kertas.' },
                                { Icon: Target, title: 'Misi Kami', desc: 'Meningkatkan akurasi data dan efisiensi waktu petugas UKS hingga 80%.' },
                            ].map(({ Icon, title, desc }, i) => (
                                <Reveal key={i} delay={i * 150} y={40}>
                                    <div className="border-t border-white/20 pt-8 mt-4">
                                        <Icon className="w-10 h-10 text-emerald-500 mb-6" strokeWidth={1.5} />
                                        <h4 className="text-lg font-bold mb-2">{title}</h4>
                                        <p className="text-sm text-gray-400 font-light leading-relaxed">{desc}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>

                        <Reveal delay={200}>
                            <div className="overflow-hidden bg-gray-900 mt-12 aspect-[4/3] lg:aspect-[16/9] relative">
                                <div className="absolute inset-0 bg-emerald-900/40 mix-blend-multiply z-10" />
                                <img ref={aboutImgRef} src={aboutUsImage} alt="Tentang MediUKS" className="w-full h-[120%] object-cover absolute top-[-10%] scale-100 will-change-transform" />
                                <div className="absolute bottom-6 left-6 lg:bottom-10 lg:left-10 z-20 flex bg-black p-5 gap-6 border border-white/10 items-center">
                                    <div><p className="text-2xl font-black text-emerald-500 mb-1">98%</p><p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Kepuasan</p></div>
                                    <div className="w-px h-10 bg-white/20"></div>
                                    <div><p className="text-2xl font-black text-white mb-1">10k+</p><p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Transaksi</p></div>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ══ STATS ══ */}
            <section className="py-32 px-8 lg:px-16 border-b border-gray-200 bg-white">
                <div ref={statsRef} className="max-w-[1600px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8">
                    {[{ t: 500, s: '+', l: 'Alat Aktif' }, { t: 24, s: 'x', l: 'Sekolah' }, { t: 120, s: 'k', l: 'Peminjaman' }, { t: 15, s: '', l: 'Integrasi' }].map((x, i) => (
                        <Reveal key={i} delay={i * 100} y={30}>
                            <Stat t={x.t} s={x.s} label={x.l} setRef={el => statsNumbersRef.current[i] = el} />
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* ══ FITUR ══ */}
            <section id="fitur" className="py-40 px-8 lg:px-16 bg-[#FDFDFD]">
                <div className="max-w-[1600px] mx-auto">
                    <Reveal className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <p className="text-emerald-600 font-bold uppercase tracking-[0.2em] text-[10px] mb-6">Inovasi Digital</p>
                            <h2 className="text-3xl lg:text-5xl font-black text-gray-950 leading-[1.1] tracking-tight uppercase">
                                Fitur <span className="text-emerald-600 italic font-light">Sistem.</span>
                            </h2>
                        </div>
                        <p className="text-base text-gray-500 font-light max-w-sm">Mendigitalisasi layanan secara menyeluruh dengan fitur mutakhir.</p>
                    </Reveal>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 pt-8">
                        {features.map((f, i) => (
                            <Reveal key={i} delay={i * 100} y={40} className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)] hover:-translate-y-2 transition-all duration-500 p-10 lg:p-12 flex flex-col justify-between aspect-square">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500 mb-12">
                                    {f.icon}
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-gray-900 group-hover:text-emerald-600 transition-colors duration-500 mb-4 uppercase tracking-tight">{f.title}</h4>
                                    <p className="text-sm text-gray-500 font-light leading-relaxed">{f.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ SHOWCASE ══ */}
            <section id="showcase" className="py-40 px-8 lg:px-16 bg-gray-100">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20 border-b border-gray-300 pb-12">
                        <Reveal>
                            <p className="text-emerald-600 font-bold uppercase tracking-[0.2em] text-[10px] mb-6">Katalog Alat</p>
                            <h3 className="text-3xl lg:text-5xl font-black text-gray-950 leading-[1.1] tracking-tight uppercase">Showcase <br /><span className="italic font-light text-emerald-600">Terbaru.</span></h3>
                        </Reveal>
                        <Reveal delay={150}>
                            <Link to="/login" className="px-6 py-3 border border-gray-950 text-gray-950 hover:bg-gray-950 hover:text-white font-bold uppercase tracking-widest text-xs transition-colors duration-300 flex items-center gap-4">
                                Cari Semua Alat <ArrowRight className="w-4 h-4" />
                            </Link>
                        </Reveal>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {loading ? [0, 1, 2, 3].map(i => <div key={i} className="aspect-[3/4] bg-gray-200 rounded-[2rem] animate-pulse border border-white" />)
                            : items.length > 0 ? items.map((item, i) => (
                                <Reveal key={item.id} delay={i * 100} y={40} className="group relative bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-500 p-8 flex flex-col">
                                    <div className="aspect-square flex items-center justify-center relative mb-8 bg-gray-50 rounded-2xl overflow-hidden group-hover:bg-emerald-50 transition-colors">
                                        {imgUrl(item) ? (
                                            <img src={imgUrl(item)} alt={item.name} className="w-3/4 h-3/4 object-contain group-hover:scale-110 transition-transform duration-700 ease-out" />
                                        ) : (
                                            <Package className="w-24 h-24 text-gray-200 group-hover:text-emerald-500 transition-colors duration-500" strokeWidth={1} />
                                        )}
                                        <div className="absolute top-0 right-0">
                                            {item.available_stock > 0 ? (
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 border border-emerald-600 px-3 py-1">Ready</span>
                                            ) : (
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-amber-600 border border-amber-600 px-3 py-1">Habis</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-auto border-t border-gray-100 pt-6">
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-2">{item.category?.name || 'Medical Eq.'}</p>
                                        <h4 className="font-bold text-lg text-gray-900 tracking-tight uppercase mb-4 truncate">{item.name}</h4>
                                        <Link to="/login" className="flex items-center gap-3 text-emerald-600 font-bold text-[10px] uppercase tracking-widest hover:text-gray-900 transition-colors">
                                            Lihat Detail <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </Reveal>
                            )) : (
                                <div className="col-span-full py-32 text-center bg-white border border-gray-200 flex flex-col items-center">
                                    <Package className="w-16 h-16 text-gray-300 mb-6" strokeWidth={1} />
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Belum ada item tersedia.</p>
                                </div>
                            )}
                    </div>
                </div>
            </section>

            {/* ══ TESTIMONI ══ */}
            <section id="testimoni" className="py-40 bg-black text-white px-8 lg:px-16 overflow-hidden">
                <Reveal className="max-w-[1600px] mx-auto text-center mb-24 flex flex-col items-center">
                    <p className="text-emerald-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-6">Testimoni</p>
                    <h3 className="text-3xl lg:text-5xl font-black leading-[1.1] tracking-tight uppercase max-w-4xl text-white">Apa Kata Civitas Akademika.</h3>
                </Reveal>

                <div className="flex gap-6 lg:gap-10 overflow-hidden pt-8 pb-16 relative w-full">
                    {/* <div className="flex gap-6 lg:gap-10 will-change-transform" style={{ width: 'max-content' }}> */}
                        {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
                            <div key={i} className="w-[300px] lg:w-[380px] shrink-0 bg-[#09090b] border border-white/5 shadow-2xl rounded-[2rem] p-8 lg:p-10 flex flex-col justify-between min-h-[280px] hover:-translate-y-2 hover:border-emerald-500/50 transition-all duration-500">
                                <div>
                                    <div className="flex gap-2 mb-4">{[...Array(t.stars)].map((_, j) => <Star key={j} className="w-3 h-3 fill-emerald-500 text-emerald-500" />)}</div>
                                    <p className="text-base lg:text-lg font-light text-gray-300 leading-relaxed mb-8">"{t.msg}"</p>
                                </div>
                                <div className="flex items-center gap-4 border-t border-white/10 pt-5 mt-auto">
                                    <span className="text-sm font-bold text-emerald-500">—</span>
                                    <div>
                                        <p className="font-bold text-sm text-white tracking-widest uppercase mb-1">{t.name}</p>
                                        <p className="text-[9px] uppercase font-bold text-gray-500 tracking-widest">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    {/* </div> */}
                </div>
            </section>

            {/* ══ FAQ ══ */}
            <section id="faq" className="py-40 px-8 lg:px-16 bg-[#FDFDFD]">
                <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-24">
                    <div className="lg:w-1/3">
                        <Reveal className="lg:sticky lg:top-40">
                            <p className="text-emerald-600 font-bold uppercase tracking-[0.2em] text-[10px] mb-6">Help Center</p>
                            <h3 className="text-3xl lg:text-5xl font-black text-gray-950 leading-[1.1] tracking-tight uppercase mb-6">Punya<br /><span className="italic font-light text-emerald-500">Pertanyaan?</span></h3>
                            <div className="pt-8 border-t border-gray-200">
                                <p className="text-base text-gray-500 font-light mb-6">Pusat bantuan kami selalu sedia untuk menjawab segala keraguan Anda.</p>
                                <a href="mailto:support@mediuks.com" className="inline-flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-white bg-gray-950 px-6 py-3 hover:bg-emerald-600 transition-colors">
                                    <Mail className="w-4 h-4" /> Hubungi Kami
                                </a>
                            </div>
                        </Reveal>
                    </div>

                    <div className="lg:w-2/3 flex flex-col">
                        {faqs.map((f, i) => (
                            <Reveal key={i} delay={i * 100} y={30} className="border-b border-gray-200">
                                <button onClick={() => setFaq(faq === i ? -1 : i)} className="w-full py-4 flex items-center justify-between text-left group">
                                    <span className={`text-lg lg:text-xl font-bold transition-colors ${faq === i ? 'text-emerald-600' : 'text-gray-900 group-hover:text-emerald-600'}`}>
                                        {f.q}
                                    </span>
                                    <span className="w-10 h-10 flex items-center justify-center shrink-0 border border-gray-200 rounded-full group-hover:border-emerald-600 bg-white group-hover:bg-emerald-50 transition-all duration-300 ml-6">
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${faq === i ? 'rotate-180 text-emerald-600' : 'text-gray-950'}`} />
                                    </span>
                                </button>
                                <div style={{ maxHeight: faq === i ? '300px' : '0', opacity: faq === i ? 1 : 0, overflow: 'hidden', transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                                    <div className="pb-8 pr-12 lg:pr-24">
                                        <p className="text-sm lg:text-base font-light text-gray-500 leading-relaxed">{f.a}</p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ FOOTER ══ */}
            <footer className="bg-gray-950 text-white pt-32 pb-12 relative overflow-hidden">
                <div className="max-w-[1600px] mx-auto px-8 lg:px-16 flex flex-col items-center">
                    <Reveal y={10} className="w-full flex justify-center mb-16">
                        <span className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter uppercase text-center w-full block">
                            MEDI<span className="text-emerald-600 font-light italic">UKS</span>
                        </span>
                    </Reveal>

                    <div className="w-full border-t border-white/10 pt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
                        <div className="col-span-1 lg:col-span-2">
                            <p className="text-lg lg:text-xl font-light text-gray-400 mb-8 max-w-lg leading-snug">
                                Sistem manajemen kesehatan digital tersentralisasi, andal dan presisi.
                            </p>
                            <div className="flex gap-4">
                                {['IN', 'TW', 'FB'].map((l) => (
                                    <a key={l} href="#" className="w-10 h-10 flex items-center justify-center border border-white/20 hover:bg-white hover:text-black font-bold text-[10px] uppercase transition-colors">{l}</a>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em] mb-6">Eksplorasi</h4>
                            <ul className="space-y-4">
                                {['Katalog', 'Dashboard', 'Tentang Kami', 'FAQ'].map(l => (
                                    <li key={l}><a href="#" className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">{l}</a></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em] mb-6">Kantor Pusat</h4>
                            <p className="text-sm font-light leading-relaxed text-gray-400">
                                Jl. Ngadiluwih, Kedungpedaringan, Kec. Kepanjen,<br /> Kabupaten Malang,<br /> Jawa Timur 65163
                            </p>
                        </div>
                    </div>

                    <div className="w-full flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 gap-6">
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">© 2026 MEDIUKS. ALL RIGHTS RESERVED.</p>
                        <div className="flex gap-8">
                            <a href="#" className="text-[10px] font-bold text-gray-600 uppercase tracking-widest hover:text-emerald-500 transition-colors">Privacy</a>
                            <a href="#" className="text-[10px] font-bold text-gray-600 uppercase tracking-widest hover:text-emerald-500 transition-colors">Terms</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* ══ GLOBAL CSS OVERRIDES ══ */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;900&display=swap');
                .lp { font-family: 'Outfit', sans-serif; }
                .lp ::selection { background-color: #10b981; color: white; }
                .lp ::-webkit-scrollbar { display: none; }
                .lp { -ms-overflow-style: none; scrollbar-width: none; background-color: #FAFAFA; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                
                @media (prefers-reduced-motion: reduce) {
                    .lp * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
                }
            `}</style>
        </div>
    );
}
