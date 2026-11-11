import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Sparkles } from 'lucide-react';
import { getTempDot, getStatusColor } from '../utils/helpers';
import { useCrm } from '../context/CrmContext';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarPage() {
  const { visits, leads, isLiveMode } = useCrm();
  const [current, setCurrent] = useState(new Date());
  const today = new Date();

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  // Get events for a day
  const getEvents = (day) => {
    if (!day) return [];
    const date = new Date(year, month, day);
    const events = [];

    // Visits
    visits.forEach((v) => {
      if (!v.visitDate) return;
      const vd = new Date(v.visitDate);
      if (vd.toDateString() === date.toDateString()) {
        events.push({
          type: 'visit',
          label: `Visit: ${v.leadId?.name || 'Lead'}`,
          color: 'bg-blue-500',
        });
      }
    });

    // Leads visit dates
    leads.forEach((l) => {
      if (l.visitDate) {
        const ld = new Date(l.visitDate);
        if (ld.toDateString() === date.toDateString()) {
          events.push({
            type: 'lead',
            label: `Tour: ${l.name}`,
            color:
              l.leadTemperature === 'HOT'
                ? 'bg-red-500'
                : l.leadTemperature === 'WARM'
                ? 'bg-amber-500'
                : 'bg-blue-500',
          });
        }
      }
    });

    return events;
  };

  const prev = () => setCurrent(new Date(year, month - 1, 1));
  const next = () => setCurrent(new Date(year, month + 1, 1));

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-primary">Calendar View</h1>
            {isLiveMode ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                LIVE DB
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 flex items-center gap-1">
                <Sparkles size={10} /> DEMO CALENDAR
              </span>
            )}
          </div>
          <p className="text-muted text-sm mt-0.5">Monthly schedule of visits, tours, and follow-ups</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            className="p-2 text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all border border-border"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-primary min-w-[130px] text-center">
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={next}
            className="p-2 text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all border border-border"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border bg-surface/50 text-center py-2.5 text-xs font-semibold text-muted">
          {DAYS.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 divide-x divide-y divide-border/50">
          {cells.map((day, i) => {
            const isToday =
              day &&
              today.getDate() === day &&
              today.getMonth() === month &&
              today.getFullYear() === year;
            const events = getEvents(day);

            return (
              <div
                key={i}
                className={`min-h-[100px] p-2 transition-colors ${
                  !day ? 'bg-black/2 dark:bg-white/2' : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {day && (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                          isToday
                            ? 'bg-accent text-white font-bold'
                            : 'text-secondary'
                        }`}
                      >
                        {day}
                      </span>
                      {events.length > 0 && (
                        <span className="text-[10px] text-muted font-mono">
                          {events.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {events.slice(0, 3).map((e, ei) => (
                        <div
                          key={ei}
                          className="text-[10px] truncate px-1.5 py-0.5 rounded text-white font-medium flex items-center gap-1 shadow-xs"
                          style={{
                            backgroundColor:
                              e.type === 'visit' ? '#3B82F6' : '#F59E0B',
                          }}
                        >
                          <span className="truncate">{e.label}</span>
                        </div>
                      ))}
                      {events.length > 3 && (
                        <div className="text-[9px] text-muted pl-1">
                          +{events.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
