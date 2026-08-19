import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SOFRow } from '../types';
import { SCHOOL_STANDARDS, formatCurrencyKhmer, formatNumberOnly } from '../data/standards';
import { Edit3, Check, X, FileSpreadsheet, Layers, Coins } from 'lucide-react';

export const SOFView: React.FC = () => {
  const { 
    sofData, 
    selectedStandard, 
    searchQuery, 
    updateSOFRow 
  } = useApp();

  const [editingRow, setEditingRow] = useState<SOFRow | null>(null);

  const filteredRows = useMemo(() => {
    return sofData.filter((row) => {
      if (selectedStandard !== null && row.standardId !== selectedStandard) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          row.indicatorCode.toLowerCase().includes(q) ||
          row.indicatorTitle.toLowerCase().includes(q) ||
          row.categoryTitle?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [sofData, selectedStandard, searchQuery]);

  const totalState = filteredRows.reduce((sum, r) => sum + (r.budgetState || 0), 0);
  const totalNonState = filteredRows.reduce((sum, r) => sum + (r.budgetNonState || 0), 0);
  const totalBudget = filteredRows.reduce((sum, r) => sum + (r.budgetTotal || 0), 0);

  const groupedByStandard = useMemo(() => {
    const groups: { [key: number]: SOFRow[] } = {};
    filteredRows.forEach((r) => {
      if (!groups[r.standardId]) groups[r.standardId] = [];
      groups[r.standardId].push(r);
    });
    return groups;
  }, [filteredRows]);

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;
    updateSOFRow(editingRow.id, editingRow);
    setEditingRow(null);
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              របាយការណ៍បែងចែកថវិកា SOF (Statement of Financing)
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
              {filteredRows.length} សូចនាករ
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            តារាងតាមដានលទ្ធផលសម្រេចឆ្នាំ N គោលដៅគ្រោង N+1 និងការបែងចែកថវិកាតាមសូចនាករ
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 text-white p-4 rounded-2xl shadow-sm">
        <div>
          <span className="text-[11px] text-slate-400 block">ថវិការដ្ឋគ្រោងសរុប (State Budget)</span>
          <span className="text-sm sm:text-base font-bold font-mono text-blue-400">
            {formatCurrencyKhmer(totalState)}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block">ថវិកាក្រៅពីរដ្ឋ (Non-State Budget)</span>
          <span className="text-sm sm:text-base font-bold font-mono text-amber-400">
            {formatCurrencyKhmer(totalNonState)}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block">ថវិកាសរុប (Total Budget)</span>
          <span className="text-sm sm:text-base font-bold font-mono text-emerald-300">
            {formatCurrencyKhmer(totalBudget)}
          </span>
        </div>
      </div>

      {/* SOF Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-3 w-16 text-center border-r border-slate-200">ល.រ</th>
                <th className="py-3 px-4 min-w-[280px] border-r border-slate-200">ឈ្មោះសូចនាករ (Indicator Title)</th>
                <th className="py-3 px-3 w-20 text-center border-r border-slate-200">ឯកតា</th>
                <th className="py-3 px-3 w-28 text-center border-r border-slate-200">
                  <div className="text-[11px]">លទ្ធផលសម្រេច</div>
                  <div className="text-[10px] text-slate-500 font-normal">ឆ្នាំ N</div>
                </th>
                <th className="py-3 px-3 w-28 text-center border-r border-slate-200">
                  <div className="text-[11px]">គោលដៅគ្រោង</div>
                  <div className="text-[10px] text-slate-500 font-normal">ឆ្នាំ N+1</div>
                </th>
                <th className="py-3 px-3 w-32 text-right border-r border-slate-200 font-mono">
                  ថវិការដ្ឋ (៛)
                </th>
                <th className="py-3 px-3 w-32 text-right border-r border-slate-200 font-mono">
                  ថវិកាក្រៅពីរដ្ឋ (៛)
                </th>
                <th className="py-3 px-3 w-36 text-right border-r border-slate-200 font-mono">
                  ថវិកាសរុប (៛)
                </th>
                <th className="py-3 px-2 w-14 text-center">កែប្រែ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {Object.keys(groupedByStandard).length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500">
                    <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <span>មិនមានទិន្នន័យស្របតាមលក្ខខណ្ឌស្វែងរកឡើយ</span>
                  </td>
                </tr>
              ) : (
                Object.entries(groupedByStandard).map(([stdIdStr, rows]) => {
                  const stdId = parseInt(stdIdStr);
                  const standardMeta = SCHOOL_STANDARDS.find((s) => s.id === stdId);
                  const stdTotal = rows.reduce((sum, r) => sum + (r.budgetTotal || 0), 0);

                  return (
                    <React.Fragment key={`sof-group-${stdId}`}>
                      {/* Standard Header */}
                      <tr className="bg-slate-800 text-white font-bold">
                        <td colSpan={7} className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                            <span className="text-xs sm:text-sm">{standardMeta?.titleKhmer || `ស្តង់ដាទី ${stdId}`}</span>
                            <span className="text-[11px] font-normal text-slate-300 ml-2 font-mono">
                              ({rows.length} សូចនាករ)
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold text-xs">
                          {formatCurrencyKhmer(stdTotal)}
                        </td>
                        <td></td>
                      </tr>

                      {/* Row Items */}
                      {rows.map((row) => (
                        <tr key={row.id} className="hover:bg-blue-50/40 transition-colors text-slate-800 group">
                          {/* Code */}
                          <td className="py-2.5 px-3 text-center font-bold text-blue-700 bg-slate-50/50 border-r border-slate-100 font-mono">
                            {row.indicatorCode || '•'}
                          </td>

                          {/* Indicator Title */}
                          <td className="py-2.5 px-4 font-medium text-slate-900 border-r border-slate-100">
                            <div>{row.indicatorTitle}</div>
                            {row.categoryTitle && (
                              <span className="inline-block mt-0.5 text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                                {row.categoryTitle}
                              </span>
                            )}
                          </td>

                          {/* Unit */}
                          <td className="py-2.5 px-3 text-center border-r border-slate-100 text-slate-600 font-medium">
                            {row.unit || '%'}
                          </td>

                          {/* Result N */}
                          <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono font-semibold text-slate-700 bg-slate-50/30">
                            {row.currentYearResultN !== '' ? String(row.currentYearResultN) : '-'}
                          </td>

                          {/* Target N+1 */}
                          <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono font-bold text-blue-600 bg-blue-50/20">
                            {row.targetYearGoalNPlus1 !== '' ? String(row.targetYearGoalNPlus1) : '-'}
                          </td>

                          {/* State Budget */}
                          <td className="py-2.5 px-3 text-right font-mono border-r border-slate-100">
                            {row.budgetState > 0 ? (
                              <span className="text-blue-700 font-semibold">{formatNumberOnly(row.budgetState)}</span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>

                          {/* Non-State Budget */}
                          <td className="py-2.5 px-3 text-right font-mono border-r border-slate-100">
                            {row.budgetNonState > 0 ? (
                              <span className="text-amber-700 font-semibold">{formatNumberOnly(row.budgetNonState)}</span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>

                          {/* Total Budget */}
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 border-r border-slate-100">
                            {row.budgetTotal > 0 ? (
                              <span className="text-emerald-700">{formatCurrencyKhmer(row.budgetTotal)}</span>
                            ) : (
                              <span className="text-slate-400">0 ៛</span>
                            )}
                          </td>

                          {/* Edit Button */}
                          <td className="py-2.5 px-2 text-center align-middle">
                            <button
                              onClick={() => setEditingRow(row)}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="កែប្រែ"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingRow && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">កែប្រែសូចនាករ ({editingRow.indicatorCode})</h3>
                  <p className="text-xs text-slate-500">{editingRow.standardTitle}</p>
                </div>
              </div>
              <button onClick={() => setEditingRow(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSave} className="py-4 space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">ឈ្មោះសូចនាករ (Indicator Title)</label>
                <input
                  type="text"
                  value={editingRow.indicatorTitle}
                  onChange={(e) => setEditingRow({ ...editingRow, indicatorTitle: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ឯកតា</label>
                  <input
                    type="text"
                    value={editingRow.unit}
                    onChange={(e) => setEditingRow({ ...editingRow, unit: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">លទ្ធផលឆ្នាំ N</label>
                  <input
                    type="text"
                    value={String(editingRow.currentYearResultN)}
                    onChange={(e) => setEditingRow({ ...editingRow, currentYearResultN: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">គោលដៅឆ្នាំ N+1</label>
                  <input
                    type="text"
                    value={String(editingRow.targetYearGoalNPlus1)}
                    onChange={(e) => setEditingRow({ ...editingRow, targetYearGoalNPlus1: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ថវិការដ្ឋ (៛)</label>
                  <input
                    type="number"
                    value={editingRow.budgetState}
                    onChange={(e) => setEditingRow({ ...editingRow, budgetState: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ថវិកាក្រៅពីរដ្ឋ (៛)</label>
                  <input
                    type="number"
                    value={editingRow.budgetNonState}
                    onChange={(e) => setEditingRow({ ...editingRow, budgetNonState: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRow(null)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  រក្សាទុក
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
