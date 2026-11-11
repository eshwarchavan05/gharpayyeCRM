import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, RefreshCw, Flame, Zap, ArrowRight, CheckCircle2, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCrm } from '../context/CrmContext';
import LeadRow from '../components/common/LeadRow';
import StatCard from '../components/common/StatCard';
import LeadDetailModal from '../components/common/LeadDetailModal';

const GREETING = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function Dashboard() {
  const { user, isGuest } = useAuth();
  const { leads, isLiveMode, refreshData } = useCrm();
  const [selected, setSelected] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 15000);
    return () => clearInterval(t);
  }, []);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const hot = leads.filter((l) => l.leadTemperature === 'HOT').length;
  const today = leads.filter((l) => {
    if (!l.visitDate) return false;
    const d = new Date(l.visitDate);
    return d.toDateString() === now.toDateString();
  }).length;
  const urgent = leads.filter((l) => (l.score || 0) >= 70).length;
  const booked = leads.filter((l) => l.status === 'Booked').length;

  const stats = [
    { label: 'Total Leads', value: leads.length, sub: isLiveMode ? 'in MongoDB' : 'demo leads', trend: 12, color: 'accent' },
    { label: 'HOT Leads', value: hot, sub: 'need action now', trend: 5, color: 'hot' },
    { label: 'Tours Today', value: today, sub: 'scheduled', color: 'cold' },
    { label: 'Booked', value: booked, sub: 'this month', trend: 8, color: 'green' },
  ];

  const prioritized = [...leads].sort((a, b) => {
    const tempOrder = { HOT: 0, WARM: 1, COLD: 2 };
    const aTemp = tempOrder[a.leadTemperature] ?? 2;
    const bTemp = tempOrder[b.leadTemperature] ?? 2;
    if (aTemp !== bTemp) return aTemp - bTemp;
    return (b.score || 0) - (a.score || 0);
  });

  return (
    <div className="p-4 sm:p-6 max-w-6xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Sun size={13} className="text-accent" />
            <span>{dateStr} · {timeStr}</span>
          </div>

          {isLiveMode ? (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live MongoDB Workspace
            </span>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 flex items-center gap-1.5">
              <Sparkles size={11} />
              Guest / Demo Mode Active
            </span>
          )}
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary mb-1">
          {GREETING()}{user?.name ? `, ${user.name}` : ''}.
        </h1>
        <p className="text-secondary text-sm flex items-center gap-2 flex-wrap">
          <span>{leads.length} leads in queue ranked by priority.</span>
          <a href="/leads" className="text-accent hover:text-amber-400 inline-flex items-center gap-1 transition-colors font-medium">
            View full directory <ArrowRight size={12} />
          </a>
        </p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.08} />
        ))}
      </div>

      {/* Status strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 mb-4 text-xs flex-wrap"
      >
        <span className="text-muted">Inbound triage</span>
        <div className="h-3 w-px bg-border" />
        <span className="bg-black/5 dark:bg-white/5 text-primary border border-border px-2 py-0.5 rounded-full font-medium">
          {prioritized.length} active leads
        </span>
        <div className="h-3 w-px bg-border" />
        <span className="text-muted">
          {isLiveMode ? 'Synced with live MongoDB database' : 'Exploring realistic PG & Real Estate demo data'}
        </span>
      </motion.div>

      {/* Do This Next queue */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-accent" />
            <span className="text-sm font-semibold text-primary">Do this next</span>
            <span className="text-xs text-muted">live triage</span>
          </div>
          <div className="flex items-center gap-3 ml-auto text-xs">
            <span className="flex items-center gap-1 text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
              {urgent} urgent
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
              {today} today
            </span>
            <span className="flex items-center gap-1 text-orange-400">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
              {hot} hot
            </span>
            <button
              className="text-muted hover:text-primary p-1 hover:bg-black/5 dark:bg-white/5 rounded-lg transition-all"
              onClick={() => {
                refreshData?.();
                setTick((t) => t + 1);
              }}
              title="Refresh queue"
            >
              <RefreshCw size={12} />
            </button>
          </div>
        </div>

        {/* Column headers */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border/50 text-xs text-muted font-medium uppercase tracking-wider">
          <div className="w-44">Lead</div>
          <div className="flex-1 hidden md:block">Notes</div>
          <div className="w-32 hidden lg:block">Stage</div>
          <div className="w-28 hidden xl:block">Score</div>
          <div className="w-8 hidden lg:block">Agent</div>
          <div className="w-20 hidden xl:block">Last activity</div>
          <div className="w-20">Actions</div>
        </div>

        {/* Lead rows */}
        {prioritized.length === 0 ? (
          <div className="p-8 text-center text-muted text-sm">
            No leads in queue. Add your first lead to get started!
          </div>
        ) : (
          prioritized.map((lead, i) => (
            <LeadRow key={lead._id} lead={lead} index={i} onClick={setSelected} />
          ))
        )}
      </motion.div>

      {selected && <LeadDetailModal lead={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
