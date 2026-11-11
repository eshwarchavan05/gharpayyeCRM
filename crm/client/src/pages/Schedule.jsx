import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Clock, MapPin, User, CheckCircle2, AlertCircle, XCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDateTime, getInitials } from '../utils/helpers';
import { useCrm } from '../context/CrmContext';

const STATUS_STYLES = {
  'Scheduled': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Completed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Cancelled': 'bg-red-500/10 text-red-400 border-red-500/20',
  'No Show': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

function ScheduleModal({ onClose, onSave, leads, agents }) {
  const [form, setForm] = useState({
    leadId: leads[0]?._id || '',
    agentId: agents[0]?._id || '',
    visitDate: '',
    propertyAddress: '',
    remarks: '',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.leadId || !form.visitDate) {
      toast.error('Select lead and visit date');
      return;
    }
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-lg text-primary mb-4 font-bold">Schedule Property Visit</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-secondary mb-1.5 block">Select Lead *</label>
            <select className="input w-full text-xs" value={form.leadId} onChange={(e) => set('leadId', e.target.value)}>
              <option value="">Choose a lead</option>
              {leads.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.name} — {l.phone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-secondary mb-1.5 block">Field Executive / Agent</label>
            <select className="input w-full text-xs" value={form.agentId} onChange={(e) => set('agentId', e.target.value)}>
              <option value="">Select agent</option>
              {agents.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-secondary mb-1.5 block">Visit Date & Time *</label>
            <input
              type="datetime-local"
              className="input w-full text-xs"
              value={form.visitDate}
              onChange={(e) => set('visitDate', e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-secondary mb-1.5 block">Property Address</label>
            <input
              className="input w-full text-xs"
              placeholder="e.g. 14B, Koramangala 4th Block"
              value={form.propertyAddress}
              onChange={(e) => set('propertyAddress', e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-secondary mb-1.5 block">Remarks</label>
            <textarea
              className="input w-full text-xs resize-none"
              rows={2}
              placeholder="Client preferences, keys location, etc."
              value={form.remarks}
              onChange={(e) => set('remarks', e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-3">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 text-xs">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 text-xs">
              Schedule Visit
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function Schedule() {
  const { visits, leads, agents, addVisit, updateVisitStatus, isLiveMode } = useCrm();
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const now = new Date();
  const upcoming = visits.filter((v) => new Date(v.visitDate) >= now && v.status === 'Scheduled');
  const overdue = visits.filter((v) => new Date(v.visitDate) < now && v.status === 'Scheduled');
  const completed = visits.filter((v) => v.status === 'Completed');

  const handleSaveVisit = async (form) => {
    try {
      await addVisit(form);
    } catch {}
  };

  const VisitCard = ({ visit }) => (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="card p-4 hover:border-border/80 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-black/5 dark:bg-white/10 rounded-lg flex items-center justify-center text-xs font-bold text-primary">
            {getInitials(visit.leadId?.name)}
          </div>
          <div>
            <div className="text-sm font-semibold text-primary">{visit.leadId?.name}</div>
            <div className="text-xs text-muted">{visit.leadId?.phone}</div>
          </div>
        </div>
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[visit.status]}`}>
          {visit.status}
        </span>
      </div>

      <div className="space-y-1.5 text-xs text-secondary">
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-muted" />
          <span>{formatDateTime(visit.visitDate)}</span>
        </div>
        {visit.propertyAddress && (
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-muted" />
            <span className="truncate">{visit.propertyAddress}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <User size={12} className="text-muted" />
          <span>{visit.agentId?.name || 'Agent'}</span>
        </div>
        {visit.remarks && <div className="text-muted italic mt-1 pl-5">"{visit.remarks}"</div>}
      </div>

      {visit.status === 'Scheduled' && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-border">
          <button
            onClick={() => updateVisitStatus(visit._id, 'Completed')}
            className="flex-1 flex items-center justify-center gap-1 text-[11px] font-medium py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
          >
            <CheckCircle2 size={12} /> Complete
          </button>
          <button
            onClick={() => updateVisitStatus(visit._id, 'Cancelled')}
            className="flex-1 flex items-center justify-center gap-1 text-[11px] font-medium py-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20"
          >
            <XCircle size={12} /> Cancel
          </button>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-primary">Visit Scheduling</h1>
            {isLiveMode ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                LIVE DB
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 flex items-center gap-1">
                <Sparkles size={10} /> DEMO SCHEDULE
              </span>
            )}
          </div>
          <p className="text-muted text-sm mt-0.5">Manage PG property tours, agent assignments & follow-ups</p>
        </div>
        <button onClick={() => setScheduleOpen(true)} className="btn-primary flex items-center gap-1.5">
          <Plus size={14} /> Schedule Visit
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="card p-4 border-l-4 border-l-blue-500">
          <div className="text-xs text-muted font-medium">Upcoming Visits</div>
          <div className="text-2xl font-bold text-primary mt-1">{upcoming.length}</div>
        </div>
        <div className="card p-4 border-l-4 border-l-red-500">
          <div className="text-xs text-muted font-medium">Overdue Tours</div>
          <div className="text-2xl font-bold text-primary mt-1">{overdue.length}</div>
        </div>
        <div className="card p-4 border-l-4 border-l-emerald-500">
          <div className="text-xs text-muted font-medium">Completed Visits</div>
          <div className="text-2xl font-bold text-primary mt-1">{completed.length}</div>
        </div>
      </div>

      {/* Visits List */}
      <div className="space-y-6">
        {overdue.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <AlertCircle size={14} /> Overdue Visits ({overdue.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {overdue.map((v) => (
                <VisitCard key={v._id} visit={v} />
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xs font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Calendar size={14} className="text-accent" /> Upcoming Schedule ({upcoming.length})
          </h2>
          {upcoming.length === 0 ? (
            <div className="card p-8 text-center text-muted text-xs">
              No upcoming visits scheduled. Click "Schedule Visit" to add one!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcoming.map((v) => (
                <VisitCard key={v._id} visit={v} />
              ))}
            </div>
          )}
        </div>

        {completed.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Completed ({completed.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {completed.map((v) => (
                <VisitCard key={v._id} visit={v} />
              ))}
            </div>
          </div>
        )}
      </div>

      {scheduleOpen && (
        <ScheduleModal
          leads={leads}
          agents={agents}
          onClose={() => setScheduleOpen(false)}
          onSave={handleSaveVisit}
        />
      )}
    </div>
  );
}
