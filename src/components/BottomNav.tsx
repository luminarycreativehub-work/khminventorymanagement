import React from 'react';
import { LayoutDashboard, Layers, Plus, History } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'dashboard' | 'inventory' | 'activity';
  setCurrentTab: (tab: 'dashboard' | 'inventory' | 'activity') => void;
  onOpenAddModal: () => void;
  totalProperties: number;
}

export function BottomNav({
  currentTab,
  setCurrentTab,
  onOpenAddModal,
  totalProperties,
}: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-3 py-1.5 safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* Dashboard */}
        <button
          type="button"
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentTab === 'dashboard' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Dashboard</span>
        </button>

        {/* Center Add Button */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex flex-col items-center justify-center -mt-5 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 group-active:scale-95 transition-transform border-4 border-slate-950">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-semibold text-blue-400 mt-0.5">Add Unit</span>
        </button>

        {/* Inventory */}
        <button
          type="button"
          onClick={() => setCurrentTab('inventory')}
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentTab === 'inventory' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Inventory</span>
          {totalProperties > 0 && (
            <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
              {totalProperties > 99 ? '99+' : totalProperties}
            </span>
          )}
        </button>

        {/* Activity */}
        <button
          type="button"
          onClick={() => setCurrentTab('activity')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentTab === 'activity' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">History</span>
        </button>
      </div>
    </nav>
  );
}
