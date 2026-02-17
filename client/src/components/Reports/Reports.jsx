import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { FiEdit, FiTrash2, FiPlus, FiX, FiFileText } from 'react-icons/fi';

const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', subject: '', reportType: 'summary', notes: '' });
  const [records, setRecords] = useState([]);

  useEffect(() => { fetchReports(); fetchRecords(); }, []);
  const fetchReports = async () => { try { setReports((await API.get('/admin/reports')).data); } catch {} };
  const fetchRecords = async () => { try { setRecords((await API.get('/attendance')).data); } catch {} };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm({ title: '', subject: '', reportType: 'summary', notes: '' }); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, data: { generatedAt: new Date().toISOString(), recordsCount: records.length } };
      if (editing) { await API.put(`/admin/reports/${editing._id}`, payload); toast.success('Report updated'); }
      else { await API.post('/admin/reports', payload); toast.success('Report created'); }
      closeModal(); fetchReports();
    } catch { toast.error('Error saving report'); }
  };

  const handleEdit = (r) => { setEditing(r); setForm({ title: r.title, subject: r.subject, reportType: r.reportType, notes: r.notes }); setShowModal(true); };
  const handleDelete = async (id) => { if (!window.confirm('Delete?')) return; try { await API.delete(`/admin/reports/${id}`); toast.success('Deleted'); fetchReports(); } catch { toast.error('Error'); } };

  const typeBadge = { summary: 'bg-blue-50 text-blue-700', prediction: 'bg-purple-50 text-purple-700', risk: 'bg-red-50 text-red-700' };

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }} className="space-y-6">
      <motion.div variants={item} className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-800">Reports</h1>
          <p className="text-slate-500 text-sm mt-1">Create, edit, and manage analysis reports</p>
        </div>
        <motion.button onClick={() => { closeModal(); setShowModal(true); }} whileTap={{ scale: 0.97 }} className="btn-primary">
          <FiPlus size={15} style={{ flexShrink: 0 }} /> <span>New Report</span>
        </motion.button>
      </motion.div>

      {reports.length === 0 ? (
        <motion.div variants={item} className="bg-white rounded-xl border border-slate-200 p-16 text-center depth-layer">
          <FiFileText className="mx-auto text-slate-300 mb-3" size={36} />
          <p className="text-slate-700 font-semibold">No reports yet</p>
          <p className="text-slate-400 text-sm mt-1">Create your first analytics report</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <motion.div key={r._id} variants={item} layout className="bg-white rounded-xl border border-slate-200 p-5 flex justify-between items-start card-official group">
              <div className="flex gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg text-white flex items-center justify-center text-sm font-bold font-heading flex-shrink-0" style={{ backgroundColor: '#1e3a5f' }}>
                  {r.title.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading font-semibold text-slate-800 text-sm truncate">{r.title}</h3>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{r.subject}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${typeBadge[r.reportType] || ''}`}>{r.reportType}</span>
                  </div>
                  {r.notes && <p className="text-xs text-slate-400 mt-1.5 line-clamp-1">{r.notes}</p>}
                  <p className="text-[10px] text-slate-300 mt-1.5">{new Date(r.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-3 flex-shrink-0">
                <button onClick={() => handleEdit(r)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"><FiEdit size={15} /></button>
                <button onClick={() => handleDelete(r._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><FiTrash2 size={15} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25 }} className="bg-white rounded-xl w-full max-w-lg p-6" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }} onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-heading font-bold text-slate-800 text-lg">{editing ? 'Edit Report' : 'New Report'}</h2>
                <button onClick={closeModal} className="p-1.5 hover:bg-slate-100 rounded-lg transition"><FiX size={18} /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div><label className="label-official">Title</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Report title" className="input-official" /></div>
                <div><label className="label-official">Subject</label><input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required placeholder="Subject name" className="input-official" /></div>
                <div>
                  <label className="label-official">Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['summary', 'prediction', 'risk'].map(t => (
                      <button key={t} type="button" onClick={() => setForm({ ...form, reportType: t })}
                        className={`py-2.5 rounded-lg text-xs font-semibold capitalize transition-all ${form.reportType === t ? 'text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        style={form.reportType === t ? { backgroundColor: '#1e3a5f' } : {}}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div><label className="label-official">Notes (optional)</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Additional notes..." className="input-official resize-none" /></div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={closeModal} className="flex-1 btn-outline py-2.5">Cancel</button>
                  <motion.button type="submit" whileTap={{ scale: 0.97 }} className="flex-1 btn-primary py-2.5">{editing ? 'Update' : 'Create'}</motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Reports;