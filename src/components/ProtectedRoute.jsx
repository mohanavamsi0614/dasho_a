/* eslint-disable react/prop-types */
import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-lg font-medium tracking-wide">Loading...</p>
            </div>
        );
    }

    return user ? children : <Navigate to="/auth" replace />;
}
