import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { FiBell, FiCheck, FiCheckCircle, FiAlertTriangle, FiInfo, FiMonitor } from 'react-icons/fi';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);
  const fetchNotifications = async () => { setLoading(true); try { setNotifications((await API.get('/admin/notifications')).data); } catch {} finally { setLoading(false); } };
  const markRead = async (id) => { try { await API.put(`/admin/notifications/${id}/read`); setNotifications(p => p.map(n => n._id === id ? { ...n, isRead: true } : n)); } catch {} };
  const markAllRead = async () => { try { await API.put('/admin/notifications/read-all'); toast.success('All marked as read'); setNotifications(p => p.map(n => ({ ...n, isRead: true }))); } catch {} };

  const unread = notifications.filter(n => !n.isRead).length;
  const filtered = notifications.filter(n => filter === 'unread' ? !n.isRead : filter === 'read' ? n.isRead : true);

  const typeIcon = { risk_alert: FiAlertTriangle, prediction: FiInfo, system: FiMonitor, info: FiInfo };
  const typeCls = {
    risk_alert: { bg: 'bg-red-50', bdr: 'border-red-200', txt: 'text-red-700', badge: 'bg-red-100 text-red-700' },
    prediction: { bg: 'bg-blue-50', bdr: 'border-blue-200', txt: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
    system: { bg: 'bg-slate-50', bdr: 'border-slate-200', txt: 'text-slate-700', badge: 'bg-slate-100 text-slate-700' },
    info: { bg: 'bg-teal-50', bdr: 'border-teal-200', txt: 'text-teal-700', badge: 'bg-teal-100 text-teal-700' },
  };

  const timeAgo = (d) => { const s = Math.floor((new Date() - new Date(d)) / 1000); if (s < 60) return 'Just now'; if (s < 3600) return `${Math.floor(s / 60)}m ago`; if (s < 86400) return `${Math.floor(s / 3600)}h ago`; if (s < 604800) return `${Math.floor(s / 86400)}d ago`; return new Date(d).toLocaleDateString(); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-800 flex items-center gap-2">
            <span>Notifications</span>
            {unread > 0 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-red-500 text-white text-[10px] font-bold">{unread}</span>}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Attendance alerts and system updates</p>
        </div>
        {unread > 0 && (
          <motion.button onClick={markAllRead} whileTap={{ scale: 0.97 }} className="btn-outline text-xs py-2 px-4">
            <FiCheckCircle size={14} style={{ flexShrink: 0 }} /> <span>Mark all read</span>
          </motion.button>
        )}
      </div>

      <div className="flex gap-2">
        {['all', 'unread', 'read'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${filter === f ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            style={filter === f ? { backgroundColor: '#1e3a5f' } : {}}>
            {f}{f === 'unread' && unread > 0 ? ` (${unread})` : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-slate-200 border-t-slate-700 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center depth-layer">
          <FiBell className="mx-auto text-slate-300 mb-3" size={32} />
          <p className="text-slate-700 font-semibold">{filter === 'unread' ? 'All caught up!' : 'No notifications yet'}</p>
          <p className="text-slate-400 text-sm mt-1">{filter === 'unread' ? 'No unread notifications' : 'Upload sheets to receive alerts'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((n, i) => {
              const c = typeCls[n.type] || typeCls.info;
              const Icon = typeIcon[n.type] || FiInfo;
              return (
                <motion.div key={n._id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ delay: i * 0.02 }}
                  className={`bg-white rounded-xl border p-4 flex gap-3 items-start transition-all group ${n.isRead ? 'border-slate-200 opacity-60 hover:opacity-100' : `${c.bdr} border-l-[3px]`}`}>
                  <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={c.txt} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-sm font-semibold ${n.isRead ? 'text-slate-500' : 'text-slate-800'}`}>{n.title}</h4>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${c.badge}`}>{n.type?.replace('_', ' ')}</span>
                      {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse-soft flex-shrink-0" />}
                    </div>
                    <p className={`text-xs mt-1 ${n.isRead ? 'text-slate-400' : 'text-slate-600'}`}>{n.message}</p>
                    <p className="text-[10px] text-slate-300 mt-1.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <button onClick={() => markRead(n._id)} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition opacity-0 group-hover:opacity-100 flex-shrink-0">
                      <FiCheck size={14} />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default Notifications;