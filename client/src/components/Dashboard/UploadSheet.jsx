import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { FiDownload, FiUpload, FiCheck, FiFile, FiX, FiAlertCircle } from 'react-icons/fi';

const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const UploadSheet = () => {
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState('');
  const [sheetType, setSheetType] = useState('weekly');
  const [periodLabel, setPeriodLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef(null);

  const handleTemplate = async () => {
    try {
      const res = await API.get('/attendance/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.setAttribute('download', 'attendance_template.xlsx');
      document.body.appendChild(a); a.click(); a.remove();
      toast.success('Template downloaded');
    } catch { toast.error('Download failed'); }
  };

  const handleDrag = (e) => { e.preventDefault(); setDragActive(e.type === 'dragenter' || e.type === 'dragover'); };
  const handleDrop = (e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Select a file first');
    if (!subject || !periodLabel) return toast.error('Fill all fields');
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file); fd.append('subject', subject); fd.append('sheetType', sheetType); fd.append('periodLabel', periodLabel);
    try {
      const res = await API.post('/attendance/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Analysis complete!'); setResult(res.data); setFile(null); setSubject(''); setPeriodLabel('');
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setLoading(false); }
  };

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="max-w-3xl mx-auto space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-heading font-bold text-slate-800">Upload Attendance Sheet</h1>
        <p className="text-slate-500 text-sm mt-1">Upload filled attendance data for analysis</p>
      </motion.div>

      {/* Step 1 */}
      <motion.div variants={item} className="bg-white rounded-xl border border-slate-200 p-5 depth-layer">
        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-lg text-white flex items-center justify-center text-sm font-bold font-heading flex-shrink-0" style={{ backgroundColor: '#1e3a5f' }}>1</div>
          <div className="flex-1">
            <h3 className="font-heading font-bold text-slate-800 text-sm mb-1">Download Template</h3>
            <p className="text-slate-500 text-xs mb-3">Columns: <span className="font-semibold text-slate-700">RollNo, StudentName, TotalClasses, ClassesAttended</span></p>
            <motion.button onClick={handleTemplate} whileTap={{ scale: 0.97 }} className="btn-outline text-xs py-2 px-4">
              <FiDownload size={14} className="flex-shrink-0" /><span>Download .xlsx</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Step 2 */}
      <motion.div variants={item} className="bg-white rounded-xl border border-slate-200 p-5 depth-layer">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center text-sm font-bold font-heading flex-shrink-0">2</div>
          <div>
            <h3 className="font-heading font-bold text-slate-800 text-sm mb-1">Fill Details & Upload</h3>
            <p className="text-slate-500 text-xs">Provide subject info and upload the completed sheet</p>
          </div>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label-official">Subject</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="e.g. Data Structures" className="input-official" />
            </div>
            <div>
              <label className="label-official">Sheet Type</label>
              <select value={sheetType} onChange={(e) => setSheetType(e.target.value)} className="input-official" style={{ backgroundColor: '#fff' }}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="label-official">Period Label</label>
              <input type="text" value={periodLabel} onChange={(e) => setPeriodLabel(e.target.value)} required placeholder="e.g. Week 1" className="input-official" />
            </div>
          </div>

          <div
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${dragActive ? 'border-teal-500 bg-teal-50' : file ? 'border-teal-400 bg-teal-50/50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}`}
          >
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
            {file ? (
              <div className="flex flex-col items-center">
                <FiFile className="text-teal-600 mb-2" size={28} />
                <p className="font-medium text-slate-800 text-sm">{file.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-xs text-red-500 hover:underline mt-2 flex items-center gap-1">
                  <FiX size={12} className="flex-shrink-0" /><span>Remove</span>
                </button>
              </div>
            ) : (
              <div>
                <FiUpload className="text-slate-400 mx-auto mb-2" size={28} />
                <p className="text-sm text-slate-600 font-medium">Drop your file here or click to browse</p>
                <p className="text-xs text-slate-400 mt-1">Accepts .xlsx, .xls, .csv — Max 5MB</p>
              </div>
            )}
          </div>

          <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }} className="w-full btn-primary py-3">
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" /><span>Analyzing...</span></>
            ) : (
              <><FiUpload size={15} className="flex-shrink-0" /><span>Upload & Analyze</span></>
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-xl border border-slate-200 p-5 depth-layer space-y-4">
            <div className="flex items-center gap-2">
              <FiCheck size={18} className="text-teal-600 flex-shrink-0" />
              <h3 className="font-heading font-bold text-slate-800 text-sm">Analysis Results</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Students', value: result.analysis.totalStudents, cls: 'bg-slate-50 text-slate-800' },
                { label: 'At Risk', value: result.analysis.atRisk, cls: 'bg-amber-50 text-amber-800' },
                { label: 'Risk Score', value: `${result.analysis.riskScore}/100`, cls: 'bg-red-50 text-red-800' },
                { label: 'Safe', value: result.analysis.totalStudents - result.analysis.atRisk, cls: 'bg-emerald-50 text-emerald-800' },
              ].map(s => (
                <div key={s.label} className={`${s.cls} rounded-lg p-3 text-center`}>
                  <p className="text-xl font-heading font-bold num">{s.value}</p>
                  <p className="text-[11px] font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            {result.analysis.alerts.length > 0 && (
              <div className="space-y-2 mt-3">
                <div className="flex items-center gap-2">
                  <FiAlertCircle size={15} className="text-amber-500 flex-shrink-0" />
                  <h4 className="text-sm font-semibold text-slate-700">Alerts</h4>
                </div>
                {result.analysis.alerts.slice(0, 5).map((a, i) => (
                  <div key={i} className={`px-3 py-2 rounded-lg text-xs font-medium ${a.level === 'critical' ? 'status-critical' : 'status-risk'}`}>
                    {a.level === 'critical' ? '🔴' : '🟡'} {a.message}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UploadSheet;