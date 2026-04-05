import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleCallback = async () => {
            const params = new URLSearchParams(location.search);
            const token = params.get('token');
            const error = params.get('error');

            if (token) {
                // Berhasil! Simpan token ke localStorage dengan key 'token' (sesuai AuthContext)
                localStorage.setItem('token', token);
                
                try {
                    // Mengambil data user berdasarkan token
                    const response = await api.get('/profile');
                    const user = response.data;

                    // Simpan data user agar re-render AuthContext nanti mendapatkannya
                    localStorage.setItem('user', JSON.stringify(user));

                    // Membaca nama role
                    const roleName = user.role?.name || user.role;

                    // Redirect dengan me-reload window agar state AuthContext dan App terganti sempurna
                    if (roleName === 'admin' || roleName === 'petugas') {
                        window.location.href = '/admin/dashboard';
                    } else {
                        window.location.href = '/dashboard';
                    }
                } catch (err) {
                    console.error("Failed to fetch profile during Google Auth", err);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    alert('Gagal melengkapi data akun dari Google.');
                    navigate('/login', { replace: true });
                }
            } else if (error) {
                // Fitur gagal / user membatalkan
                alert('Autentikasi Google gagal atau dibatalkan.');
                navigate('/login', { replace: true });
            } else {
                // Default nyasar
                navigate('/login');
            }
        };

        handleCallback();
    }, [location, navigate]);

    return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="flex flex-col items-center p-8 bg-white shadow-xl rounded-2xl">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600 mb-4"></div>
                <h2 className="text-xl font-bold text-gray-800">Menyelesaikan Autentikasi...</h2>
                <p className="text-sm text-gray-500 mt-2">Mohon tunggu, Anda sedang diarahkan.</p>
            </div>
        </div>
    );
};

export default AuthCallback;
