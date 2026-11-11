import { useState } from 'react';
import { Search, Bell, Menu, Zap, Sun, Moon, PlusCircle, Kanban, LogIn, UserPlus, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCrm } from '../../context/CrmContext';
import { getInitials } from '../../utils/helpers';
import { useTheme } from '../../hooks/useTheme';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onMenuToggle, onAddLead, isPipMode, togglePipMode }) {
  const [search, setSearch] = useState('');
  const { user, isAuthenticated, isGuest, logout } = useAuth();
  const { isLiveMode } = useCrm();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-3 sm:px-6 sticky top-0 z-20 transition-colors duration-300">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-secondary hover:text-primary mr-1 transition-colors rounded-md hover:bg-black/5 dark:hover:bg-white/5"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>

        {/* Live / Demo Mode Badge */}
        {isLiveMode ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">Live Mode</span>
            <span className="text-[10px] bg-emerald-500/20 px-1 rounded uppercase font-mono">DB</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
            <Sparkles size={12} className="text-accent animate-pulse" />
            <span>Guest / Demo Mode</span>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-xs sm:max-w-md hidden md:block mx-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          className="w-full bg-main border border-border rounded-lg pl-9 pr-3 py-1.5 text-sm text-primary placeholder-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-sm"
          placeholder="Search CRM..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted font-mono bg-surface px-1.5 py-0.5 rounded border border-border shadow-sm">
          ⌘K
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 ml-auto">
        <button
          onClick={toggleTheme}
          className="p-2 text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <button
          onClick={onAddLead}
          className="hidden lg:flex items-center gap-1.5 bg-main hover:bg-black/5 dark:hover:bg-white/5 border border-border text-primary text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all shadow-sm"
        >
          <PlusCircle size={15} className="text-accent" />
          Add Lead
        </button>

        <button
          onClick={() => navigate('/pipeline')}
          className="hidden xl:flex items-center gap-1.5 bg-main hover:bg-black/5 dark:hover:bg-white/5 border border-border text-primary text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all shadow-sm"
        >
          <Kanban size={15} className="text-secondary" />
          Pipeline
        </button>

        <button
          onClick={togglePipMode}
          className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all shadow-sm ${
            isPipMode ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-accent hover:bg-accent-hover text-white'
          }`}
        >
          <Zap size={14} className={isPipMode ? 'animate-pulse' : ''} />
          <span>{isPipMode ? 'Exit Mode' : 'PiP Mode'}</span>
        </button>

        <div className="w-px h-5 bg-border mx-1"></div>

        {/* Account / Auth Actions */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-border">
              <div className="w-7 h-7 bg-gradient-to-br from-accent to-amber-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {getInitials(user?.name || 'User')}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-primary leading-none truncate max-w-[100px]">
                  {user?.name}
                </div>
                <div className="text-[10px] text-accent uppercase font-bold tracking-wider">
                  {user?.role}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg text-primary hover:bg-black/5 dark:hover:bg-white/5 border border-border transition-all"
            >
              <LogIn size={14} className="text-accent" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-hover transition-all shadow-sm"
            >
              <UserPlus size={14} />
              <span className="hidden sm:inline">Register</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
