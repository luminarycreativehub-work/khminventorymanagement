import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Plus, LogOut, Radio, LayoutDashboard, History, Layers } from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'inventory' | 'activity';
  setCurrentTab: (tab: 'dashboard' | 'inventory' | 'activity') => void;
  onOpenAddModal: () => void;
  totalProperties: number;
}

export function Navbar({
  currentTab,
  setCurrentTab,
  onOpenAddModal,
  totalProperties,
}: NavbarProps) {
  const { user, logout, isOnline } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div
          onClick={() => setCurrentTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="font-extrabold text-lg tracking-tight text-white">KHM</span>
              <span className="font-light text-lg text-blue-400">Property</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
              <span className="uppercase tracking-wider">Inventory Hub</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span className="text-blue-300 font-semibold">{totalProperties} Units</span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
          <button
            type="button"
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('inventory')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'inventory'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Inventory ({totalProperties})</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('activity')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'activity'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Activity History</span>
          </button>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5">
          {/* Live Sync Status indicator */}
          <div
            title={isOnline ? 'Real-time Firestore synchronization active' : 'Device is offline'}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300"
          >
            <Radio
              className={`w-3 h-3 ${isOnline ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`}
            />
            <span className="hidden sm:inline font-medium">
              {isOnline ? 'Live Sync' : 'Offline'}
            </span>
          </div>

          {/* Quick Add Button */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property</span>
          </button>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
            <div className="hidden lg:block text-right">
              <p className="text-xs font-medium text-slate-200 truncate max-w-[150px]">
                {user?.email?.split('@')[0]}
              </p>
              <p className="text-[10px] text-blue-400 uppercase font-semibold tracking-wider">
                Authorized Staff
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              title={`Sign out (${user?.email})`}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
