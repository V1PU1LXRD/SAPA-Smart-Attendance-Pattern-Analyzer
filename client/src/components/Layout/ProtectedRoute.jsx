import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ backgroundColor: '#f8fafc' }}>
        <div className="w-8 h-8 border-[3px] border-slate-200 border-t-slate-700 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading...</p>
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;