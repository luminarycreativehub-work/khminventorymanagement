import React from 'react';
import { Property, ActivityLog, PropertyStatus } from '../types/property';
import { formatPrice, formatDateTime } from '../utils/formatters';
import {
  Building2,
  CheckCircle2,
  Clock,
  BadgeCheck,
  TrendingUp,
  Plus,
  ArrowRight,
  Layers,
  Sparkles,
  PieChart,
  History,
} from 'lucide-react';

interface DashboardProps {
  properties: Property[];
  activityLogs: ActivityLog[];
  onNavigateToInventoryWithFilter: (status: PropertyStatus | 'All') => void;
  onOpenAddModal: () => void;
  onSeedSampleData: () => void;
  seeding: boolean;
  onSelectPropertyById: (propertyId: string) => void;
}

export function Dashboard({
  properties,
  activityLogs,
  onNavigateToInventoryWithFilter,
  onOpenAddModal,
  onSeedSampleData,
  seeding,
  onSelectPropertyById,
}: DashboardProps) {
  const total = properties.length;
  const available = properties.filter((p) => p.status === 'Available');
  const reserved = properties.filter((p) => p.status === 'Reserved');
  const sold = properties.filter((p) => p.status === 'Sold');

  const availableCount = available.length;
  const reservedCount = reserved.length;
  const soldCount = sold.length;

  // Valuation metrics
  const availableValuation = available.reduce((acc, p) => acc + (p.price || 0), 0);
  const reservedValuation = reserved.reduce((acc, p) => acc + (p.price || 0), 0);
  const soldValuation = sold.reduce((acc, p) => {
    // If saleDetails finalPrice exists, use it, otherwise asking price
    return acc + (p.saleDetails?.finalPrice || p.price || 0);
  }, 0);

  // Property Types breakdown
  const typeMap: Record<string, number> = {};
  properties.forEach((p) => {
    typeMap[p.propertyType] = (typeMap[p.propertyType] || 0) + 1;
  });
  const typeEntries = Object.entries(typeMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Welcome Banner / Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/60 to-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-blue-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[11px] font-semibold tracking-wider uppercase border border-blue-500/30">
                Company Overview
              </span>
              <span className="text-xs text-slate-400">Real-Time Central Inventory</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              KHM Real Estate Portfolio
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Track plots, commercial units, apartments, and houses across all housing societies and projects.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenAddModal}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Property</span>
            </button>
          </div>
        </div>
      </div>

      {/* Empty State Banner if no properties */}
      {total === 0 && (
        <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Database is Ready for Inventory</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your Firestore database is connected. You can start adding real company properties now or initialize standard sample listings to explore all features.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
            >
              Add Your First Property
            </button>
            <button
              type="button"
              onClick={onSeedSampleData}
              disabled={seeding}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              {seeding ? 'Generating Sample Units...' : 'Seed Sample Company Inventory (5 Units)'}
            </button>
          </div>
        </div>
      )}

      {/* Real-Time Statistics 4 Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Properties */}
        <div
          onClick={() => onNavigateToInventoryWithFilter('All')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Total Units</span>
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{total}</span>
            <span className="text-xs text-slate-500">properties</span>
          </div>
          <p className="text-[11px] text-blue-400 mt-2 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>View all inventory</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* Available Properties */}
        <div
          onClick={() => onNavigateToInventoryWithFilter('Available')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Available</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{availableCount}</span>
            <span className="text-xs text-emerald-500/70">
              {total > 0 ? `(${Math.round((availableCount / total) * 100)}%)` : ''}
            </span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Open for clients</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* Reserved Properties */}
        <div
          onClick={() => onNavigateToInventoryWithFilter('Reserved')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Reserved</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">{reservedCount}</span>
            <span className="text-xs text-amber-500/70">
              {total > 0 ? `(${Math.round((reservedCount / total) * 100)}%)` : ''}
            </span>
          </div>
          <p className="text-[11px] text-amber-400 mt-2 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Token deposited</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* Sold Properties */}
        <div
          onClick={() => onNavigateToInventoryWithFilter('Sold')}
          className="bg-slate-900 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Sold</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <BadgeCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-400">{soldCount}</span>
            <span className="text-xs text-purple-500/70">
              {total > 0 ? `(${Math.round((soldCount / total) * 100)}%)` : ''}
            </span>
          </div>
          <p className="text-[11px] text-purple-400 mt-2 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Closed deals</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>
      </div>

      {/* Portfolio Valuation Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Available Valuation */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Active Listing Value</span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white">
            {formatPrice(availableValuation)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Total asking price of {availableCount} available units
          </p>
        </div>

        {/* Reserved Value */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Reserved In-Pipeline</span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white">
            {formatPrice(reservedValuation)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Under active client reservation ({reservedCount} units)
          </p>
        </div>

        {/* Realized Sales */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1.5">
            <BadgeCheck className="w-4 h-4 text-purple-400" />
            <span>Realized Closed Sales</span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-purple-300">
            {formatPrice(soldValuation)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Permanent closed volume ({soldCount} deals finalized)
          </p>
        </div>
      </div>

      {/* Two Columns: Property Type Distribution & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Type Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Inventory by Category</h3>
            </div>
            <span className="text-xs text-slate-400">{typeEntries.length} categories active</span>
          </div>

          {typeEntries.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No inventory categories yet</p>
          ) : (
            <div className="space-y-3">
              {typeEntries.map(([type, count]) => {
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-200">{type}</span>
                      <span className="text-slate-400 font-semibold">
                        {count} <span className="font-normal text-slate-500">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Audit Activities */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Live Activity Feed</h3>
            </div>
            <span className="text-xs text-slate-400">Audit trail</span>
          </div>

          {activityLogs.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No activities recorded yet</p>
          ) : (
            <div className="space-y-3">
              {activityLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  onClick={() => onSelectPropertyById(log.propertyId)}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer text-xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-blue-400 uppercase tracking-wider text-[11px]">
                      {log.propertyId}
                    </span>
                    <span className="text-[10px] text-slate-500">{formatDateTime(log.timestamp)}</span>
                  </div>
                  <p className="text-slate-200 font-medium line-clamp-1">{log.propertyTitle}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span className="text-slate-300">
                      {log.action}: {log.notes || 'Status updated'}
                    </span>
                    <span className="text-slate-500 text-[10px] truncate max-w-[120px]">
                      {log.userEmail.split('@')[0]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
