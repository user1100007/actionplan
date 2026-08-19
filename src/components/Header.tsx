import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrencyKhmer } from '../data/standards';
import { AuthModal } from './AuthModal';
import { 
  BookOpen, 
  RotateCcw, 
  Printer, 
  Search, 
  Coins,
  Cloud,
  Save,
  User as UserIcon,
  CheckCircle2,
  Loader2,
  Sparkles
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    totalActionPlanBudget, 
    searchQuery, 
    setSearchQuery, 
    resetToDefaultData, 
    setTab,
    user,
    syncStatus,
    schoolInfo
  } = useApp();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        {/* Top National Header Bar */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 text-white px-4 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>ក្រសួងអប់រំ យុវជន និងកីឡា • {schoolInfo.schoolName} ({schoolInfo.province})</span>
            </div>
            
            <div className="flex items-center gap-3 text-blue-200">
              {/* Storage & Cloud Indicator */}
              <div 
                onClick={() => setIsAuthModalOpen(true)}
                className="cursor-pointer hover:text-white flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2.5 py-0.5 rounded-full transition-all"
                title="ចុចដើម្បីមើលស្ថានភាព Cloud & Local Storage"
              >
                <Save className="w-3 h-3 text-emerald-300" />
                <span className="text-[11px] font-medium">Local: រក្សាទុកស្វ័យប្រវត្ត</span>
                <span className="text-white/40">•</span>
                <Cloud className={`w-3 h-3 ${user ? 'text-blue-300' : 'text-slate-400'}`} />
                <span className="text-[11px] font-medium">
                  {syncStatus === 'synced' ? 'Cloud: បាន Sync' : syncStatus === 'saving' ? 'Cloud: កំពុង Sync...' : user ? 'Cloud: បានភ្ជាប់' : 'Cloud: មិនទាន់ភ្ជាប់'}
                </span>
              </div>

              <span className="hidden sm:inline">•</span>
              <span className="hidden md:inline">ឆ្នាំគ្រោងថវិកា៖ ឆ្នាំ N+1</span>
            </div>
          </div>
        </div>

        {/* Main App Title & Actions Header */}
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Logo & Titles */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight font-khmer">
                    ប្រព័ន្ធគ្រប់គ្រងផែនការសកម្មភាព និងថវិកាសាលារៀន
                  </h1>
                  <span className="hidden lg:inline-block px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                    MoEYS Standard
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  School Action Plan (71 សកម្មភាព), SOF & EFMS Matrix • រក្សាទុកស្វ័យប្រវត្តិ
                </p>
              </div>
            </div>

            {/* Quick Metrics & Actions */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
              {/* Search Input */}
              <div className="relative flex-1 sm:w-56 md:w-48">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ស្វែងរកសកម្មភាព..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Total Budget Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 shrink-0">
                <Coins className="w-4 h-4 text-emerald-600" />
                <div className="text-left">
                  <span className="text-[10px] text-emerald-600 block leading-none font-medium">ថវិកាសរុប</span>
                  <span className="text-xs sm:text-sm font-bold leading-tight font-mono">
                    {formatCurrencyKhmer(totalActionPlanBudget)}
                  </span>
                </div>
              </div>

              {/* Cloud / Auth Button */}
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  user 
                    ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xs'
                }`}
                title="គ្រប់គ្រងគណនី & សមកាលកម្ម Cloud Firestore"
              >
                {user ? (
                  <>
                    <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                      {user.displayName ? user.displayName[0] : 'U'}
                    </div>
                    <span className="max-w-[80px] truncate">{user.displayName || user.email || 'គណនី'}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </>
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Sync Cloud</span>
                  </>
                )}
              </button>

              {/* Print Action */}
              <button
                onClick={() => setTab('export_print')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title="បោះពុម្ព និងទាញយករបាយការណ៍"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">បោះពុម្ព</span>
              </button>

              {/* Reset to Original */}
              <button
                onClick={resetToDefaultData}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                title="កំណត់ទិន្នន័យឡើងវិញ (Reset to Original)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">កំណត់ឡើងវិញ</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Auth & Sync Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
};
