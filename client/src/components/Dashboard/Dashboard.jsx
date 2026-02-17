import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../../utils/api';
import { FiUpload, FiUsers, FiAlertTriangle, FiBookOpen, FiTrendingUp, FiArrowRight } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const PIE_COLORS = ['#059669', '#d97706', '#dc2626'];
const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.max(1, Math.ceil(value / 40));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 20);
    return () => clearInterval(timer);
  }, [value]);
  return <span className="num">{display}</span>;
};

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, r] = await Promise.all([API.get('/analytics/dashboard'), API.get('/attendance')]);
        setSummary(s.data);
        setRecords(r.data);
      } catch {}
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="w-8 h-8 border-3 border-navy-200 border-t-navy-900 rounded-full animate-spin" />
    </div>
  );

  const safe = Math.max(0, (summary?.totalStudentsTracked || 0) - (summary?.totalAtRisk || 0) - (summary?.totalCritical || 0));
  const pieData = [
    { name: 'Safe', value: safe },
    { name: 'At Risk', value: summary?.totalAtRisk || 0 },
    { name: 'Critical', value: summary?.totalCritical || 0 }
  ].filter(d => d.value > 0);

  const barData = records.slice(0, 8).map(r => ({
    name: r.subject.length > 12 ? r.subject.substring(0, 12) + '…' : r.subject,
    avg: r.students.length > 0 ? Math.round(r.students.reduce((s, st) => s + st.percentage, 0) / r.students.length) : 0
  }));

  const areaData = records.slice(0, 10).reverse().map((r, i) => ({
    period: r.periodLabel || `#${i + 1}`,
    attendance: r.students.length > 0 ? Math.round(r.students.reduce((s, st) => s + st.percentage, 0) / r.students.length) : 0,
  }));

  const stats = [
    { label: 'Total Uploads', value: summary?.totalUploads || 0, icon: FiUpload, color: 'text-navy-700', bg: 'bg-navy-50' },
    { label: 'Subjects Tracked', value: summary?.totalSubjects || 0, icon: FiBookOpen, color: 'text-accent-teal', bg: 'bg-emerald-50' },
    { label: 'Students At Risk', value: summary?.totalAtRisk || 0, icon: FiAlertTriangle, color: 'text-accent-gold', bg: 'bg-amber-50' },
    { label: 'Critical Alerts', value: summary?.totalCritical || 0, icon: FiUsers, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const customTooltip = { background: '#102a43', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontFamily: 'Inter' };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Page Title */}
      <motion.div variants={item} className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-heading font-bold text-navy-900">Dashboard</h1>
          <p className="text-navy-500 text-sm mt-1">Overview of attendance analytics across all subjects</p>
        </div>
        <Link to="/upload">
          <motion.button whileTap={{ scale: 0.97 }} className="btn-teal">
            <FiUpload size={15} /> Upload Sheet
          </motion.button>
        </Link>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={item}
              className="bg-white rounded-xl border border-ivory-300 p-5 card-official">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-navy-500 font-medium mb-1">{stat.label}</p>
                  <p className="text-3xl font-heading font-bold text-navy-900">
                    <AnimatedNumber value={stat.value} />
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <Icon className={stat.color} size={18} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <motion.div variants={item} className="lg:col-span-2 bg-white rounded-xl border border-ivory-300 p-6 depth-layer">
          <div className="flex items-center gap-2 mb-5">
            <FiTrendingUp className="text-accent-teal" size={17} />
            <h3 className="font-heading font-bold text-navy-800 text-sm">Attendance Trend</h3>
          </div>
          {areaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#829ab1' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#829ab1' }} />
                <Tooltip contentStyle={customTooltip} />
                <Area type="monotone" dataKey="attendance" stroke="#0d9488" strokeWidth={2.5} fill="url(#tealGrad)" dot={{ fill: '#0d9488', r: 3, strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="text-navy-400 text-sm text-center py-16">Upload attendance sheets to see trends</p>}
        </motion.div>

        {/* Pie Chart */}
        <motion.div variants={item} className="bg-white rounded-xl border border-ivory-300 p-6 depth-layer">
          <h3 className="font-heading font-bold text-navy-800 text-sm mb-5">Risk Distribution</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={customTooltip} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-3">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                    <span className="text-xs text-navy-600 font-medium">{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-navy-400 text-sm text-center py-16">No data yet</p>}
        </motion.div>
      </div>

      {/* Bar Chart */}
      {barData.length > 0 && (
        <motion.div variants={item} className="bg-white rounded-xl border border-ivory-300 p-6 depth-layer">
          <h3 className="font-heading font-bold text-navy-800 text-sm mb-5">Subject-wise Average Attendance (%)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#829ab1' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#829ab1' }} />
              <Tooltip contentStyle={customTooltip} />
              <Bar dataKey="avg" radius={[4, 4, 0, 0]} fill="#1e3a5f" barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Recent Uploads Table */}
      <motion.div variants={item} className="bg-white rounded-xl border border-ivory-300 depth-layer overflow-hidden">
        <div className="px-6 py-4 border-b border-ivory-300 flex justify-between items-center">
          <h3 className="font-heading font-bold text-navy-800 text-sm">Recent Uploads</h3>
          <Link to="/upload" className="text-xs text-accent-teal font-semibold hover:underline flex items-center gap-1">
            View all <FiArrowRight size={12} />
          </Link>
        </div>
        {records.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="bg-ivory-100">
                <th className="text-left text-[11px] font-semibold text-navy-500 uppercase tracking-wider px-6 py-3">Subject</th>
                <th className="text-left text-[11px] font-semibold text-navy-500 uppercase tracking-wider px-6 py-3">Type</th>
                <th className="text-left text-[11px] font-semibold text-navy-500 uppercase tracking-wider px-6 py-3">Period</th>
                <th className="text-left text-[11px] font-semibold text-navy-500 uppercase tracking-wider px-6 py-3">Students</th>
                <th className="text-left text-[11px] font-semibold text-navy-500 uppercase tracking-wider px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {records.slice(0, 5).map((r) => (
                <tr key={r._id} className="border-t border-ivory-300 hover:bg-ivory-50 transition-colors">
                  <td className="px-6 py-3.5 text-sm font-medium text-navy-800">{r.subject}</td>
                  <td className="px-6 py-3.5">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${r.sheetType === 'weekly' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                      {r.sheetType}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-navy-600">{r.periodLabel}</td>
                  <td className="px-6 py-3.5 text-sm text-navy-600 num">{r.students.length}</td>
                  <td className="px-6 py-3.5 text-sm text-navy-400">{new Date(r.uploadDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 px-6">
            <p className="text-navy-400 text-sm">No uploads yet. Start by uploading your first attendance sheet.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;