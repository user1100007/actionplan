import React from 'react';
import { useApp } from '../context/AppContext';
import { SCHOOL_STANDARDS, formatCurrencyKhmer, formatNumberOnly } from '../data/standards';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Building2, 
  ShieldCheck, 
  Calendar, 
  Coins, 
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  PieChart as PieIcon
} from 'lucide-react';

const STANDARD_ICONS = [GraduationCap, BookOpen, Users, Building2, ShieldCheck];
const SOURCE_COLORS = ['#3b82f6', '#10b981', '#f59e0b'];
const STANDARD_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#f43f5e'];

export const DashboardView: React.FC = () => {
  const { 
    actionPlanData, 
    sofData, 
    totalActionPlanBudget, 
    totalStateBudget, 
    totalCommunityBudget, 
    totalPartnerBudget,
    setTab,
    setSelectedStandard 
  } = useApp();

  // Calculate budget per standard
  const standardStats = SCHOOL_STANDARDS.map((std, idx) => {
    const actRows = actionPlanData.filter((r) => r.standardId === std.id);
    const sofRows = sofData.filter((r) => r.standardId === std.id);
    const totalBudget = actRows.reduce((sum, r) => sum + (r.totalBudget || 0), 0);
    const stateBudget = actRows.reduce((sum, r) => sum + (r.funding.state || 0), 0);
    const communityBudget = actRows.reduce((sum, r) => sum + (r.funding.community || 0), 0);
    const partnerBudget = actRows.reduce((sum, r) => sum + (r.funding.partner || 0), 0);

    return {
      id: std.id,
      name: `ស្តង់ដា ${std.id}`,
      fullName: std.titleKhmer,
      englishName: std.titleEnglish,
      code: std.code,
      activitiesCount: actRows.length,
      indicatorsCount: sofRows.length,
      totalBudget,
      stateBudget,
      communityBudget,
      partnerBudget,
      color: STANDARD_COLORS[idx],
    };
  });

  // Funding distribution data for Pie chart
  const fundingSourceData = [
    { name: 'រដ្ឋ (State)', value: totalStateBudget || 1, color: SOURCE_COLORS[0] },
    { name: 'សហគមន៍ (Community)', value: totalCommunityBudget || 0, color: SOURCE_COLORS[1] },
    { name: 'ដៃគូ (Partner)', value: totalPartnerBudget || 0, color: SOURCE_COLORS[2] },
  ];

  // Calculate quarters distribution
  const quartersCount = {
    q1: actionPlanData.filter((r) => r.quarters.q1).length,
    q2: actionPlanData.filter((r) => r.quarters.q2).length,
    q3: actionPlanData.filter((r) => r.quarters.q3).length,
    q4: actionPlanData.filter((r) => r.quarters.q4).length,
  };

  const handleStandardClick = (stdId: number) => {
    setSelectedStandard(stdId);
    setTab('action_plan');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-2xl p-6 text-white shadow-lg shadow-blue-900/10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-xs text-xs font-semibold rounded-full uppercase tracking-wider inline-block mb-3">
              ប្រព័ន្ធព័ត៌មានវិទ្យាគ្រប់គ្រងសាលារៀនគំរូ (School Information System)
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-khmer leading-snug">
              ផែនការប្រតិបត្តិ និងបែងចែកថវិកាប្រចាំឆ្នាំ
            </h2>
            <p className="text-blue-100 text-sm mt-1.5 leading-relaxed">
              រួមបញ្ចូលនូវសកម្មភាពគន្លឹះចំនួន ៧១ សកម្មភាព ផ្អែកលើ ៥ ស្តង់ដាសាលារៀនគំរូ ព្រមទាំងការបែងចែកថវិកា SOF និងក្របខណ្ឌសមិទ្ធកម្ម EFMS របស់ក្រសួងអប់រំ យុវជន និងកីឡា។
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setTab('action_plan')}
              className="px-4 py-2.5 bg-white text-blue-800 hover:bg-blue-50 font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <span>មើលផែនការសកម្មភាព ៧១</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTab('budget_planner')}
              className="px-4 py-2.5 bg-blue-600/80 hover:bg-blue-600 border border-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2"
            >
              <Coins className="w-4 h-4" />
              <span>ពិសោធន៍ថវិកា</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Budget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">ថវិកាគ្រោងសរុប (N+1)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 font-mono">
              {formatCurrencyKhmer(totalActionPlanBudget)}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-emerald-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>រៀបចំតាមកញ្ចប់ថវិកាសាលា</span>
            </div>
          </div>
        </div>

        {/* Card 2: State vs Community */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">ប្រភពថវិការដ្ឋ (State Funding)</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 font-mono">
              {formatCurrencyKhmer(totalStateBudget)}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5">
              សហគមន៍ & ដៃគូ៖ {formatCurrencyKhmer(totalCommunityBudget + totalPartnerBudget)}
            </p>
          </div>
        </div>

        {/* Card 3: Total Action Items */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">សកម្មភាពសរុប (Action Items)</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 font-mono">
              {actionPlanData.length} <span className="text-sm font-normal text-slate-500 font-khmer">សកម្មភាព</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1.5">
              គ្របដណ្តប់ ៥ ស្តង់ដាសាលារៀនគំរូ
            </p>
          </div>
        </div>

        {/* Card 4: SOF Indicators */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">សូចនាករ SOF & EFMS</span>
            <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
              <PieIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 font-mono">
              {sofData.length} <span className="text-sm font-normal text-slate-500 font-khmer">សូចនាករ</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1.5">
              តាមដានលទ្ធផល និងវាយតម្លៃសមិទ្ធកម្ម
            </p>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Budget by Standard (Bar Chart) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  ការបែងចែកថវិកា តាមស្តង់ដានីមួយៗ (Budget by Standard)
                </h3>
                <p className="text-xs text-slate-500">គិតជាប្រាក់រៀល (KHR) សម្រាប់ឆ្នាំគ្រោងថវិកា N+1</p>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={standardStats} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis 
                    tickFormatter={(val) => `${(val / 1000).toLocaleString()}k`} 
                    tick={{ fontSize: 11 }} 
                  />
                  <Tooltip 
                    formatter={(val: number) => [formatCurrencyKhmer(val), 'ថវិកា']}
                    labelFormatter={(label) => {
                      const item = standardStats.find((s) => s.name === label);
                      return item ? item.fullName : label;
                    }}
                  />
                  <Bar dataKey="totalBudget" name="ថវិកាសរុប" radius={[6, 6, 0, 0]}>
                    {standardStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 border-t border-slate-100 text-center">
            {standardStats.map((s) => (
              <div key={s.id} className="p-2 rounded-lg bg-slate-50">
                <span className="text-[11px] text-slate-500 block truncate">{s.name}</span>
                <span className="text-xs font-bold text-slate-900 block font-mono">
                  {formatCurrencyKhmer(s.totalBudget)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Funding Source Pie Chart & Quarterly Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
              សមាមាត្រប្រភពថវិកា (Funding Sources)
            </h3>
            <p className="text-xs text-slate-500 mb-4">រដ្ឋ, សហគមន៍, និងដៃគូអភិវឌ្ឍន៍</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fundingSourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {fundingSourceData.map((entry, index) => (
                      <Cell key={`cell-pie-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => formatCurrencyKhmer(val)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-2">
              {fundingSourceData.map((src, i) => {
                const percent = totalActionPlanBudget > 0 
                  ? ((src.value / totalActionPlanBudget) * 100).toFixed(1)
                  : 0;
                return (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: src.color }}></span>
                      <span className="text-slate-700 font-medium">{src.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold font-mono">{percent}%</span>
                      <span className="text-slate-400 ml-1.5">({formatNumberOnly(src.value)} ៛)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quarterly Implementation Schedule Bar */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-700 mb-2.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>សកម្មភាពតាមត្រីមាស (Quarterly Timeline)</span>
            </h4>
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className="bg-blue-50/70 p-2 rounded-lg border border-blue-100">
                <span className="text-[10px] font-bold text-blue-600 block">Q1</span>
                <span className="text-xs font-bold text-slate-800">{quartersCount.q1}</span>
                <span className="text-[10px] text-slate-500 block">សកម្មភាព</span>
              </div>
              <div className="bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-600 block">Q2</span>
                <span className="text-xs font-bold text-slate-800">{quartersCount.q2}</span>
                <span className="text-[10px] text-slate-500 block">សកម្មភាព</span>
              </div>
              <div className="bg-amber-50/70 p-2 rounded-lg border border-amber-100">
                <span className="text-[10px] font-bold text-amber-600 block">Q3</span>
                <span className="text-xs font-bold text-slate-800">{quartersCount.q3}</span>
                <span className="text-[10px] text-slate-500 block">សកម្មភាព</span>
              </div>
              <div className="bg-purple-50/70 p-2 rounded-lg border border-purple-100">
                <span className="text-[10px] font-bold text-purple-600 block">Q4</span>
                <span className="text-xs font-bold text-slate-800">{quartersCount.q4}</span>
                <span className="text-[10px] text-slate-500 block">សកម្មភាព</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Standards Detailed Interactive Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              ស្តង់ដាសាលារៀនគំរូទាំង ៥ (5 Model School Standards)
            </h3>
            <p className="text-xs text-slate-500">
              ចុចលើស្តង់ដាណាមួយដើម្បីចូលទៅកាន់តារាងសកម្មភាពលម្អិត
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {standardStats.map((std, idx) => {
            const Icon = STANDARD_ICONS[idx];
            return (
              <div
                key={std.id}
                onClick={() => handleStandardClick(std.id)}
                className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: std.color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {std.code}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          ស្តង់ដាទី{std.id}
                        </h4>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold shrink-0 font-mono">
                      {std.activitiesCount} សកម្មភាព
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 font-medium line-clamp-2 min-h-[32px]">
                    {std.fullName}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">ថវិកាគ្រោង</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {formatCurrencyKhmer(std.totalBudget)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>ចូលមើល</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
