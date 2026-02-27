import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center" style={{ minHeight: '80vh' }}>
                <div className="loader"></div>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        // Redirect to appropriate dashboard based on role
        if (currentUser.role === 'student') {
            return <Navigate to="/student-dashboard" replace />;
        } else if (currentUser.role === 'public') {
            return <Navigate to="/public-dashboard" replace />;
        } else if (currentUser.role === 'admin') {
            return <Navigate to="/admin" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    return children;
}
