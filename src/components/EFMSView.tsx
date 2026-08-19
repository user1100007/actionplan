import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { EFMSRow } from '../types';
import { SCHOOL_STANDARDS, formatCurrencyKhmer, formatNumberOnly } from '../data/standards';
import { Edit3, TrendingUp, Layers, Info } from 'lucide-react';

export const EFMSView: React.FC = () => {
  const { 
    efmsData, 
    selectedStandard, 
    searchQuery, 
    updateEFMSRow 
  } = useApp();

  const [editingRow, setEditingRow] = useState<EFMSRow | null>(null);

  const filteredRows = useMemo(() => {
    return efmsData.filter((row) => {
      if (selectedStandard !== null && row.standardId !== selectedStandard) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          row.indicatorCode.toLowerCase().includes(q) ||
          row.indicatorTitle.toLowerCase().includes(q) ||
          row.reasonForChange.toLowerCase().includes(q) ||
          row.categoryTitle?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [efmsData, selectedStandard, searchQuery]);

  const totalEFMSBudget = filteredRows.reduce((sum, r) => sum + (r.budgetNPlus1 || 0), 0);

  const groupedByStandard = useMemo(() => {
    const groups: { [key: number]: EFMSRow[] } = {};
    filteredRows.forEach((r) => {
      if (!groups[r.standardId]) groups[r.standardId] = [];
      groups[r.standardId].push(r);
    });
    return groups;
  }, [filteredRows]);

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;
    updateEFMSRow(editingRow.id, editingRow);
    setEditingRow(null);
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              ក្របខណ្ឌសមិទ្ធកម្ម និងហិរញ្ញវត្ថុ EFMS (Performance & Financial Matrix)
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
              {filteredRows.length} សូចនាករ
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            តារាងតាមដានសមិទ្ធកម្មពហុឆ្នាំ (N-1, N, N+1, N+2, N+3) និងមូលហេតុនៃការផ្លាស់ប្តូរ
          </p>
        </div>

        <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
          <span className="text-[10px] text-emerald-600 block leading-none">ថវិកាគ្រោងសរុប (N+1)</span>
          <span className="text-sm font-bold font-mono">{formatCurrencyKhmer(totalEFMSBudget)}</span>
        </div>
      </div>

      {/* EFMS Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-3 w-14 text-center border-r border-slate-200">ល.រ</th>
                <th className="py-3 px-4 min-w-[260px] border-r border-slate-200">សូចនាករ និងទិន្នន័យ</th>
                <th className="py-3 px-3 w-28 text-right border-r border-slate-200 font-mono">
                  ថវិកា N+1 (៛)
                </th>
                <th className="py-3 px-2 w-20 text-center border-r border-slate-200 font-mono">
                  <div className="text-[11px]">N-1</div>
                  <div className="text-[9px] text-slate-400 font-normal">លទ្ធផល</div>
                </th>
                <th className="py-3 px-2 w-20 text-center border-r border-slate-200 font-mono">
                  <div className="text-[11px]">N</div>
                  <div className="text-[9px] text-slate-400 font-normal">គោលដៅ</div>
                </th>
                <th className="py-3 px-2 w-20 text-center border-r border-slate-200 font-mono bg-blue-50/50 text-blue-900">
                  <div className="text-[11px] font-bold">N+1</div>
                  <div className="text-[9px] text-blue-600 font-normal">គោលដៅ</div>
                </th>
                <th className="py-3 px-3 min-w-[200px] border-r border-slate-200">
                  មូលហេតុនៃការផ្លាស់ប្តូរ (Remarks)
                </th>
                <th className="py-3 px-2 w-20 text-center border-r border-slate-200 font-mono">
                  <div className="text-[11px]">N+2</div>
                  <div className="text-[9px] text-slate-400 font-normal">គោលដៅ</div>
                </th>
                <th className="py-3 px-2 w-20 text-center border-r border-slate-200 font-mono">
                  <div className="text-[11px]">N+3</div>
                  <div className="text-[9px] text-slate-400 font-normal">គោលដៅ</div>
                </th>
                <th className="py-3 px-2 w-14 text-center">កែប្រែ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {Object.keys(groupedByStandard).length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-500">
                    <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <span>មិនមានទិន្នន័យស្របតាមលក្ខខណ្ឌស្វែងរកឡើយ</span>
                  </td>
                </tr>
              ) : (
                Object.entries(groupedByStandard).map(([stdIdStr, rows]) => {
                  const stdId = parseInt(stdIdStr);
                  const standardMeta = SCHOOL_STANDARDS.find((s) => s.id === stdId);
                  const stdTotal = rows.reduce((sum, r) => sum + (r.budgetNPlus1 || 0), 0);

                  return (
                    <React.Fragment key={`efms-group-${stdId}`}>
                      {/* Standard Header */}
                      <tr className="bg-slate-800 text-white font-bold">
                        <td colSpan={2} className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                            <span className="text-xs sm:text-sm">{standardMeta?.titleKhmer || `ស្តង់ដាទី ${stdId}`}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold text-xs">
                          {formatCurrencyKhmer(stdTotal)}
                        </td>
                        <td colSpan={7} className="py-2.5 px-3 text-slate-400 text-right text-[11px]">
                          {rows.length} សូចនាករ
                        </td>
                      </tr>

                      {/* Main Indicators */}
                      {rows.map((row) => (
                        <React.Fragment key={row.id}>
                          <tr className="hover:bg-blue-50/40 transition-colors text-slate-800 group">
                            {/* Code */}
                            <td className="py-2.5 px-3 text-center font-bold text-blue-700 bg-slate-50/50 border-r border-slate-100 font-mono">
                              {row.indicatorCode || '•'}
                            </td>

                            {/* Title */}
                            <td className="py-2.5 px-4 font-medium text-slate-900 border-r border-slate-100">
                              <div>{row.indicatorTitle}</div>
                              {row.categoryTitle && (
                                <span className="inline-block mt-0.5 text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                                  {row.categoryTitle}
                                </span>
                              )}
                            </td>

                            {/* Budget N+1 */}
                            <td className="py-2.5 px-3 text-right font-mono border-r border-slate-100 font-semibold text-slate-900">
                              {row.budgetNPlus1 > 0 ? (
                                <span className="text-emerald-700">{formatNumberOnly(row.budgetNPlus1)} ៛</span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>

                            {/* N-1 */}
                            <td className="py-2.5 px-2 text-center font-mono border-r border-slate-100 text-slate-600">
                              {row.historyNMinus1 !== '' ? String(row.historyNMinus1) : '-'}
                            </td>

                            {/* N */}
                            <td className="py-2.5 px-2 text-center font-mono border-r border-slate-100 text-slate-700 font-semibold">
                              {row.currentYearN !== '' ? String(row.currentYearN) : '-'}
                            </td>

                            {/* N+1 */}
                            <td className="py-2.5 px-2 text-center font-mono border-r border-slate-100 text-blue-700 font-bold bg-blue-50/30">
                              {row.targetNPlus1 !== '' ? String(row.targetNPlus1) : '-'}
                            </td>

                            {/* Reason for Change */}
                            <td className="py-2.5 px-3 border-r border-slate-100 text-slate-600 text-[11px] leading-relaxed">
                              {row.reasonForChange || '-'}
                            </td>

                            {/* N+2 */}
                            <td className="py-2.5 px-2 text-center font-mono border-r border-slate-100 text-slate-600">
                              {row.targetNPlus2 !== '' ? String(row.targetNPlus2) : '-'}
                            </td>

                            {/* N+3 */}
                            <td className="py-2.5 px-2 text-center font-mono border-r border-slate-100 text-slate-600">
                              {row.targetNPlus3 !== '' ? String(row.targetNPlus3) : '-'}
                            </td>

                            {/* Action Edit */}
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

                          {/* Sub-rows (e.g. Gender Breakdown ស្រី / ប្រុស) */}
                          {row.genderRows &&
                            row.genderRows.map((gRow, gIdx) => (
                              <tr key={`g-${row.id}-${gIdx}`} className="bg-slate-50/50 text-[11px] text-slate-600">
                                <td className="py-1 px-3 text-center border-r border-slate-100"></td>
                                <td className="py-1 px-4 pl-8 border-r border-slate-100 text-slate-500 font-medium">
                                  - {gRow.label}
                                </td>
                                <td className="py-1 px-3 text-right font-mono border-r border-slate-100 text-slate-300">-</td>
                                <td className="py-1 px-2 text-center font-mono border-r border-slate-100">{String(gRow.nMinus1 || '-')}</td>
                                <td className="py-1 px-2 text-center font-mono border-r border-slate-100">{String(gRow.currentN || '-')}</td>
                                <td className="py-1 px-2 text-center font-mono border-r border-slate-100 bg-blue-50/20 text-blue-600 font-semibold">-</td>
                                <td className="py-1 px-3 border-r border-slate-100 text-slate-400">-</td>
                                <td className="py-1 px-2 text-center font-mono border-r border-slate-100">{String(gRow.targetNPlus2 || '-')}</td>
                                <td className="py-1 px-2 text-center font-mono border-r border-slate-100">{String(gRow.targetNPlus3 || '-')}</td>
                                <td></td>
                              </tr>
                            ))}
                        </React.Fragment>
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
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">កែប្រែទិន្នន័យ EFMS ({editingRow.indicatorCode})</h3>
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

              <div>
                <label className="block text-slate-700 font-semibold mb-1">ថវិកាគ្រោង N+1 (៛)</label>
                <input
                  type="number"
                  value={editingRow.budgetNPlus1}
                  onChange={(e) => setEditingRow({ ...editingRow, budgetNPlus1: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">លទ្ធផល N-1</label>
                  <input
                    type="text"
                    value={String(editingRow.historyNMinus1)}
                    onChange={(e) => setEditingRow({ ...editingRow, historyNMinus1: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">គោលដៅ N</label>
                  <input
                    type="text"
                    value={String(editingRow.currentYearN)}
                    onChange={(e) => setEditingRow({ ...editingRow, currentYearN: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">គោលដៅ N+1</label>
                  <input
                    type="text"
                    value={String(editingRow.targetNPlus1)}
                    onChange={(e) => setEditingRow({ ...editingRow, targetNPlus1: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">គោលដៅ N+2</label>
                  <input
                    type="text"
                    value={String(editingRow.targetNPlus2)}
                    onChange={(e) => setEditingRow({ ...editingRow, targetNPlus2: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">គោលដៅ N+3</label>
                  <input
                    type="text"
                    value={String(editingRow.targetNPlus3)}
                    onChange={(e) => setEditingRow({ ...editingRow, targetNPlus3: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">មូលហេតុនៃការផ្លាស់ប្តូរ (Reason for Change)</label>
                <textarea
                  value={editingRow.reasonForChange}
                  onChange={(e) => setEditingRow({ ...editingRow, reasonForChange: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
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
