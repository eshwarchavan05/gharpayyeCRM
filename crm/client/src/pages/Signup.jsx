import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, User, Mail, Lock, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, validatePassword, isValidName } from '../utils/validation';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'agent' });
  const [touched, setTouched] = useState({ name: false, email: false, password: false });
  const [loading, setLoading] = useState(false);

  const nameVal = isValidName(form.name);
  const emailVal = isValidEmail(form.email);
  const pwdVal = validatePassword(form.password);

  const isFormValid = nameVal.isValid && emailVal && pwdVal.isValid;

  const handleBlur = (field) => setTouched(t => ({ ...t, [field]: true }));
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    
    if (!isFormValid) return;
    
    setLoading(true);
    try {
      await signup(form.name.trim(), form.email.trim(), form.password, form.role);
      toast.success('Account securely created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-main flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-accent-fade rounded-full blur-3xl opacity-50" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4 shadow-sm">
            <Building2 size={24} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-primary">Create Account</h1>
          <p className="text-muted text-sm mt-1">Join the Gharpayy CRM operating system</p>
        </div>

        <div className="card p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* NAME */}
            <div>
              <label className="text-xs font-semibold text-secondary mb-1.5 block uppercase tracking-wider">Full name</label>
              <div className="relative">
                <User size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${touched.name && !nameVal.isValid ? 'text-red-500' : 'text-muted'}`} />
                <input 
                  className={`input w-full pl-9 transition-colors ${touched.name && !nameVal.isValid ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  placeholder="John Doe" 
                  value={form.name} 
                  onChange={e => set('name', e.target.value)} 
                  onBlur={() => handleBlur('name')}
                />
              </div>
              <AnimatePresence>
                {touched.name && !nameVal.isValid && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1.5"><AlertCircle size={12}/>{nameVal.error}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-xs font-semibold text-secondary mb-1.5 block uppercase tracking-wider">Work Email</label>
              <div className="relative">
                <Mail size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${touched.email && !emailVal ? 'text-red-500' : 'text-muted'}`} />
                <input 
                  className={`input w-full pl-9 transition-colors ${touched.email && !emailVal ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  type="email" 
                  placeholder="you@company.com" 
                  value={form.email} 
                  onChange={e => set('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                />
              </div>
              <AnimatePresence>
                {touched.email && !emailVal && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1.5"><AlertCircle size={12}/>Enter a valid professional email address</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-xs font-semibold text-secondary mb-1.5 block uppercase tracking-wider">Password</label>
              <div className="relative mb-2">
                <Lock size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${touched.password && !pwdVal.isValid ? 'text-red-500' : 'text-muted'}`} />
                <input 
                  className={`input w-full pl-9 transition-colors ${touched.password && !pwdVal.isValid ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  type="password" 
                  placeholder="Min 8 characters" 
                  value={form.password} 
                  onChange={e => set('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                />
              </div>
              
              {/* Password strength indicator */}
              {(form.password.length > 0) && (
                <div className="space-y-1.5 mt-2">
                  <div className="flex gap-1 h-1 w-full">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`flex-1 rounded-full transition-colors duration-300 ${pwdVal.score >= i * 20 ? (pwdVal.isValid ? 'bg-green-500' : 'bg-accent') : 'bg-border'}`} />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <div className={`text-[10px] flex items-center gap-1 transition-colors ${form.password.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-muted'}`}>
                      <CheckCircle2 size={10} /> 8+ Characters
                    </div>
                    <div className={`text-[10px] flex items-center gap-1 transition-colors ${/[A-Z]/.test(form.password) ? 'text-green-600 dark:text-green-400' : 'text-muted'}`}>
                      <CheckCircle2 size={10} /> 1 Uppercase
                    </div>
                    <div className={`text-[10px] flex items-center gap-1 transition-colors ${/[0-9]/.test(form.password) ? 'text-green-600 dark:text-green-400' : 'text-muted'}`}>
                      <CheckCircle2 size={10} /> 1 Number
                    </div>
                    <div className={`text-[10px] flex items-center gap-1 transition-colors ${/[^A-Za-z0-9]/.test(form.password) ? 'text-green-600 dark:text-green-400' : 'text-muted'}`}>
                      <CheckCircle2 size={10} /> 1 Special Chars
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ROLE */}
            <div>
              <label className="text-xs font-semibold text-secondary mb-1.5 block uppercase tracking-wider">Account Role</label>
              <select className="input w-full font-medium" value={form.role} onChange={e => set('role', e.target.value)}>
                <option value="agent">Sales Agent</option>
                <option value="admin">System Admin</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading || ((touched.name || touched.email || touched.password) && !isFormValid)} 
              className={`btn-primary w-full flex items-center justify-center gap-2 py-2.5 mt-6 ${((touched.name || touched.email || touched.password) && !isFormValid) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap size={14} />}
              Create Account
            </button>
          </form>

          <p className="text-center text-sm text-secondary mt-6">
            Already have an account? <Link to="/login" className="text-accent hover:text-accent-hover font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
