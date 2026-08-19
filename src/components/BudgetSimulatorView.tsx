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
  Legend 
} from 'recharts';
import { 
  Calculator, 
  Sliders, 
  RefreshCw, 
  Coins,
  Save,
  CheckCircle2,
  Cloud
} from 'lucide-react';

export const BudgetSimulatorView: React.FC = () => {
  const { 
    actionPlanData, 
    totalActionPlanBudget, 
    totalStateBudget, 
    totalCommunityBudget, 
    totalPartnerBudget,
    simulatorState,
    updateSimulatorMultipliers,
    updateStandardAdjustment,
    resetSimulator,
    syncStatus,
    lastSyncTime,
  } = useApp();

  const { stateMultiplier, communityMultiplier, partnerMultiplier, standardAdjustments } = simulatorState;

  // Calculate simulated numbers
  const simulatedState = totalStateBudget * (1 + stateMultiplier / 100);
  const simulatedCommunity = totalCommunityBudget * (1 + communityMultiplier / 100);
  const simulatedPartner = totalPartnerBudget * (1 + partnerMultiplier / 100);
  const simulatedTotal = simulatedState + simulatedCommunity + simulatedPartner;

  const totalVariance = simulatedTotal - totalActionPlanBudget;
  const totalVariancePercent = totalActionPlanBudget > 0 ? (totalVariance / totalActionPlanBudget) * 100 : 0;

  // Standard by Standard comparison data
  const comparisonData = SCHOOL_STANDARDS.map((std) => {
    const actRows = actionPlanData.filter((r) => r.standardId === std.id);
    const originalBudget = actRows.reduce((sum, r) => sum + (r.totalBudget || 0), 0);
    const adj = standardAdjustments[std.id] || 0;
    const simulatedBudget = originalBudget * (1 + adj / 100);

    return {
      id: std.id,
      name: `ស្តង់ដា ${std.id}`,
      fullName: std.titleKhmer,
      original: originalBudget,
      simulated: simulatedBudget,
      variance: simulatedBudget - originalBudget,
    };
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              ម៉ាស៊ីនពិសោធន៍ និងគ្រោងថវិកា (School Budget Simulator)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span>សាកល្បងកែប្រែសមាមាត្រថវិការដ្ឋ សហគមន៍ និងដៃគូ ឬបង្កើនកញ្ចប់ថវិកាតាមស្តង់ដាជាក់ស្តែង</span>
            <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
              <Save className="w-3 h-3 text-emerald-600" />
              <span>រក្សាទុកស្វ័យប្រវត្តក្នុង Browser</span>
            </span>
          </p>
        </div>

        <button
          onClick={resetSimulator}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>កំណត់ដើមឡើងវិញ</span>
        </button>
      </div>

      {/* Simulator Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Original Budget */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">ថវិកាគ្រោងបច្ចុប្បន្ន (Original)</span>
          <h3 className="text-xl font-bold text-slate-900 font-mono mt-1">
            {formatCurrencyKhmer(totalActionPlanBudget)}
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            រដ្ឋ: {formatNumberOnly(totalStateBudget)} ៛
          </p>
        </div>

        {/* Simulated Budget */}
        <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-md shadow-blue-600/20">
          <span className="text-xs text-blue-200 font-medium block">ថវិកាបន្ទាប់ពីពិសោធន៍ (Simulated)</span>
          <h3 className="text-xl font-bold font-mono mt-1">
            {formatCurrencyKhmer(simulatedTotal)}
          </h3>
          <p className="text-xs text-blue-200 mt-1 font-mono">
            រដ្ឋ: {formatNumberOnly(simulatedState)} ៛
          </p>
        </div>

        {/* Variance / Difference */}
        <div className={`p-4 rounded-2xl border shadow-xs ${
          totalVariance >= 0 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <span className="text-xs font-medium block">
            {totalVariance >= 0 ? 'កើនឡើងសុទ្ធ (Net Increase)' : 'ថយចុះសុទ្ធ (Net Decrease)'}
          </span>
          <h3 className="text-xl font-bold font-mono mt-1 flex items-center gap-1.5">
            <span>{totalVariance >= 0 ? '+' : ''}{formatCurrencyKhmer(totalVariance)}</span>
          </h3>
          <p className="text-xs font-mono font-semibold mt-1">
            {totalVariance >= 0 ? '+' : ''}{totalVariancePercent.toFixed(1)}% ធៀបនឹងថវិកាដើម
          </p>
        </div>
      </div>

      {/* Sliders & Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Percentage Controls */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>កែប្រែតាមប្រភពធនធាន (Funding Source Multipliers)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              រុញស្លាយដើម្បីបង្កើន ឬបន្ថយភាគរយថវិកា (រក្សាទុកស្វ័យប្រវត្តិ)
            </p>
          </div>

          {/* State Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">ថវិការដ្ឋ (State Grant)</span>
              <span className="font-mono font-bold text-blue-600">
                {stateMultiplier >= 0 ? `+${stateMultiplier}` : stateMultiplier}%
                <span className="text-slate-400 font-normal ml-1">({formatCurrencyKhmer(simulatedState)})</span>
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={stateMultiplier}
              onChange={(e) => updateSimulatorMultipliers({ stateMultiplier: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Community Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">ថវិកាសហគមន៍ (Community Support)</span>
              <span className="font-mono font-bold text-emerald-600">
                {communityMultiplier >= 0 ? `+${communityMultiplier}` : communityMultiplier}%
                <span className="text-slate-400 font-normal ml-1">({formatCurrencyKhmer(simulatedCommunity)})</span>
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={communityMultiplier}
              onChange={(e) => updateSimulatorMultipliers({ communityMultiplier: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Partner Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">ថវិកាដៃគូអភិវឌ្ឍន៍ (Partners / NGOs)</span>
              <span className="font-mono font-bold text-amber-600">
                {partnerMultiplier >= 0 ? `+${partnerMultiplier}` : partnerMultiplier}%
                <span className="text-slate-400 font-normal ml-1">({formatCurrencyKhmer(simulatedPartner)})</span>
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={partnerMultiplier}
              onChange={(e) => updateSimulatorMultipliers({ partnerMultiplier: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
          </div>
        </div>

        {/* Standard-specific Controls */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-600" />
              <span>កែប្រែតាមស្តង់ដា (Standard Specific Allocations)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              បង្កើនការវិនិយោគលើស្តង់ដាអាទិភាព (ឧ. ស្តង់ដាទី ១ ឬ ទី ២)
            </p>
          </div>

          <div className="space-y-3">
            {SCHOOL_STANDARDS.map((std) => {
              const val = standardAdjustments[std.id] || 0;
              return (
                <div key={std.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 truncate max-w-[240px]">
                      ស្តង់ដាទី {std.id}: {std.titleKhmer.split('៖')[1] || std.titleKhmer}
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {val >= 0 ? `+${val}` : val}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="100"
                    step="5"
                    value={val}
                    onChange={(e) => updateStandardAdjustment(std.id, parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
          ការប្រៀបធៀបថវិកាដើម ធៀបនឹងការពិសោធន៍ (Original vs Simulated by Standard)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          បង្ហាញពីភាពខុសគ្នានៃការបែងចែកថវិកាតាមស្តង់ដានីមួយៗ
        </p>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toLocaleString()}k`} tick={{ fontSize: 11 }} />
              <Tooltip 
                formatter={(val: number) => formatCurrencyKhmer(val)}
                labelFormatter={(label) => {
                  const item = comparisonData.find((s) => s.name === label);
                  return item ? item.fullName : label;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="original" name="ថវិកាដើម (Original)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="simulated" name="ថវិកាពិសោធន៍ (Simulated)" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
