import React from 'react';
import { useApp } from '../context/AppContext';
import { ViewTab } from '../types';
import { SCHOOL_STANDARDS } from '../data/standards';
import { 
  LayoutDashboard, 
  ListTodo, 
  FileSpreadsheet, 
  TrendingUp, 
  Calculator, 
  Printer, 
  Filter
} from 'lucide-react';

interface TabItem {
  key: ViewTab;
  labelKhmer: string;
  labelEnglish: string;
  icon: React.ElementType;
  badge?: number | string;
}

export const Navigation: React.FC = () => {
  const { 
    tab, 
    setTab, 
    selectedStandard, 
    setSelectedStandard, 
    actionPlanData, 
    sofData, 
    efmsData 
  } = useApp();

  const tabs: TabItem[] = [
    {
      key: 'dashboard',
      labelKhmer: 'ផ្ទាំងគ្រប់គ្រង',
      labelEnglish: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      key: 'action_plan',
      labelKhmer: 'ផែនការសកម្មភាព',
      labelEnglish: 'Action Plan',
      icon: ListTodo,
      badge: actionPlanData.length,
    },
    {
      key: 'sof',
      labelKhmer: 'បែងចែកថវិកា SOF',
      labelEnglish: 'SOF Financing',
      icon: FileSpreadsheet,
      badge: sofData.length,
    },
    {
      key: 'efms',
      labelKhmer: 'ក្របខណ្ឌសមិទ្ធកម្ម EFMS',
      labelEnglish: 'EFMS Matrix',
      icon: TrendingUp,
      badge: efmsData.length,
    },
    {
      key: 'budget_planner',
      labelKhmer: 'ពិសោធន៍ថវិកា',
      labelEnglish: 'Budget Planner',
      icon: Calculator,
    },
    {
      key: 'export_print',
      labelKhmer: 'បោះពុម្ព និងទាញយក',
      labelEnglish: 'Print & Export',
      icon: Printer,
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Tab Bar */}
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar pt-2">
          <nav className="flex space-x-1 sm:space-x-2">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
                    isActive
                      ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{t.labelKhmer}</span>
                  {t.badge !== undefined && (
                    <span
                      className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Standards Filter Sub-bar (for Action Plan, SOF, EFMS) */}
        {['dashboard', 'action_plan', 'sof', 'efms'].includes(tab) && (
          <div className="py-2.5 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>ស្តង់ដា៖</span>
            </div>

            <button
              onClick={() => setSelectedStandard(null)}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-all shrink-0 ${
                selectedStandard === null
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ទាំងអស់ (5 ស្តង់ដា)
            </button>

            {SCHOOL_STANDARDS.map((std) => {
              const isSelected = selectedStandard === std.id;
              return (
                <button
                  key={std.id}
                  onClick={() => setSelectedStandard(isSelected ? null : std.id)}
                  className={`px-3 py-1 text-xs rounded-full font-medium transition-all shrink-0 flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    std.id === 1 ? 'bg-emerald-400' :
                    std.id === 2 ? 'bg-blue-400' :
                    std.id === 3 ? 'bg-violet-400' :
                    std.id === 4 ? 'bg-amber-400' : 'bg-rose-400'
                  }`} />
                  <span className="truncate max-w-[200px] sm:max-w-none">
                    ស្តង់ដាទី{std.id} ({std.code})
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
