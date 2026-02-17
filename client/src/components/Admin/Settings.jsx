import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiLock, FiShield, FiSave, FiEye, FiEyeOff } from 'react-icons/fi';

const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const IconBox = ({ children }) => (
  <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center pointer-events-none">
    {children}
  </div>
);

const EyeBtn = ({ show, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
  >
    {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
  </button>
);

const Settings = () => {
  const { user, login } = useAuth();
  const [pf, setPf] = useState({ name: '', phone: '' });
  const [pin, setPin] = useState({ currentPin: '', newPin: '', confirmPin: '' });
  const [showC, setShowC] = useState(false);
  const [showN, setShowN] = useState(false);
  const [pfL, setPfL] = useState(false);
  const [pinL, setPinL] = useState(false);

  useEffect(() => { if (user) setPf({ name: user.name, phone: user.phone }); }, [user]);

  const handleProfile = async (e) => {
    e.preventDefault(); setPfL(true);
    try { const r = await API.put('/auth/update-profile', pf); toast.success('Profile updated'); login(r.data.user, localStorage.getItem('token')); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setPfL(false); }
  };

  const handlePin = async (e) => {
    e.preventDefault();
    if (pin.newPin !== pin.confirmPin) { toast.error('PINs do not match'); return; }
    if (!/^\d{4,6}$/.test(pin.newPin)) { toast.error('PIN must be 4-6 digits'); return; }
    setPinL(true);
    try { await API.put('/auth/change-pin', { currentPin: pin.currentPin, newPin: pin.newPin }); toast.success('PIN changed'); setPin({ currentPin: '', newPin: '', confirmPin: '' }); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setPinL(false); }
  };

  const match = pin.confirmPin && pin.newPin && pin.confirmPin === pin.newPin;
  const noMatch = pin.confirmPin && pin.newPin && pin.confirmPin !== pin.newPin;

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="max-w-2xl mx-auto space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-heading font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your profile and security preferences</p>
      </motion.div>

      {/* ===== PROFILE ===== */}
      <motion.div variants={item} className="bg-white rounded-xl border border-slate-200 depth-layer overflow-hidden">
        <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: '#1e3a5f' }}>
          <div className="w-12 h-12 rounded-lg bg-white/10 text-white flex items-center justify-center text-xl font-bold font-heading flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'F'}
          </div>
          <div className="min-w-0">
            <p className="text-white font-heading font-bold leading-tight">{user?.name}</p>
            <p className="text-slate-300 text-xs mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiUser size={16} className="text-teal-600 flex-shrink-0" />
            <h3 className="font-heading font-bold text-slate-800 text-sm">Profile Information</h3>
          </div>

          <form onSubmit={handleProfile} className="space-y-4">
            <div>
              <label className="label-official">Full Name</label>
              <div className="relative">
                <IconBox><FiUser size={16} className="text-slate-400" /></IconBox>
                <input type="text" value={pf.name} onChange={(e) => setPf({ ...pf, name: e.target.value })}
                  className="input-official" style={{ paddingLeft: '2.5rem' }} placeholder="Full name" />
              </div>
            </div>
            <div>
              <label className="label-official">Email (cannot change)</label>
              <div className="relative">
                <IconBox><FiMail size={16} className="text-slate-300" /></IconBox>
                <input type="email" value={user?.email || ''} disabled
                  className="input-official" style={{ paddingLeft: '2.5rem' }} />
              </div>
            </div>
            <div>
              <label className="label-official">Phone Number</label>
              <div className="relative">
                <IconBox><FiPhone size={16} className="text-slate-400" /></IconBox>
                <input type="tel" value={pf.phone} onChange={(e) => setPf({ ...pf, phone: e.target.value })}
                  className="input-official" style={{ paddingLeft: '2.5rem' }} placeholder="+91 9876543210" />
              </div>
            </div>
            <motion.button type="submit" disabled={pfL} whileTap={{ scale: 0.97 }} className="btn-teal">
              {pfL ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" /><span>Saving...</span></>
              ) : (
                <><FiSave size={15} className="flex-shrink-0" /><span>Update Profile</span></>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>

      {/* ===== PIN ===== */}
      <motion.div variants={item} className="bg-white rounded-xl border border-slate-200 depth-layer overflow-hidden">
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex items-center gap-2">
          <FiShield size={16} className="text-amber-600 flex-shrink-0" />
          <h3 className="font-heading font-bold text-amber-800 text-sm">Security PIN</h3>
        </div>

        <div className="p-6">
          <p className="text-xs text-slate-500 mb-4">
            Default PIN is <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 text-xs font-semibold">0000</code>. Change it to a 4-6 digit PIN.
          </p>

          <form onSubmit={handlePin} className="space-y-4">
            {/* Current PIN */}
            <div>
              <label className="label-official">Current PIN</label>
              <div className="relative">
                <IconBox><FiLock size={16} className="text-slate-400" /></IconBox>
                <input
                  type={showC ? 'text' : 'password'} maxLength={6} inputMode="numeric" required
                  value={pin.currentPin}
                  onChange={(e) => setPin({ ...pin, currentPin: e.target.value.replace(/\D/g, '') })}
                  className="input-official tracking-widest"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  placeholder="••••"
                />
                <EyeBtn show={showC} onClick={() => setShowC(!showC)} />
              </div>
            </div>

            {/* New PIN */}
            <div>
              <label className="label-official">New PIN</label>
              <div className="relative">
                <IconBox><FiLock size={16} className="text-slate-400" /></IconBox>
                <input
                  type={showN ? 'text' : 'password'} maxLength={6} inputMode="numeric" required
                  value={pin.newPin}
                  onChange={(e) => setPin({ ...pin, newPin: e.target.value.replace(/\D/g, '') })}
                  className="input-official tracking-widest"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  placeholder="••••••"
                />
                <EyeBtn show={showN} onClick={() => setShowN(!showN)} />
              </div>
              {pin.newPin && (
                <div className="flex gap-1 mt-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < pin.newPin.length ? 'bg-amber-500' : 'bg-slate-200'}`} />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm PIN */}
            <div>
              <label className="label-official">Confirm New PIN</label>
              <div className="relative">
                <IconBox><FiLock size={16} className="text-slate-400" /></IconBox>
                <input
                  type="password" maxLength={6} inputMode="numeric" required
                  value={pin.confirmPin}
                  onChange={(e) => setPin({ ...pin, confirmPin: e.target.value.replace(/\D/g, '') })}
                  className={`input-official tracking-widest ${match ? '!border-emerald-500 ring-2 ring-emerald-100' : noMatch ? '!border-red-500 ring-2 ring-red-100' : ''}`}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  placeholder="••••••"
                />
                {/* Match indicator */}
                <div className="absolute right-0 top-0 bottom-0 w-16 flex items-center justify-center pointer-events-none">
                  {match && <span className="text-emerald-500 text-xs font-bold">✓ Match</span>}
                  {noMatch && <span className="text-red-500 text-xs font-bold">✗</span>}
                </div>
              </div>
            </div>

            <motion.button type="submit" disabled={pinL} whileTap={{ scale: 0.97 }} className="btn-amber">
              {pinL ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" /><span>Changing...</span></>
              ) : (
                <><FiShield size={15} className="flex-shrink-0" /><span>Change PIN</span></>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>

      {/* ===== ACCOUNT INFO ===== */}
      <motion.div variants={item} className="bg-white rounded-xl border border-slate-200 p-6 depth-layer">
        <h3 className="label-official mb-4">Account Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Role', value: user?.role || 'Faculty', dot: 'bg-teal-500' },
            { label: 'Email Status', value: 'Verified', dot: 'bg-emerald-500' },
            { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'February 2026' },
            { label: 'Platform', value: 'SAPA v1.0' },
          ].map((info) => (
            <div key={info.label} className="bg-slate-50 rounded-lg p-4">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">{info.label}</p>
              <p className="text-sm font-semibold text-slate-700 mt-1 capitalize flex items-center gap-2">
                {info.dot && <span className={`w-2 h-2 rounded-full ${info.dot} flex-shrink-0`} />}
                <span>{info.value}</span>
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ===== DANGER ZONE ===== */}
      <motion.div variants={item} className="bg-white rounded-xl border border-red-200 p-6">
        <h3 className="text-sm font-heading font-bold text-red-700 mb-2">Danger Zone</h3>
        <p className="text-xs text-slate-500 mb-4">These actions are irreversible.</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => toast.error('Contact your administrator')} className="px-4 py-2 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition">
            Request Account Deletion
          </button>
          <button onClick={() => toast('Coming soon', { icon: 'ℹ️' })} className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
            Export My Data
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Settings;