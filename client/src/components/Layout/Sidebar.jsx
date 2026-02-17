import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiGrid, FiUpload, FiBarChart2, FiFileText, FiBell, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import API from '../../utils/api';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const f = async () => {
      try { const r = await API.get('/admin/notifications'); setUnread(r.data.filter(n => !n.isRead).length); } catch {}
    };
    f();
    const i = setInterval(f, 30000);
    return () => clearInterval(i);
  }, []);

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/upload', label: 'Upload Sheet', icon: FiUpload },
    { to: '/analytics', label: 'Analytics', icon: FiBarChart2 },
    { to: '/reports', label: 'Reports', icon: FiFileText },
    { to: '/notifications', label: 'Notifications', icon: FiBell, badge: unread },
    { to: '/settings', label: 'Settings', icon: FiSettings },
  ];

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 200 }}
      className="fixed left-0 top-0 h-screen w-[250px] z-50 flex flex-col sidebar-bg"
      style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.1)' }}
    >
      <div className="p-5 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🎓</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-heading font-bold text-base leading-tight">SAPA</h1>
            <p className="text-slate-400 text-[10px] font-medium tracking-widest uppercase">Attendance Analyzer</p>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-4 mb-2 p-3 rounded-lg bg-white/5 border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-600/30 text-teal-300 flex items-center justify-center text-sm font-bold font-heading flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'F'}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate leading-tight">{user?.name || 'Faculty'}</p>
            <p className="text-slate-400 text-[11px] truncate mt-0.5">{user?.role === 'admin' ? 'Admin' : 'Faculty'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 mt-2 space-y-0.5 overflow-y-auto">
        <p className="px-3 pt-3 pb-2 text-[10px] text-slate-500 font-semibold uppercase tracking-widest">Menu</p>
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          const Icon = link.icon;
          return (
            <NavLink key={link.to} to={link.to} className="block relative">
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 bg-white/10 rounded-lg"
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                />
              )}
              <div className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-teal-400 rounded-r-full" />
                )}
                <Icon size={17} className="flex-shrink-0" />
                <span className="text-[13px] font-medium">{link.label}</span>
                {link.badge > 0 && (
                  <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-md bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {link.badge}
                  </span>
                )}
              </div>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <FiLogOut size={17} className="flex-shrink-0" />
          <span className="text-[13px] font-medium">Sign Out</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;