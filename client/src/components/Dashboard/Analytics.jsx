import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { FiSearch, FiTrendingUp, FiTrendingDown, FiMinus, FiTarget, FiActivity, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const tt = { background: '#102a43', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontFamily: 'Inter' };

const IconBox = ({ children }) => (
  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center pointer-events-none">
    {children}
  </div>
);

const Analytics = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [studentRoll, setStudentRoll] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    setSubjectsLoading(true);
    try { const res = await API.get('/analytics/dashboard'); setSubjects(res.data.subjects || []); }
    catch { toast.error('Failed to load subjects'); }
    finally { setSubjectsLoading(false); }
  };

  const fetchSubjectAnalytics = async (subj) => {
    setSelectedSubject(subj);
    setAnalytics(null);
    setError(null);
    setLoading(true);
    try {
      const res = await API.get(`/analytics/subject/${encodeURIComponent(subj)}`);
      if (res.data) { setAnalytics(res.data); }
      else { setError('No data returned'); }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load analytics';
      setError(msg);
      toast.error(msg);
      setAnalytics(null);
    } finally { setLoading(false); }
  };

  const fetchStudentAnalytics = async () => {
    if (!studentRoll.trim()) { toast.error('Enter a roll number'); return; }
    setLoading(true);
    setStudentData(null);
    try {
      const res = await API.get(`/analytics/student/${encodeURIComponent(studentRoll.trim())}`);
      setStudentData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'No data found');
      setStudentData(null);
    } finally { setLoading(false); }
  };

  const TrendBadge = ({ trend }) => {
    const c = {
      improving: { icon: FiTrendingUp, text: 'Improving', cls: 'status-safe' },
      declining: { icon: FiTrendingDown, text: 'Declining', cls: 'status-critical' },
      stable: { icon: FiMinus, text: 'Stable', cls: 'bg-slate-50 text-slate-600 border border-slate-200' },
      insufficient_data: { icon: FiMinus, text: 'Needs More Data', cls: 'bg-slate-50 text-slate-600 border border-slate-200' },
    }[trend] || { icon: FiMinus, text: 'Stable', cls: 'bg-slate-50 text-slate-600 border border-slate-200' };
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold ${c.cls}`}>
        <Icon size={12} className="flex-shrink-0" />
        <span>{c.text}</span>
      </span>
    );
  };

  const riskColor = (s) => s < 30 ? 'text-emerald-700' : s < 60 ? 'text-amber-700' : 'text-red-700';
  const riskBar = (s) => s < 30 ? 'bg-emerald-500' : s < 60 ? 'bg-amber-500' : 'bg-red-500';
  const riskLabel = (s) => s < 30 ? 'Low Risk' : s < 60 ? 'Medium Risk' : 'High Risk';

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }} className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-heading font-bold text-slate-800">Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Deep analysis of attendance patterns, predictions, and risk scores</p>
      </motion.div>

      {/* Subject Selector */}
      <motion.div variants={item} className="bg-white rounded-xl border border-slate-200 p-5 depth-layer">
        <div className="flex justify-between items-center mb-3">
          <p className="label-official" style={{ marginBottom: 0 }}>Select Subject</p>
          <button onClick={fetchSubjects} className="text-xs text-slate-500 hover:text-teal-600 transition flex items-center gap-1.5">
            <FiRefreshCw size={12} className="flex-shrink-0" /><span>Refresh</span>
          </button>
        </div>
        {subjectsLoading ? (
          <div className="flex items-center gap-2 py-2">
            <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
            <span className="text-slate-400 text-sm">Loading subjects...</span>
          </div>
        ) : subjects.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {subjects.map((s) => (
              <motion.button key={s} onClick={() => fetchSubjectAnalytics(s)} whileTap={{ scale: 0.96 }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedSubject === s ? 'text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                style={selectedSubject === s ? { backgroundColor: '#1e3a5f' } : {}}>
                {s}
              </motion.button>
            ))}
          </div>
        ) : <p className="text-slate-400 text-sm py-2">No subjects found. Upload attendance sheets first.</p>}
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-[3px] border-slate-200 border-t-slate-700 rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Analyzing attendance data...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
          <FiAlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 font-semibold text-sm">Failed to load analytics</p>
            <p className="text-red-600 text-xs mt-1">{error}</p>
            <button onClick={() => selectedSubject && fetchSubjectAnalytics(selectedSubject)} className="text-xs text-red-600 font-semibold hover:underline mt-2 inline-flex items-center gap-1.5">
              <FiRefreshCw size={12} className="flex-shrink-0" /><span>Try again</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Analytics Results */}
      <AnimatePresence>
        {analytics && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl border border-slate-200 p-5 depth-layer">
                <div className="flex items-center gap-2 mb-2">
                  <FiActivity size={15} className="text-teal-600 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-500">Predicted Attendance</span>
                </div>
                <p className="text-3xl font-heading font-bold text-slate-800 num">
                  {analytics.prediction?.predicted != null ? `${analytics.prediction.predicted}%` : 'N/A'}
                </p>
                <div className="mt-2"><TrendBadge trend={analytics.prediction?.trend || 'stable'} /></div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl border border-slate-200 p-5 depth-layer">
                <div className="flex items-center gap-2 mb-2">
                  <FiTarget size={15} className="text-red-500 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-500">Subject Risk Score</span>
                </div>
                <p className={`text-3xl font-heading font-bold num ${riskColor(analytics.riskScore || 0)}`}>{analytics.riskScore ?? 0}/100</p>
                <div className="mt-2.5 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${analytics.riskScore || 0}%` }} transition={{ duration: 0.8 }} className={`h-full rounded-full ${riskBar(analytics.riskScore || 0)}`} />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{riskLabel(analytics.riskScore || 0)}</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl border border-slate-200 p-5 depth-layer">
                <div className="flex items-center gap-2 mb-2">
                  <FiTrendingUp size={15} className="text-slate-500 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-500">Historical Average</span>
                </div>
                <p className="text-3xl font-heading font-bold text-slate-800 num">
                  {analytics.prediction?.historicalAvg != null ? `${analytics.prediction.historicalAvg}%` : 'N/A'}
                </p>
                <p className="text-xs text-slate-400 mt-2">Based on {analytics.totalRecords || 0} upload{(analytics.totalRecords || 0) !== 1 ? 's' : ''}</p>
              </motion.div>
            </div>

            {/* Chart */}
            {analytics.trendData?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-xl border border-slate-200 p-6 depth-layer">
                <h4 className="font-heading font-bold text-slate-800 text-sm mb-5">Attendance Trend — {analytics.subject}</h4>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={analytics.trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={tt} />
                    <Line type="monotone" dataKey="avgAttendance" stroke="#1e3a5f" strokeWidth={2.5} dot={{ fill: '#1e3a5f', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, stroke: '#1e3a5f', strokeWidth: 2, fill: '#fff' }} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Alerts */}
            {analytics.alerts?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-xl border border-slate-200 p-5 depth-layer">
                <h4 className="font-heading font-bold text-slate-800 text-sm mb-3">Risk Alerts ({analytics.alerts.length})</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {analytics.alerts.map((a, i) => (
                    <div key={i} className={`px-3 py-2.5 rounded-lg text-xs font-medium ${a.level === 'critical' ? 'status-critical' : 'status-risk'}`}>
                      {a.level === 'critical' ? '🔴' : '🟡'} {a.message}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {analytics.alerts?.length === 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <p className="text-emerald-700 text-sm font-medium">✅ All students in {analytics.subject} are above the 75% threshold</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Student Search */}
      <motion.div variants={item} className="bg-white rounded-xl border border-slate-200 p-5 depth-layer">
        <h3 className="font-heading font-bold text-slate-800 text-sm mb-1">Student Lookup</h3>
        <p className="text-xs text-slate-400 mb-3">Search by roll number to view attendance across all subjects</p>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <IconBox><FiSearch size={16} className="text-slate-400" /></IconBox>
            <input
              type="text"
              value={studentRoll}
              onChange={(e) => setStudentRoll(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchStudentAnalytics()}
              className="input-official"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Enter Roll No (e.g. CS101)"
            />
          </div>
          <motion.button onClick={fetchStudentAnalytics} whileTap={{ scale: 0.97 }} className="btn-primary px-5">
            <span>Search</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Student Results */}
      <AnimatePresence>
        {studentData && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-xl border border-slate-200 p-5 depth-layer">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg text-white flex items-center justify-center text-sm font-bold font-heading flex-shrink-0" style={{ backgroundColor: '#1e3a5f' }}>
                {studentData.studentName?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <h4 className="font-heading font-bold text-slate-800 text-sm">{studentData.studentName || 'Unknown'}</h4>
                <p className="text-xs text-slate-500">Roll No: {studentData.rollNo}</p>
              </div>
            </div>
            <div className="space-y-3">
              {Object.entries(studentData.subjectWise).map(([subj, history]) => (
                <div key={subj} className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
                  <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                    <h5 className="text-sm font-semibold text-slate-800">{subj}</h5>
                    <div className="flex items-center gap-2">
                      {studentData.subjectPredictions[subj]?.predicted != null && (
                        <span className="text-[11px] font-semibold bg-slate-50 text-slate-700 px-2.5 py-1 rounded-md">
                          Predicted: {studentData.subjectPredictions[subj].predicted}%
                        </span>
                      )}
                      {studentData.subjectPredictions[subj]?.trend && <TrendBadge trend={studentData.subjectPredictions[subj].trend} />}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {history.map((h, i) => (
                      <span key={i} className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${h.status === 'Safe' ? 'status-safe' : h.status === 'At Risk' ? 'status-risk' : 'status-critical'}`}>
                        {h.period}: {h.percentage}%
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Analytics;