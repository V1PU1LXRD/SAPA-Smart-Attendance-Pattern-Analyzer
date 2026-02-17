import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

const IconBox = ({ children }) => (
  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center pointer-events-none">
    {children}
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/login', form);
      toast.success('Welcome back!');
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        toast.error('Please verify your email first');
        navigate('/verify-otp', { state: { email: err.response.data.email } });
      } else {
        toast.error(err.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Dark Panel */}
      <div className="hidden lg:flex lg:w-[45%] auth-panel-bg relative overflow-hidden flex-col justify-between p-12">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <span className="text-3xl">🎓</span>
            <div>
              <h1 className="text-white font-heading font-bold text-xl leading-tight">SAPA</h1>
              <p className="text-slate-400 text-xs tracking-widest uppercase">Smart Attendance Analyzer</p>
            </div>
          </div>
          <h2 className="text-white font-heading font-bold text-4xl leading-tight mb-6">
            Attendance intelligence<br />
            <span className="text-teal-400">for educators.</span>
          </h2>
          <p className="text-slate-300 text-base leading-relaxed max-w-md">
            Upload attendance sheets, discover patterns, predict risks, and take proactive action — all from one unified dashboard designed for college faculty.
          </p>
        </div>
        <div className="relative z-10 space-y-4">
          {['Predictive attendance analytics', 'Subject-wise risk scoring', 'Automated alert system'].map((text, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-teal-400" />
              </div>
              <span className="text-slate-300 text-sm font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Light Panel */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: '#f8fafc' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[400px]"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <span className="text-2xl">🎓</span>
            <h1 className="font-heading font-bold text-xl text-slate-800">SAPA</h1>
          </div>

          <h2 className="font-heading font-bold text-2xl text-slate-800 mb-1">Sign in to your account</h2>
          <p className="text-slate-500 text-sm mb-8">Enter your credentials to access the dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-official">Email Address</label>
              <div className="relative">
                <IconBox><FiMail size={16} className="text-slate-400" /></IconBox>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="faculty@college.edu"
                  className="input-official"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div>
              <label className="label-official">Password</label>
              <div className="relative">
                <IconBox><FiLock size={16} className="text-slate-400" /></IconBox>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="input-official"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }} className="w-full btn-primary py-3">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <FiArrowRight size={15} className="flex-shrink-0" />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal-600 font-semibold hover:underline">Create account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;