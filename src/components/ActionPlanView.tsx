import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ActionPlanRow } from '../types';
import { SCHOOL_STANDARDS, formatCurrencyKhmer, formatNumberOnly } from '../data/standards';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Filter, 
  Check, 
  X, 
  Coins, 
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const ActionPlanView: React.FC = () => {
  const { 
    actionPlanData, 
    selectedStandard, 
    setSelectedStandard, 
    searchQuery, 
    setSearchQuery,
    updateActionPlanRow,
    addActionPlanRow,
    deleteActionPlanRow
  } = useApp();

  const [editingRow, setEditingRow] = useState<ActionPlanRow | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newRowData, setNewRowData] = useState<Omit<ActionPlanRow, 'id' | 'totalBudget'>>({
    standardId: 1,
    standardTitle: 'ស្តង់ដាទី១៖ លទ្ធផលសិក្សារបស់សិស្ស',
    categoryTitle: '១. ការប្រមូលកុមារចូលរៀន',
    activityCode: '១.១',
    expectedResult: '',
    activities: [''],
    rawActivityText: '',
    quarters: { q1: true, q2: true, q3: true, q4: true },
    responsiblePerson: 'គណៈគ្រប់គ្រងសាលា',
    funding: { state: 0, community: 0, partner: 0 },
  });

  // Filtered rows
  const filteredRows = useMemo(() => {
    return actionPlanData.filter((row) => {
      // Standard filter
      if (selectedStandard !== null && row.standardId !== selectedStandard) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = row.activityCode.toLowerCase().includes(q);
        const matchResult = row.expectedResult.toLowerCase().includes(q);
        const matchAct = row.rawActivityText.toLowerCase().includes(q);
        const matchResp = row.responsiblePerson.toLowerCase().includes(q);
        const matchCategory = row.categoryTitle.toLowerCase().includes(q);
        return matchCode || matchResult || matchAct || matchResp || matchCategory;
      }
      return true;
    });
  }, [actionPlanData, selectedStandard, searchQuery]);

  // Subtotals
  const subtotalState = filteredRows.reduce((sum, r) => sum + (r.funding.state || 0), 0);
  const subtotalCommunity = filteredRows.reduce((sum, r) => sum + (r.funding.community || 0), 0);
  const subtotalPartner = filteredRows.reduce((sum, r) => sum + (r.funding.partner || 0), 0);
  const subtotalTotal = filteredRows.reduce((sum, r) => sum + (r.totalBudget || 0), 0);

  // Group filtered rows by Standard for organized rendering
  const groupedByStandard = useMemo(() => {
    const groups: { [key: number]: ActionPlanRow[] } = {};
    filteredRows.forEach((r) => {
      if (!groups[r.standardId]) groups[r.standardId] = [];
      groups[r.standardId].push(r);
    });
    return groups;
  }, [filteredRows]);

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;
    updateActionPlanRow(editingRow.id, editingRow);
    setEditingRow(null);
  };

  const handleAddNewSave = (e: React.FormEvent) => {
    e.preventDefault();
    const rawText = newRowData.activities.join('\n');
    addActionPlanRow({
      ...newRowData,
      rawActivityText: rawText,
      totalBudget:
        (newRowData.funding.state || 0) +
        (newRowData.funding.community || 0) +
        (newRowData.funding.partner || 0),
    });
    setIsAddingNew(false);
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Action Bar Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              ផែនការសកម្មភាពសាលារៀន (Action Plan Table)
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
              {filteredRows.length} សកម្មភាព
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            តារាងរៀបចំផែនការ ៧១ សកម្មភាព ក្របខណ្ឌពេលវេលាត្រីមាស និងការបែងចែកថវិកា
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>បន្ថែមសកម្មភាព</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 text-white p-4 rounded-2xl shadow-sm">
        <div>
          <span className="text-[11px] text-slate-400 block">ថវិការដ្ឋសរុប (State)</span>
          <span className="text-sm sm:text-base font-bold font-mono text-blue-400">
            {formatCurrencyKhmer(subtotalState)}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block">ថវិកាសហគមន៍ (Community)</span>
          <span className="text-sm sm:text-base font-bold font-mono text-emerald-400">
            {formatCurrencyKhmer(subtotalCommunity)}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block">ថវិកាដៃគូ (Partner)</span>
          <span className="text-sm sm:text-base font-bold font-mono text-amber-400">
            {formatCurrencyKhmer(subtotalPartner)}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block">ថវិកាសរុបទាំងអស់ (Total)</span>
          <span className="text-sm sm:text-base font-bold font-mono text-emerald-300">
            {formatCurrencyKhmer(subtotalTotal)}
          </span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-3 w-14 text-center border-r border-slate-200">ល.រ</th>
                <th className="py-3 px-3 w-56 border-r border-slate-200">លទ្ធផលរំពឹងទុក</th>
                <th className="py-3 px-3 min-w-[280px] border-r border-slate-200">សកម្មភាពគន្លឹះ</th>
                <th className="py-3 px-2 w-28 text-center border-r border-slate-200">
                  <div className="text-[11px]">ក្របខណ្ឌពេលវេលា</div>
                  <div className="grid grid-cols-4 gap-1 text-[10px] text-slate-500 font-normal mt-0.5">
                    <span>Q1</span>
                    <span>Q2</span>
                    <span>Q3</span>
                    <span>Q4</span>
                  </div>
                </th>
                <th className="py-3 px-3 w-36 border-r border-slate-200">អ្នកទទួលខុសត្រូវ</th>
                <th className="py-3 px-2 w-48 text-center border-r border-slate-200">
                  <div className="text-[11px]">ប្រភពធនធាន (រៀល)</div>
                  <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-500 font-normal mt-0.5">
                    <span>រដ្ឋ</span>
                    <span>សហគមន៍</span>
                    <span>ដៃគូ</span>
                  </div>
                </th>
                <th className="py-3 px-3 w-28 text-right font-mono border-r border-slate-200">
                  ថវិកាសរុប
                </th>
                <th className="py-3 px-2 w-16 text-center">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {Object.keys(groupedByStandard).length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <span>មិនមានទិន្នន័យស្របតាមលក្ខខណ្ឌស្វែងរកឡើយ</span>
                  </td>
                </tr>
              ) : (
                Object.entries(groupedByStandard).map(([stdIdStr, rows]) => {
                  const stdId = parseInt(stdIdStr);
                  const standardMeta = SCHOOL_STANDARDS.find((s) => s.id === stdId);
                  const stdTotal = rows.reduce((sum, r) => sum + (r.totalBudget || 0), 0);

                  return (
                    <React.Fragment key={`std-group-${stdId}`}>
                      {/* Standard Section Header Bar */}
                      <tr className="bg-slate-800 text-white font-bold">
                        <td colSpan={6} className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                            <span className="text-xs sm:text-sm">{standardMeta?.titleKhmer || `ស្តង់ដាទី ${stdId}`}</span>
                            <span className="text-[11px] font-normal text-slate-300 ml-2 font-mono">
                              ({rows.length} សកម្មភាព)
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold text-xs">
                          {formatCurrencyKhmer(stdTotal)}
                        </td>
                        <td></td>
                      </tr>

                      {/* Standard Rows */}
                      {rows.map((row) => (
                        <tr 
                          key={row.id} 
                          className="hover:bg-blue-50/40 transition-colors group text-slate-800"
                        >
                          {/* Code */}
                          <td className="py-2.5 px-3 text-center font-bold text-blue-700 bg-slate-50/50 border-r border-slate-100 font-mono">
                            {row.activityCode || '•'}
                          </td>

                          {/* Expected Result */}
                          <td className="py-2.5 px-3 font-medium text-slate-900 border-r border-slate-100 align-top">
                            <div className="line-clamp-4 leading-relaxed">
                              {row.expectedResult}
                            </div>
                            {row.categoryTitle && (
                              <span className="inline-block mt-1 text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                {row.categoryTitle}
                              </span>
                            )}
                          </td>

                          {/* Activities list */}
                          <td className="py-2.5 px-3 border-r border-slate-100 align-top text-slate-700">
                            <div className="space-y-1">
                              {row.activities && row.activities.length > 0 ? (
                                row.activities.map((act, actIdx) => (
                                  <div key={actIdx} className="flex items-start gap-1.5 leading-relaxed">
                                    <span className="text-blue-500 font-bold shrink-0 mt-0.5">•</span>
                                    <span>{act}</span>
                                  </div>
                                ))
                              ) : (
                                <span>{row.rawActivityText}</span>
                              )}
                            </div>
                          </td>

                          {/* Quarters (Q1..Q4) */}
                          <td className="py-2.5 px-2 border-r border-slate-100 align-middle text-center">
                            <div className="grid grid-cols-4 gap-1">
                              <span
                                className={`text-[10px] py-0.5 rounded font-mono font-bold ${
                                  row.quarters.q1
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-slate-100 text-slate-300'
                                }`}
                              >
                                1
                              </span>
                              <span
                                className={`text-[10px] py-0.5 rounded font-mono font-bold ${
                                  row.quarters.q2
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-300'
                                }`}
                              >
                                2
                              </span>
                              <span
                                className={`text-[10px] py-0.5 rounded font-mono font-bold ${
                                  row.quarters.q3
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-300'
                                }`}
                              >
                                3
                              </span>
                              <span
                                className={`text-[10px] py-0.5 rounded font-mono font-bold ${
                                  row.quarters.q4
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-slate-100 text-slate-300'
                                }`}
                              >
                                4
                              </span>
                            </div>
                          </td>

                          {/* Responsible Person */}
                          <td className="py-2.5 px-3 border-r border-slate-100 align-middle text-slate-600 text-[11px]">
                            {row.responsiblePerson}
                          </td>

                          {/* Funding Sources (State, Community, Partner) */}
                          <td className="py-2.5 px-2 border-r border-slate-100 align-middle text-center font-mono text-[11px]">
                            <div className="grid grid-cols-3 gap-1">
                              <span className={row.funding.state > 0 ? 'text-blue-700 font-semibold' : 'text-slate-300'}>
                                {row.funding.state > 0 ? formatNumberOnly(row.funding.state) : '-'}
                              </span>
                              <span className={row.funding.community > 0 ? 'text-emerald-700 font-semibold' : 'text-slate-300'}>
                                {row.funding.community > 0 ? formatNumberOnly(row.funding.community) : '-'}
                              </span>
                              <span className={row.funding.partner > 0 ? 'text-amber-700 font-semibold' : 'text-slate-300'}>
                                {row.funding.partner > 0 ? formatNumberOnly(row.funding.partner) : '-'}
                              </span>
                            </div>
                          </td>

                          {/* Total Budget */}
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 border-r border-slate-100 align-middle">
                            {row.totalBudget > 0 ? (
                              <span className="text-emerald-700">{formatCurrencyKhmer(row.totalBudget)}</span>
                            ) : (
                              <span className="text-slate-400">0 ៛</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-2.5 px-2 text-center align-middle">
                            <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setEditingRow(row)}
                                className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                title="កែប្រែ (Edit)"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('តើអ្នកពិតជាចង់លុបសកម្មភាពនេះមែនទេ?')) {
                                    deleteActionPlanRow(row.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                title="លុប (Delete)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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

      {/* Edit Modal Drawer */}
      {editingRow && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    កែប្រែព័ត៌មានសកម្មភាព ({editingRow.activityCode})
                  </h3>
                  <span className="text-xs text-slate-500">{editingRow.standardTitle}</span>
                </div>
              </div>
              <button 
                onClick={() => setEditingRow(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSave} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  លទ្ធផលរំពឹងទុក (Expected Outcome)
                </label>
                <textarea
                  value={editingRow.expectedResult}
                  onChange={(e) => setEditingRow({ ...editingRow, expectedResult: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  សកម្មភាពគន្លឹះ (Key Activities - បំបែកបន្ទាត់តាម •)
                </label>
                <textarea
                  value={editingRow.rawActivityText}
                  onChange={(e) => {
                    const text = e.target.value;
                    const acts = text.split('\n').map((s) => s.replace(/^[•\-\*\s]+/, '').trim()).filter((s) => s.length > 0);
                    setEditingRow({ 
                      ...editingRow, 
                      rawActivityText: text,
                      activities: acts
                    });
                  }}
                  rows={4}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>

              {/* Quarters checklist */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  ក្របខណ្ឌពេលវេលា (Implementation Quarters)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['q1', 'q2', 'q3', 'q4'] as const).map((q, idx) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() =>
                        setEditingRow({
                          ...editingRow,
                          quarters: {
                            ...editingRow.quarters,
                            [q]: !editingRow.quarters[q],
                          },
                        })
                      }
                      className={`py-2 px-3 rounded-lg border text-center font-bold text-xs transition-all ${
                        editingRow.quarters[q]
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      ត្រីមាសទី {idx + 1} (Q{idx + 1})
                    </button>
                  ))}
                </div>
              </div>

              {/* Responsible Person */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  អ្នកទទួលខុសត្រូវ (Responsible Person)
                </label>
                <input
                  type="text"
                  value={editingRow.responsiblePerson}
                  onChange={(e) => setEditingRow({ ...editingRow, responsiblePerson: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>

              {/* Budgets */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  ប្រភពថវិកា (Budget Sources - គិតជារៀល)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">ថវិការដ្ឋ (State)</span>
                    <input
                      type="number"
                      value={editingRow.funding.state || 0}
                      onChange={(e) =>
                        setEditingRow({
                          ...editingRow,
                          funding: {
                            ...editingRow.funding,
                            state: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">ថវិកាសហគមន៍ (Community)</span>
                    <input
                      type="number"
                      value={editingRow.funding.community || 0}
                      onChange={(e) =>
                        setEditingRow({
                          ...editingRow,
                          funding: {
                            ...editingRow.funding,
                            community: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">ថវិកាដៃគូ (Partner)</span>
                    <input
                      type="number"
                      value={editingRow.funding.partner || 0}
                      onChange={(e) =>
                        setEditingRow({
                          ...editingRow,
                          funding: {
                            ...editingRow.funding,
                            partner: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingRow(null)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  រក្សាទុកការផ្លាស់ប្តូរ (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Action Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  បន្ថែមសកម្មភាពថ្មី (Add Action Item)
                </h3>
              </div>
              <button 
                onClick={() => setIsAddingNew(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewSave} className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ជ្រើសរើសស្តង់ដា</label>
                  <select
                    value={newRowData.standardId}
                    onChange={(e) => {
                      const id = parseInt(e.target.value);
                      const std = SCHOOL_STANDARDS.find((s) => s.id === id);
                      setNewRowData({
                        ...newRowData,
                        standardId: id,
                        standardTitle: std?.titleKhmer || '',
                      });
                    }}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  >
                    {SCHOOL_STANDARDS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.titleKhmer}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">លេខកូដសកម្មភាព (Code)</label>
                  <input
                    type="text"
                    value={newRowData.activityCode}
                    onChange={(e) => setNewRowData({ ...newRowData, activityCode: e.target.value })}
                    placeholder="ឧ. ១.៣"
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">លទ្ធផលរំពឹងទុក (Expected Result)</label>
                <textarea
                  value={newRowData.expectedResult}
                  onChange={(e) => setNewRowData({ ...newRowData, expectedResult: e.target.value })}
                  placeholder="បញ្ជាក់ពីលទ្ធផលរំពឹងទុក..."
                  rows={2}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">សកម្មភាពអនុវត្ត (Key Activities)</label>
                <textarea
                  value={newRowData.rawActivityText}
                  onChange={(e) => {
                    const text = e.target.value;
                    const acts = text.split('\n').filter((s) => s.trim().length > 0);
                    setNewRowData({
                      ...newRowData,
                      rawActivityText: text,
                      activities: acts,
                    });
                  }}
                  placeholder="• សកម្មភាពទី ១&#10;• សកម្មភាពទី ២"
                  rows={3}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              {/* Responsible */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">អ្នកទទួលខុសត្រូវ</label>
                <input
                  type="text"
                  value={newRowData.responsiblePerson}
                  onChange={(e) => setNewRowData({ ...newRowData, responsiblePerson: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              {/* Budget */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">ថវិកាគ្រោង (រៀល)</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500">រដ្ឋ</span>
                    <input
                      type="number"
                      value={newRowData.funding.state}
                      onChange={(e) =>
                        setNewRowData({
                          ...newRowData,
                          funding: { ...newRowData.funding, state: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">សហគមន៍</span>
                    <input
                      type="number"
                      value={newRowData.funding.community}
                      onChange={(e) =>
                        setNewRowData({
                          ...newRowData,
                          funding: { ...newRowData.funding, community: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">ដៃគូ</span>
                    <input
                      type="number"
                      value={newRowData.funding.partner}
                      onChange={(e) =>
                        setNewRowData({
                          ...newRowData,
                          funding: { ...newRowData.funding, partner: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  បង្កើតសកម្មភាពថ្មី
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
