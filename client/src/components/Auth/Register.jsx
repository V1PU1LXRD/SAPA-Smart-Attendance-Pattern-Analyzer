import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiLock, FiArrowRight } from 'react-icons/fi';

const IconBox = ({ children }) => (
  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center pointer-events-none">
    {children}
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await API.post('/auth/register', form);
      if (res.data.emailSent === false) {
        toast(res.data.message, { icon: '⚠️', duration: 6000 });
      } else {
        toast.success(res.data.message);
      }
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name', type: 'text', label: 'Full Name', icon: FiUser, placeholder: 'Dr. John Doe' },
    { name: 'email', type: 'email', label: 'College Email', icon: FiMail, placeholder: 'faculty@college.edu' },
    { name: 'phone', type: 'tel', label: 'Phone Number', icon: FiPhone, placeholder: '+91 9876543210' },
    { name: 'password', type: 'password', label: 'Password', icon: FiLock, placeholder: 'Min 6 characters' },
    { name: 'confirmPassword', type: 'password', label: 'Confirm Password', icon: FiLock, placeholder: 'Repeat password' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Dark */}
      <div className="hidden lg:flex lg:w-[45%] auth-panel-bg relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <span className="text-3xl">🎓</span>
            <div>
              <h1 className="text-white font-heading font-bold text-xl leading-tight">SAPA</h1>
              <p className="text-slate-400 text-xs tracking-widest uppercase">Smart Attendance Analyzer</p>
            </div>
          </div>
          <h2 className="text-white font-heading font-bold text-4xl leading-tight mb-6">
            Join the platform<br /><span className="text-teal-400">built for faculty.</span>
          </h2>
          <p className="text-slate-300 text-base leading-relaxed max-w-md">
            Create your account to start analyzing attendance patterns, identifying at-risk students, and generating actionable reports.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">📊</span>
          </div>
          <div>
            <p className="text-white text-sm font-semibold">Analytics, not just entry</p>
            <p className="text-slate-400 text-xs mt-0.5">Upload sheets, get insights instantly</p>
          </div>
        </div>
      </div>

      {/* Right Light */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: '#f8fafc' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <span className="text-2xl">🎓</span>
            <h1 className="font-heading font-bold text-xl text-slate-800">SAPA</h1>
          </div>

          <h2 className="font-heading font-bold text-2xl text-slate-800 mb-1">Create faculty account</h2>
          <p className="text-slate-500 text-sm mb-6">Fill in your details to get started</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field, idx) => {
              const Icon = field.icon;
              return (
                <motion.div key={field.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <label className="label-official">{field.label}</label>
                  <div className="relative">
                    <IconBox><Icon size={16} className="text-slate-400" /></IconBox>
                    <input
                      type={field.type}
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      required
                      minLength={field.name === 'password' ? 6 : undefined}
                      placeholder={field.placeholder}
                      className="input-official"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </motion.div>
              );
            })}

            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }} className="w-full btn-primary py-3 mt-2">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <FiArrowRight size={15} className="flex-shrink-0" />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already registered?{' '}
            <Link to="/login" className="text-teal-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;