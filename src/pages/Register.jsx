
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AuthCarousel from '../components/AuthCarousel';
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    // Password validation state
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false
    });

    const validatePassword = (value) => {
        const criteria = {
            length: value.length >= 8,
            upper: /[A-Z]/.test(value),
            lower: /[a-z]/.test(value),
            number: /[0-9]/.test(value),
            special: /[@$!%*#?&]/.test(value)
        };
        setPasswordCriteria(criteria);
        return Object.values(criteria).every(Boolean);
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        validatePassword(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setValidationErrors({});

        if (password !== passwordConfirmation) {
            setError("Password tidak cocok.");
            return;
        }

        if (!validatePassword(password)) {
            setError("Password belum memenuhi kriteria keamanan.");
            return;
        }

        const result = await register({ username, full_name: fullName, email, phone, password, password_confirmation: passwordConfirmation });
        if (result.success) {
            navigate('/login');
        } else {
            setError(result.message);
            if (result.errors) {
                setValidationErrors(result.errors);
            }
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Left Side - Carousel */}
            <AuthCarousel
                title="Bergabunglah dengan Unit Kesehatan Kami"
                subtitle="Memastikan peralatan siap untuk semua."
            />

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
                <div className="w-full max-w-md py-8">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Buat Akun Baru</h2>
                        <p className="text-gray-500">
                            Sudah punya akun? <Link to="/login" className="text-emerald-600 font-semibold hover:underline">Login</Link>
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className={`w-full px-4 py-2 rounded-lg border ${validationErrors.username ? 'border-red-500' : 'border-gray-300'} focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors bg-white outline-none`}
                                    required
                                />
                                {validationErrors.username && <p className="text-red-500 text-xs mt-1">{validationErrors.username[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className={`w-full px-4 py-2 rounded-lg border ${validationErrors.full_name ? 'border-red-500' : 'border-gray-300'} focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors bg-white outline-none`}
                                    required
                                />
                                {validationErrors.full_name && <p className="text-red-500 text-xs mt-1">{validationErrors.full_name[0]}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full px-4 py-2 rounded-lg border ${validationErrors.email ? 'border-red-500' : 'border-gray-300'} focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors bg-white outline-none`}
                                required
                            />
                            {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    if (value.length <= 12) setPhone(value);
                                }}
                                className={`w-full px-4 py-2 rounded-lg border ${validationErrors.phone ? 'border-red-500' : 'border-gray-300'} focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors bg-white outline-none`}
                                placeholder="Contoh: 081234567890"
                                required
                            />
                            {validationErrors.phone && <p className="text-red-500 text-xs mt-1">{validationErrors.phone[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={handlePasswordChange}
                                    className={`w-full px-4 py-2 rounded-lg border ${validationErrors.password ? 'border-red-500' : 'border-gray-300'} focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors bg-white outline-none pr-10`}
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
                            {/* Password Requirements Visualization */}
                            <div className="mt-2 text-xs space-y-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="font-semibold text-gray-600 mb-2">Syarat Password:</p>
                                <div className={`flex items-center ${passwordCriteria.length ? 'text-emerald-600' : 'text-gray-500'}`}>
                                    <span className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center border ${passwordCriteria.length ? 'bg-emerald-100 border-emerald-200' : 'border-gray-300'}`}>
                                        {passwordCriteria.length && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                    </span>
                                    Minimum 8 karakter
                                </div>
                                <div className={`flex items-center ${passwordCriteria.upper ? 'text-emerald-600' : 'text-gray-500'}`}>
                                    <span className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center border ${passwordCriteria.upper ? 'bg-emerald-100 border-emerald-200' : 'border-gray-300'}`}>
                                        {passwordCriteria.upper && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                    </span>
                                    Huruf kapital (A-Z)
                                </div>
                                <div className={`flex items-center ${passwordCriteria.lower ? 'text-emerald-600' : 'text-gray-500'}`}>
                                    <span className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center border ${passwordCriteria.lower ? 'bg-emerald-100 border-emerald-200' : 'border-gray-300'}`}>
                                        {passwordCriteria.lower && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                    </span>
                                    Huruf kecil (a-z)
                                </div>
                                <div className={`flex items-center ${passwordCriteria.number ? 'text-emerald-600' : 'text-gray-500'}`}>
                                    <span className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center border ${passwordCriteria.number ? 'bg-emerald-100 border-emerald-200' : 'border-gray-300'}`}>
                                        {passwordCriteria.number && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                    </span>
                                    Angka (0-9)
                                </div>
                                <div className={`flex items-center ${passwordCriteria.special ? 'text-emerald-600' : 'text-gray-500'}`}>
                                    <span className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center border ${passwordCriteria.special ? 'bg-emerald-100 border-emerald-200' : 'border-gray-300'}`}>
                                        {passwordCriteria.special && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                    </span>
                                    Karakter spesial (!@#$%^&*)
                                </div>
                            </div>
                            {validationErrors.password && <p className="text-red-500 text-xs mt-1">{validationErrors.password[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    className={`w-full px-4 py-2 rounded-lg border ${passwordConfirmation && password !== passwordConfirmation
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
                                        } transition-colors bg-white outline-none pr-10`}
                                    required
                                />
                            </div>
                            {passwordConfirmation && password !== passwordConfirmation && (
                                <p className="text-red-500 text-xs mt-1">Password tidak cocok</p>
                            )}
                        </div>

                        <div className="flex items-center pt-2">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 mr-2" required />
                            <span className="text-sm text-gray-500">Saya menyetujui <a href="#" className="text-emerald-600 hover:underline">Aturan & Ketentuan</a> MediUKS</span>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-emerald-600/30"
                        >
                            Buat Akun
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;

