import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MoreHorizontal, Sparkles } from 'lucide-react';
import { getStatusColor, getTempClass, getScoreColor, getInitials } from '../utils/helpers';
import { useCrm } from '../context/CrmContext';
import AddLeadModal from '../components/common/AddLeadModal';

const STAGES = ['New', 'Contacted', 'Visit Scheduled', 'Negotiation', 'Booked', 'Lost'];

const STAGE_COLORS = {
  'New': 'border-purple-500/30 bg-purple-500/5',
  'Contacted': 'border-blue-500/30 bg-blue-500/5',
  'Visit Scheduled': 'border-cyan-500/30 bg-cyan-500/5',
  'Negotiation': 'border-amber-500/30 bg-amber-500/5',
  'Booked': 'border-emerald-500/30 bg-emerald-500/5',
  'Lost': 'border-red-500/30 bg-red-500/5',
};

function LeadCard({ lead, onMove }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border border-border rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-accent/40 transition-all group"
      draggable
      onDragStart={(e) => e.dataTransfer.setData('leadId', lead._id)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center text-xs font-semibold text-secondary">
            {getInitials(lead.name)}
          </div>
          <span className="text-sm font-medium text-primary">{lead.name}</span>
        </div>
        <span className={getTempClass(lead.leadTemperature)}>{lead.leadTemperature}</span>
      </div>

      <div className="text-xs text-muted mb-2 truncate">{lead.preferredLocation || 'No location'}</div>

      {lead.budget && (
        <div className="text-xs text-secondary mb-2">₹{Number(lead.budget).toLocaleString()}/mo</div>
      )}

      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${getScoreColor(lead.score || 0)}`}
            style={{ width: `${lead.score || 0}%` }}
          />
        </div>
        <span className="text-xs text-muted font-mono">{lead.score || 0}</span>
      </div>

      {/* Quick move buttons */}
      <div className="flex gap-1 mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex-wrap">
        {STAGES.filter((s) => s !== lead.status)
          .slice(0, 3)
          .map((s) => (
            <button
              key={s}
              onClick={() => onMove(lead._id, s)}
              className={`text-[10px] px-1.5 py-0.5 rounded-md border transition-all ${getStatusColor(
                s
              )} hover:opacity-80`}
            >
              → {s.split(' ')[0]}
            </button>
          ))}
      </div>
    </motion.div>
  );
}

export default function Pipeline() {
  const { leads, updateLead, addLead, isLiveMode } = useCrm();
  const [addOpen, setAddOpen] = useState(false);
  const [targetStage, setTargetStage] = useState('New');

  const byStage = (stage) => leads.filter((l) => l.status === stage);

  const moveLead = async (leadId, newStatus) => {
    try {
      await updateLead(leadId, { status: newStatus });
    } catch {
      // Error toast handled in useCrm
    }
  };

  const handleDrop = (e, stage) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) moveLead(leadId, stage);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSaveLead = async (form) => {
    try {
      await addLead({ ...form, status: targetStage });
      setAddOpen(false);
    } catch {}
  };

  return (
    <div className="p-4 sm:p-6 overflow-x-auto min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-primary">Kanban Pipeline</h1>
            {isLiveMode ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                LIVE DB
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 flex items-center gap-1">
                <Sparkles size={10} /> DEMO PIPELINE
              </span>
            )}
          </div>
          <p className="text-muted text-sm mt-0.5">Drag cards to update lead statuses across the funnel</p>
        </div>
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 min-w-[900px] xl:min-w-0">
        {STAGES.map((stage) => {
          const stageLeads = byStage(stage);
          return (
            <div
              key={stage}
              onDrop={(e) => handleDrop(e, stage)}
              onDragOver={handleDragOver}
              className={`rounded-2xl border p-3 flex flex-col min-h-[480px] ${STAGE_COLORS[stage]}`}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-primary">{stage}</span>
                  <span className="text-xs text-muted font-mono font-bold">({stageLeads.length})</span>
                </div>
                <button
                  onClick={() => {
                    setTargetStage(stage);
                    setAddOpen(true);
                  }}
                  className="text-secondary hover:text-primary p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  title={`Add lead to ${stage}`}
                >
                  <Plus size={13} />
                </button>
              </div>

              {/* Cards list */}
              <div className="space-y-2 flex-1 overflow-y-auto">
                {stageLeads.map((lead) => (
                  <LeadCard key={lead._id} lead={lead} onMove={moveLead} />
                ))}

                {stageLeads.length === 0 && (
                  <div className="border border-dashed border-border rounded-xl p-4 text-center text-muted text-xs">
                    Drop leads here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {addOpen && (
        <AddLeadModal
          onClose={() => setAddOpen(false)}
          onSave={handleSaveLead}
        />
      )}
    </div>
  );
}
