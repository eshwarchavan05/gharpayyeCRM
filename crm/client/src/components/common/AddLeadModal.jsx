import { useState } from 'react';
import { X, User, Phone, Mail, MapPin, DollarSign, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { LOCATIONS, SOURCES } from '../../utils/helpers';
import { useCrm } from '../../context/CrmContext';

export default function AddLeadModal({ onClose, onSave, lead }) {
  const isEdit = !!lead;
  const { agents } = useCrm();

  const [form, setForm] = useState({
    name: lead?.name || '',
    phone: lead?.phone || '',
    email: lead?.email || '',
    budget: lead?.budget || '',
    preferredLocation: lead?.preferredLocation || '',
    source: lead?.source || 'Website',
    notes: lead?.notes || '',
    score: typeof lead?.score !== 'undefined' ? lead.score : 50,
    assignedTo: lead?.assignedTo?._id || (typeof lead?.assignedTo === 'string' ? lead.assignedTo : ''),
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error('Name and phone are required');
      return;
    }
    onSave?.(form);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h2 className="font-display text-lg font-bold text-primary">{isEdit ? 'Edit Lead' : 'Add New Lead'}</h2>
              <p className="text-xs text-muted mt-0.5">Fill in the lead details below</p>
            </div>
            <button
              onClick={onClose}
              className="text-secondary hover:text-primary p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-secondary mb-1.5 block font-medium">Name *</label>
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    className="input w-full pl-8 text-xs"
                    placeholder="Full name"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-secondary mb-1.5 block font-medium">Phone *</label>
                <div className="relative">
                  <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    className="input w-full pl-8 text-xs"
                    placeholder="+91 XXXXX XXXXX"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-secondary mb-1.5 block font-medium">Email</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    className="input w-full pl-8 text-xs"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-secondary mb-1.5 block font-medium">Budget (₹/mo)</label>
                <div className="relative">
                  <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    className="input w-full pl-8 text-xs"
                    placeholder="15000"
                    type="number"
                    value={form.budget}
                    onChange={(e) => set('budget', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-secondary mb-1.5 block font-medium">Preferred Location</label>
                <div className="relative">
                  <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <select
                    className="input w-full pl-8 text-xs"
                    value={form.preferredLocation}
                    onChange={(e) => set('preferredLocation', e.target.value)}
                  >
                    <option value="">Select location</option>
                    {LOCATIONS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-secondary mb-1.5 block font-medium">Source</label>
                <select className="input w-full text-xs" value={form.source} onChange={(e) => set('source', e.target.value)}>
                  {SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-secondary mb-1.5 block font-medium">Assign To</label>
                <select
                  className="input w-full text-xs"
                  value={form.assignedTo}
                  onChange={(e) => set('assignedTo', e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {agents.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-secondary mb-1.5 block font-medium flex justify-between">
                  <span>Lead Score</span>
                  <span className="text-accent font-mono font-bold">{form.score}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.score}
                  onChange={(e) => set('score', Number(e.target.value))}
                  className="w-full h-2 rounded-full bg-border appearance-none cursor-pointer accent-accent"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-secondary mb-1.5 block font-medium">Notes</label>
              <textarea
                className="input w-full text-xs resize-none"
                rows={3}
                placeholder="Any client notes, specific PG requirements..."
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button type="button" onClick={onClose} className="btn-ghost text-xs">
                Cancel
              </button>
              <button type="submit" className="btn-primary flex items-center gap-1.5 text-xs">
                <Zap size={13} />
                {isEdit ? 'Save Changes' : 'Add Lead'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
