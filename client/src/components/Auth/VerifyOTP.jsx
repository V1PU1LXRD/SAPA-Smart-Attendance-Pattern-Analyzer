import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiShield } from 'react-icons/fi';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const refs = useRef([]);

  const handleChange = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const n = [...otp]; n[i] = v; setOtp(n);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const n = [...otp];
    p.split('').forEach((c, i) => { n[i] = c; });
    setOtp(n);
    refs.current[Math.min(p.length, 5)]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Enter the full 6-digit code'); return; }
    setLoading(true);
    try {
      const res = await API.post('/auth/verify-otp', { email, otp: code });
      toast.success('Email verified!');
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    try { await API.post('/auth/resend-otp', { email }); toast.success('New OTP sent'); }
    catch { toast.error('Failed to resend'); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left */}
      <div className="hidden lg:flex lg:w-[45%] auth-panel-bg relative overflow-hidden flex-col justify-center items-center p-12">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-white/10 flex items-center justify-center mb-6">
            <FiShield className="text-white" size={36} />
          </div>
          <h2 className="text-white font-heading font-bold text-3xl mb-3">Verify your identity</h2>
          <p className="text-slate-300 text-sm max-w-sm leading-relaxed">We sent a 6-digit verification code to your email. Enter it to complete registration.</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: '#f8fafc' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-[420px] text-center">
          <div className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: '#1e3a5f' }}>
            <FiShield className="text-white" size={24} />
          </div>
          <h2 className="font-heading font-bold text-2xl text-slate-800 mb-1">Enter verification code</h2>
          <p className="text-slate-500 text-sm mb-8">Code sent to <span className="font-semibold text-slate-700">{email}</span></p>

          <form onSubmit={handleVerify} className="space-y-8">
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {otp.map((d, i) => (
                <motion.input
                  key={i}
                  ref={(el) => (refs.current[i] = el)}
                  type="text" inputMode="numeric" maxLength={1} value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKey(i, e)}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`w-12 h-14 text-center text-xl font-bold font-heading rounded-lg border-2 outline-none transition-all duration-200 ${
                    d ? 'border-teal-500 bg-white text-slate-800' : 'border-slate-300 bg-white text-slate-800'
                  } focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20`}
                />
              ))}
            </div>

            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }} className="w-full btn-primary py-3">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" style={{ flexShrink: 0 }} />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify & Continue</span>
              )}
            </motion.button>
          </form>

          <p className="text-slate-500 text-sm mt-6">
            Didn't receive the code?{' '}
            <button onClick={handleResend} className="text-teal-600 font-semibold hover:underline">Resend</button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyOTP;