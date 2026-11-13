import React, { useState, useMemo } from 'react';
import { ActivityLog } from '../types/property';
import { formatDateTime } from '../utils/formatters';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  BadgeCheck,
  RotateCcw,
  PlusCircle,
  Edit,
  Trash2,
  User,
  ArrowRight,
} from 'lucide-react';

interface ActivityHistoryProps {
  activityLogs: ActivityLog[];
  onSelectPropertyById: (propertyId: string) => void;
}

export function ActivityHistory({
  activityLogs,
  onSelectPropertyById,
}: ActivityHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('All');

  const filteredLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      if (actionFilter !== 'All' && log.action !== actionFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = log.propertyId?.toLowerCase().includes(q);
        const matchEmail = log.userEmail?.toLowerCase().includes(q);
        const matchTitle = log.propertyTitle?.toLowerCase().includes(q);
        const matchNotes = log.notes?.toLowerCase().includes(q);
        if (!matchId && !matchEmail && !matchTitle && !matchNotes) {
          return false;
        }
      }
      return true;
    });
  }, [activityLogs, actionFilter, searchQuery]);

  const getActionBadge = (action: ActivityLog['action']) => {
    switch (action) {
      case 'Created':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <PlusCircle className="w-3 h-3" />
            <span>Created</span>
          </span>
        );
      case 'Reserved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            <span>Reserved</span>
          </span>
        );
      case 'Sold':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <BadgeCheck className="w-3 h-3" />
            <span>Sold</span>
          </span>
        );
      case 'Restored':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <RotateCcw className="w-3 h-3" />
            <span>Restored</span>
          </span>
        );
      case 'Updated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            <Edit className="w-3 h-3" />
            <span>Updated</span>
          </span>
        );
      case 'Deleted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Trash2 className="w-3 h-3" />
            <span>Deleted</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[11px] font-semibold uppercase tracking-wider border border-blue-500/30">
              Audit Trail
            </span>
            <span className="text-xs text-slate-400">Company Inventory History</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white">
            Activity & Status History
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time chronological log of all property creations, status shifts, reservations, and sales.
          </p>
        </div>

        <div className="text-xs text-slate-400 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 shrink-0">
          Total Logs: <strong className="text-white">{activityLogs.length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by property ID, agent email, or notes..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
          {['All', 'Created', 'Reserved', 'Sold', 'Restored', 'Updated'].map((act) => (
            <button
              key={act}
              type="button"
              onClick={() => setActionFilter(act)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                actionFilter === act
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800/80'
              }`}
            >
              {act}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      {filteredLogs.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
          <History className="w-8 h-8 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-white">No activity records found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Audit logs will automatically appear here as employees add, reserve, or mark properties as sold.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-800">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              {/* Left Column: Action badge & Info */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {getActionBadge(log.action)}
                  <button
                    type="button"
                    onClick={() => onSelectPropertyById(log.propertyId)}
                    className="font-extrabold text-blue-400 hover:underline tracking-wider uppercase text-xs cursor-pointer"
                  >
                    {log.propertyId}
                  </button>
                  {log.propertyTitle && (
                    <span className="text-slate-300 font-medium truncate max-w-xs">
                      &bull; {log.propertyTitle}
                    </span>
                  )}
                </div>

                {log.notes && (
                  <p className="text-slate-300 text-xs pl-0.5 leading-relaxed">
                    {log.notes}
                  </p>
                )}

                {/* Status shift indicator */}
                {log.previousStatus && log.newStatus && log.previousStatus !== log.newStatus && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="text-slate-500">Status shift:</span>
                    <span className="line-through text-slate-500">{log.previousStatus}</span>
                    <span>&rarr;</span>
                    <span className="font-bold text-white">{log.newStatus}</span>
                  </div>
                )}
              </div>

              {/* Right Column: User & Timestamp */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center text-[11px] text-slate-400 shrink-0 gap-1 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-medium">{log.userEmail.split('@')[0]}</span>
                </div>
                <span className="text-slate-500 text-[10px]">
                  {formatDateTime(log.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
