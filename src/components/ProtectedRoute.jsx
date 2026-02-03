import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
    const { token, user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Or a proper loading spinner
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role?.name)) {
        return <Navigate to="/dashboard" replace />; // Redirect to user dashboard if unauthorized
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
