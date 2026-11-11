import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Inbox,
  Users,
  Calendar,
  ShoppingBag,
  Building2,
  Radio,
  X,
  LogOut,
  Kanban,
  BarChart3,
  LogIn,
  UserPlus,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCrm } from '../../context/CrmContext';
import { getInitials } from '../../utils/helpers';

export default function Sidebar({ isOpen, onClose }) {
  const { user, isAuthenticated, isGuest, logout } = useAuth();
  const { isLiveMode } = useCrm();
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: 'Today', path: '/', badge: 23 },
    { icon: Inbox, label: 'Inbox', path: '/inbox' },
    { icon: Users, label: 'Leads', path: '/leads' },
    { icon: Kanban, label: 'Pipeline', path: '/pipeline' },
    { icon: Calendar, label: 'Schedule', path: '/schedule' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics', adminOnly: true },
    { icon: ShoppingBag, label: 'Marketplace', path: '/marketplace' },
    { icon: Building2, label: 'Supply Hub', path: '/supply' },
    { icon: Radio, label: 'Outreach', path: '/outreach' },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={onClose} />
      )}
      <motion.aside
        initial={false}
        className={`fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-border z-40 flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform duration-200`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-border bg-sidebar">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-sm">
              <Building2 size={16} className="text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-[15px] text-primary leading-tight">Gharpayy</div>
              <div className="text-[11px] text-muted">Arena Infrastructure</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-secondary hover:text-primary transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Workspace identifier & Mode */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider font-semibold">
            <span className="text-secondary">Workspace</span>
            {isLiveMode ? (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live DB
              </span>
            ) : (
              <span className="text-[10px] bg-accent/20 text-accent font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles size={10} /> Demo
              </span>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            // In Guest Mode, allow viewing all modules (including Analytics).
            // In Authenticated Mode, hide adminOnly items from agents.
            if (isAuthenticated && item.adminOnly && user?.role !== 'admin') {
              return null;
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150 group
                  ${
                    isActive
                      ? 'bg-accent/10 text-accent font-medium dark:bg-accent/20 dark:text-accent-hover'
                      : 'text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5'
                  }`
                }
              >
                <item.icon size={16} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-sm">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Account Section */}
        <div className="border-t border-border p-3 bg-sidebar">
          {isAuthenticated ? (
            <div className="p-2.5 rounded-xl bg-surface border border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-accent rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                  {getInitials(user?.name || 'User')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-primary truncate">{user?.name || 'Authenticated User'}</div>
                  <div className="text-[11px] text-muted truncate">{user?.email || ''}</div>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[9px] bg-accent/20 text-accent font-bold px-1.5 py-0.2 rounded uppercase">
                      {user?.role || 'AGENT'}
                    </span>
                    <span className="text-[9px] text-emerald-500 font-semibold">• Live</span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="text-secondary hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors"
                  title="Sign out to Demo Mode"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-surface border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-accent" />
                <span className="text-xs font-bold text-primary">Guest / Demo Mode</span>
              </div>
              <p className="text-[11px] text-muted mb-3 leading-snug">
                You are exploring with sample data. Sign in or register to save real leads in MongoDB.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    navigate('/login');
                    onClose?.();
                  }}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-main hover:bg-black/5 dark:hover:bg-white/5 border border-border text-primary text-xs font-medium rounded-lg transition-all"
                >
                  <LogIn size={13} className="text-accent" />
                  Sign In
                </button>
                <button
                  onClick={() => {
                    navigate('/signup');
                    onClose?.();
                  }}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-accent hover:bg-accent-hover text-white text-xs font-medium rounded-lg transition-all shadow-sm"
                >
                  <UserPlus size={13} />
                  Register
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}
