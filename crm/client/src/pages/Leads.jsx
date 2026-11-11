import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, ChevronLeft, ChevronRight, Edit2, Trash2, Eye, Phone, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { getStatusColor, getTempClass, getScoreColor, formatDate, getInitials, PIPELINE_STAGES, LOCATIONS } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { useCrm } from '../context/CrmContext';
import AddLeadModal from '../components/common/AddLeadModal';
import LeadDetailModal from '../components/common/LeadDetailModal';

const PER_PAGE = 10;

export default function Leads() {
  const { user } = useAuth();
  const { leads, agents, addLead, updateLead, deleteLead, isLiveMode } = useCrm();
  const isAdmin = user?.role === 'admin' || !isLiveMode;

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterAgent, setFilterAgent] = useState('');
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [viewLead, setViewLead] = useState(null);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (search && !`${l.name} ${l.phone} ${l.email || ''}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus && l.status !== filterStatus) return false;
      if (filterLocation && l.preferredLocation !== filterLocation) return false;
      if (filterAgent && l.assignedTo?.name !== filterAgent) return false;
      return true;
    });
  }, [leads, search, filterStatus, filterLocation, filterAgent]);

  const pages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSaveAdd = async (form) => {
    try {
      await addLead(form);
      setAddOpen(false);
    } catch {
      // toast shown in addLead
    }
  };

  const handleSaveEdit = async (form) => {
    if (!editLead) return;
    try {
      await updateLead(editLead._id, form);
      setEditLead(null);
    } catch {
      // toast shown in updateLead
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteLead(id);
      setViewLead(null);
    } catch {
      // toast shown in deleteLead
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-primary">Leads Directory</h1>
            {isLiveMode ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                LIVE DB
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 flex items-center gap-1">
                <Sparkles size={10} /> DEMO DATA
              </span>
            )}
          </div>
          <p className="text-muted text-sm mt-0.5">{filtered.length} total leads found</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-primary flex items-center gap-1.5">
          <Plus size={14} /> Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input w-full pl-8 text-xs"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          className="input text-xs"
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Status</option>
          {PIPELINE_STAGES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          className="input text-xs"
          value={filterLocation}
          onChange={(e) => {
            setFilterLocation(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Locations</option>
          {LOCATIONS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        {isAdmin && (
          <select
            className="input text-xs"
            value={filterAgent}
            onChange={(e) => {
              setFilterAgent(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Agents</option>
            {agents
              .filter((u) => u.role === 'agent' || !u.role)
              .map((u) => (
                <option key={u._id} value={u.name}>
                  {u.name}
                </option>
              ))}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/50 border-b border-border text-muted font-medium uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Lead</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                paged.map((l) => (
                  <tr key={l._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-accent/10 text-accent rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                          {getInitials(l.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-primary">{l.name}</div>
                          <span className={`text-[10px] ${getTempClass(l.leadTemperature)}`}>
                            {l.leadTemperature}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-secondary">{l.phone}</div>
                      <div className="text-[11px] text-muted">{l.email || '—'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${getStatusColor(l.status)}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-secondary">{l.preferredLocation || '—'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-primary">{l.score || 0}</span>
                        <div className="w-12 h-1 bg-border rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getScoreColor(l.score || 0)}`}
                            style={{ width: `${l.score || 0}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-secondary">{l.assignedTo?.name || 'Unassigned'}</td>
                    <td className="py-3 px-4 text-muted">{formatDate(l.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewLead(l)}
                          className="p-1.5 text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors"
                          title="View lead"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => setEditLead(l)}
                          className="p-1.5 text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors"
                          title="Edit lead"
                        >
                          <Edit2 size={14} />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(l._id)}
                            className="p-1.5 text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                            title="Delete lead"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface/30">
          <span className="text-xs text-muted">
            Page {page} of {pages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-md text-secondary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="p-1.5 rounded-md text-secondary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {addOpen && <AddLeadModal onClose={() => setAddOpen(false)} onSave={handleSaveAdd} />}
      {editLead && <AddLeadModal lead={editLead} onClose={() => setEditLead(null)} onSave={handleSaveEdit} />}
      {viewLead && (
        <LeadDetailModal
          lead={viewLead}
          onClose={() => setViewLead(null)}
          onEdit={(l) => {
            setViewLead(null);
            setEditLead(l);
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
