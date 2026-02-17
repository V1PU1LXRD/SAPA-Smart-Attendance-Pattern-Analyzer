import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const AppLayout = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-subtle-grid" style={{ backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <div className="flex-1 ml-[250px]" style={{ backgroundColor: '#f8fafc' }}>
        <header
          className="sticky top-0 z-30 border-b border-slate-200"
          style={{ backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }}
        >
          <div className="px-8 py-3.5 flex justify-between items-center">
            <p className="text-sm text-slate-500 font-medium">
              Welcome back, <span className="text-slate-800 font-semibold">{user?.name || 'Faculty'}</span>
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400 font-medium bg-slate-100 px-3 py-1.5 rounded-md">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold font-heading text-white flex-shrink-0"
                style={{ backgroundColor: '#1e3a5f' }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'F'}
              </div>
            </div>
          </div>
        </header>

        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-8"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
};

export default AppLayout;