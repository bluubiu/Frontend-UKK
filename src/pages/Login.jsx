import { useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AuthCarousel from '../components/AuthCarousel';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const result = await login(username, password);
        if (result.success) {
            const role = result.user?.role?.name || JSON.parse(localStorage.getItem('user'))?.role?.name;
            const dashboardPath = (role === 'admin' || role === 'petugas') ? '/admin/dashboard' : '/dashboard';
            navigate(dashboardPath);
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Left Side - Carousel */}
            <AuthCarousel
                title="Efficient management of school health resources"
                subtitle="Pengelolaan yang efisien untuk sumber daya kesehatan sekolah."
            />

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang Kembali</h2>
                        <p className="text-gray-500">
                            Belum punya akun? <Link to="/register" className="text-emerald-600 font-semibold hover:underline">Daftar sekarang</Link>
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors bg-white outline-none"
                                placeholder="Masukkan username Anda"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors bg-white outline-none pr-10"
                                    placeholder="Masukkan password Anda"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center text-gray-500 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 mr-2" />
                                Ingat saya
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsForgotPasswordOpen(true)}
                                className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline transition-all"
                            >
                                Lupa Password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-emerald-600/30"
                        >
                            Masuk
                        </button>

                    </form>
                </div>
            </div>

            <ForgotPasswordModal
                isOpen={isForgotPasswordOpen}
                onClose={() => setIsForgotPasswordOpen(false)}
            />
        </div>
    );
};

export default Login;
