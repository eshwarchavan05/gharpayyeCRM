import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Users, TrendingUp, Calendar, CheckCircle2, Sparkles } from 'lucide-react';
import { MOCK_MONTHLY_DATA, AGENT_PERF } from '../utils/mockData';
import StatCard from '../components/common/StatCard';
import { useCrm } from '../context/CrmContext';

const PIE_COLORS = ['#F5A623', '#4A9EFF', '#FF4444', '#10B981', '#8B5CF6', '#EC4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-xl">
      <p className="text-xs text-muted mb-1 font-semibold">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-secondary">{p.name}:</span>
          <span className="text-primary font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { leads, visits, isLiveMode } = useCrm();

  const total = leads.length;
  const booked = leads.filter((l) => l.status === 'Booked').length;
  const conversion = total > 0 ? ((booked / total) * 100).toFixed(1) : 0;

  const byStatus = Object.entries(
    leads.reduce((acc, l) => ({ ...acc, [l.status]: (acc[l.status] || 0) + 1 }), {})
  ).map(([name, value]) => ({ name, value }));

  const bySource = Object.entries(
    leads.reduce((acc, l) => ({ ...acc, [l.source || 'Website']: (acc[l.source || 'Website'] || 0) + 1 }), {})
  ).map(([name, value]) => ({ name, value }));

  const stats = [
    { label: 'Total Leads', value: total, trend: 12, icon: Users, color: 'accent' },
    { label: 'Conversion Rate', value: `${conversion}%`, trend: 3, icon: TrendingUp, color: 'green' },
    { label: 'Total Visits', value: visits.length, trend: 8, icon: Calendar, color: 'cold' },
    { label: 'Booked', value: booked, trend: 15, icon: CheckCircle2, color: 'hot' },
  ];

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-primary">Analytics & Performance</h1>
            {isLiveMode ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                LIVE DB
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 flex items-center gap-1">
                <Sparkles size={10} /> DEMO ANALYTICS
              </span>
            )}
          </div>
          <p className="text-muted text-sm mt-0.5">Performance overview for your Gharpayy CRM workspace</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.08} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Growth Trends */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-primary mb-1">Monthly Lead Growth</h2>
          <p className="text-xs text-muted mb-4">Inflow vs Conversion trajectories</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_MONTHLY_DATA}>
                <defs>
                  <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5A623" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F5A623" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="bookedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#252830" vertical={false} />
                <XAxis dataKey="month" stroke="#6B7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="leads" stroke="#F5A623" fillOpacity={1} fill="url(#leadGrad)" name="Leads" />
                <Area type="monotone" dataKey="booked" stroke="#10B981" fillOpacity={1} fill="url(#bookedGrad)" name="Booked" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Status Breakdown */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-primary mb-1">Lead Stage Distribution</h2>
          <p className="text-xs text-muted mb-4">Current distribution across the sales pipeline</p>
          <div className="h-64 flex items-center justify-center">
            {byStatus.length === 0 ? (
              <span className="text-xs text-muted">No data available</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {byStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Breakdown */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-primary mb-1">Lead Source Breakdown</h2>
          <p className="text-xs text-muted mb-4">Acquisition channels driving demand</p>
          <div className="h-60">
            {bySource.length === 0 ? (
              <span className="text-xs text-muted">No sources available</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bySource}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252830" vertical={false} />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#4A9EFF" radius={[4, 4, 0, 0]} name="Leads" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Agent Performance */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-primary mb-1">Field Agent Performance</h2>
          <p className="text-xs text-muted mb-4">Tours scheduled and deals closed</p>
          <div className="space-y-3">
            {AGENT_PERF.map((agent) => (
              <div key={agent.name} className="flex items-center justify-between text-xs py-2 border-b border-border/50 last:border-0">
                <span className="font-semibold text-primary">{agent.name}</span>
                <div className="flex items-center gap-4 text-secondary">
                  <span>{agent.leads} leads</span>
                  <span>{agent.tours} tours</span>
                  <span className="font-bold text-emerald-400">{agent.closed} closed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
