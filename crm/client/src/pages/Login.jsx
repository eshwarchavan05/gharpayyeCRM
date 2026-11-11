import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Mail, Lock, Eye, EyeOff, Zap, AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { isValidEmail } from '../utils/validation';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailVal = isValidEmail(form.email);
  const isFormValid = emailVal && form.password.length > 0;

  const handleBlur = (field) => setTouched((t) => ({ ...t, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!isFormValid) return;

    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      toast.success('Welcome back! Logged into live account.');
      navigate('/');
    } catch (err) {
      const data = err.response?.data;
      const serverMsg = typeof data === 'object' && data !== null && typeof data.message === 'string' ? data.message : null;
      let msg;
      if (serverMsg) {
        msg = serverMsg;
      } else if (!err.response) {
        msg = 'Backend server is unreachable. You can continue exploring in Guest Mode.';
      } else if (err.response.status === 503) {
        msg = 'Database offline. Please check MONGO_URI in server configuration.';
      } else if ([502, 504].includes(err.response.status)) {
        msg = 'Backend server gateway error. Verify the server is running on port 5000.';
      } else {
        msg = 'Invalid email or password.';
      }
      toast.error(msg, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-main flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-fade rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl opacity-50" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors py-1.5 px-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 border border-border"
          >
            <ArrowLeft size={14} />
            <span>Back to Demo Dashboard</span>
          </button>
          <span className="text-[11px] text-accent font-semibold flex items-center gap-1">
            <Sparkles size={11} /> No login required for demo
          </span>
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-3 shadow-sm">
            <Building2 size={24} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-primary">Gharpayy CRM</h1>
          <p className="text-muted text-sm mt-0.5">Sign in to your authenticated account</p>
        </div>

        <div className="card p-6 md:p-8">
          <h2 className="text-lg font-bold text-primary mb-1">Welcome back</h2>
          <p className="text-xs text-secondary mb-6">Connect to your real database and synced workspace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-secondary mb-1.5 block uppercase tracking-wider">
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    touched.email && !emailVal ? 'text-red-500' : 'text-muted'
                  }`}
                />
                <input
                  className={`input w-full pl-9 transition-colors ${
                    touched.email && !emailVal ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                  }`}
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  onBlur={() => handleBlur('email')}
                />
              </div>
              <AnimatePresence>
                {touched.email && !emailVal && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1.5">
                      <AlertCircle size={12} />
                      Enter a valid email address
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label className="text-xs font-semibold text-secondary mb-1.5 block uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    touched.password && form.password.length === 0 ? 'text-red-500' : 'text-muted'
                  }`}
                />
                <input
                  className={`input w-full pl-9 pr-10 transition-colors ${
                    touched.password && form.password.length === 0
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : ''
                  }`}
                  type={show ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  onBlur={() => handleBlur('password')}
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || (touched.email && !isFormValid)}
              className={`btn-primary w-full flex items-center justify-center gap-2 py-2.5 mt-5 ${
                touched.email && !isFormValid ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Zap size={14} />
              )}
              Sign In with Credentials
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs font-medium text-secondary uppercase tracking-wider">or</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-surface hover:bg-black/5 dark:hover:bg-white/5 border border-border text-primary text-xs font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Sparkles size={14} className="text-accent" />
            Continue Exploring in Demo Mode
          </button>

          <p className="text-center text-xs text-secondary mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-accent hover:text-accent-hover font-semibold transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
