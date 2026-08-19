import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SCHOOL_STANDARDS, formatCurrencyKhmer, formatNumberOnly } from '../data/standards';
import { 
  Printer, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  CheckCircle2, 
  FileJson,
  Building,
  Calendar
} from 'lucide-react';

export const ExportPrintView: React.FC = () => {
  const { actionPlanData, sofData, efmsData, totalActionPlanBudget, schoolInfo } = useApp();
  const [selectedReport, setSelectedReport] = useState<'action_plan' | 'sof' | 'efms'>('action_plan');

  const handlePrint = () => {
    window.print();
  };

  const exportJSON = (type: 'action_plan' | 'sof' | 'efms') => {
    let data: any = actionPlanData;
    let filename = 'moeys_action_plan.json';

    if (type === 'sof') {
      data = sofData;
      filename = 'moeys_sof_budget.json';
    } else if (type === 'efms') {
      data = efmsData;
      filename = 'moeys_efms_matrix.json';
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = (type: 'action_plan' | 'sof' | 'efms') => {
    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel Khmer support

    if (type === 'action_plan') {
      csvContent += 'ស្តង់ដា,លេខកូដ,លទ្ធផលរំពឹងទុក,សកម្មភាព,Q1,Q2,Q3,Q4,អ្នកទទួលខុសត្រូវ,ថវិការដ្ឋ,ថវិកាសហគមន៍,ថវិកាដៃគូ,ថវិកាសរុប\n';
      actionPlanData.forEach((r) => {
        const actClean = `"${(r.rawActivityText || '').replace(/"/g, '""')}"`;
        const resClean = `"${(r.expectedResult || '').replace(/"/g, '""')}"`;
        const stdClean = `"${(r.standardTitle || '').replace(/"/g, '""')}"`;
        const respClean = `"${(r.responsiblePerson || '').replace(/"/g, '""')}"`;
        csvContent += `${stdClean},${r.activityCode},${resClean},${actClean},${r.quarters.q1 ? 1 : 0},${r.quarters.q2 ? 1 : 0},${r.quarters.q3 ? 1 : 0},${r.quarters.q4 ? 1 : 0},${respClean},${r.funding.state},${r.funding.community},${r.funding.partner},${r.totalBudget}\n`;
      });
    } else if (type === 'sof') {
      csvContent += 'ស្តង់ដា,លេខកូដ,ឈ្មោះសូចនាករ,ឯកតា,លទ្ធផលឆ្នាំN,គោលដៅឆ្នាំN+1,ថវិការដ្ឋ,ថវិកាក្រៅពីរដ្ឋ,ថវិកាសរុប\n';
      sofData.forEach((r) => {
        const titleClean = `"${(r.indicatorTitle || '').replace(/"/g, '""')}"`;
        const stdClean = `"${(r.standardTitle || '').replace(/"/g, '""')}"`;
        csvContent += `${stdClean},${r.indicatorCode},${titleClean},${r.unit},${r.currentYearResultN},${r.targetYearGoalNPlus1},${r.budgetState},${r.budgetNonState},${r.budgetTotal}\n`;
      });
    } else if (type === 'efms') {
      csvContent += 'ស្តង់ដា,លេខកូដ,សូចនាករ,ថវិកាN+1,លទ្ធផលN-1,គោលដៅN,គោលដៅN+1,មូលហេតុនៃការផ្លាស់ប្តូរ,គោលដៅN+2,គោលដៅN+3\n';
      efmsData.forEach((r) => {
        const titleClean = `"${(r.indicatorTitle || '').replace(/"/g, '""')}"`;
        const reasonClean = `"${(r.reasonForChange || '').replace(/"/g, '""')}"`;
        const stdClean = `"${(r.standardTitle || '').replace(/"/g, '""')}"`;
        csvContent += `${stdClean},${r.indicatorCode},${titleClean},${r.budgetNPlus1},${r.historyNMinus1},${r.currentYearN},${r.targetNPlus1},${reasonClean},${r.targetNPlus2},${r.targetNPlus3}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moeys_${type}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Control Panel (Hidden during Print) */}
      <div className="no-print bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Printer className="w-5 h-5 text-blue-600" />
              <span>មជ្ឈមណ្ឌលបោះពុម្ព និងទាញយកទិន្នន័យ (Print & Export Hub)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              ជ្រើសរើសរបាយការណ៍ដែលត្រូវបោះពុម្ពជាឯកសារផ្លូវការ ឬទាញយកជា CSV / JSON សម្រាប់ប្រើប្រាស់បន្ត
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ពឯកសារ (Print / PDF)</span>
            </button>
          </div>
        </div>

        {/* Report Selector Pills & Export Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">ជ្រើសរើសទម្រង់៖</span>
            <button
              onClick={() => setSelectedReport('action_plan')}
              className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all ${
                selectedReport === 'action_plan'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ផែនការសកម្មភាព ៧១
            </button>
            <button
              onClick={() => setSelectedReport('sof')}
              className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all ${
                selectedReport === 'sof'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              បែងចែកថវិកា SOF
            </button>
            <button
              onClick={() => setSelectedReport('efms')}
              className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all ${
                selectedReport === 'efms'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ក្របខណ្ឌសមិទ្ធកម្ម EFMS
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportCSV(selectedReport)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>ទាញយក Excel / CSV</span>
            </button>
            <button
              onClick={() => exportJSON(selectedReport)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>ទាញយក JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Khmer Document Layout (Printable Preview) */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm text-slate-900">
        {/* Kingdom of Cambodia Header */}
        <div className="text-center space-y-1 mb-8">
          <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900">
            ព្រះរាជាណាចក្រកម្ពុជា
          </h2>
          <h3 className="text-sm sm:text-base font-heading font-bold text-slate-800">
            ជាតិ សាសនា ព្រះមហាក្សត្រ
          </h3>
          <div className="w-24 h-0.5 bg-slate-400 mx-auto mt-2"></div>
        </div>

        {/* Ministry & School Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start text-xs sm:text-sm font-khmer mb-6">
          <div className="space-y-1">
            <p className="font-bold text-slate-900">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
            <p className="text-slate-700">មន្ទីរអប់រំ យុវជន និងកីឡា {schoolInfo.province}</p>
            <p className="text-slate-700 font-bold">{schoolInfo.schoolName} ({schoolInfo.district})</p>
          </div>
          <div className="text-left sm:text-right mt-3 sm:mt-0 space-y-1 text-slate-600">
            <p>ឆ្នាំគ្រោងថវិកា៖ <span className="font-bold text-slate-900">{schoolInfo.academicYear}</span></p>
            <p>ថវិកាគ្រោងសរុប៖ <span className="font-bold text-emerald-800 font-mono">{formatCurrencyKhmer(totalActionPlanBudget)}</span></p>
          </div>
        </div>

        {/* Document Main Title */}
        <div className="text-center my-6">
          <h1 className="text-lg sm:text-xl font-bold font-khmer text-blue-900">
            {selectedReport === 'action_plan' && 'ផែនការសកម្មភាព និងការបែងចែកថវិកាប្រចាំឆ្នាំ (៧១ សកម្មភាព)'}
            {selectedReport === 'sof' && 'របាយការណ៍បែងចែកថវិកា SOF (Statement of Financing)'}
            {selectedReport === 'efms' && 'ក្របខណ្ឌសមិទ្ធកម្ម និងហិរញ្ញវត្ថុ EFMS (Performance & Financial Matrix)'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            អនុលោមតាមស្តង់ដាសាលារៀនគំរូទាំង ៥ របស់ក្រសួងអប់រំ យុវជន និងកីឡា
          </p>
        </div>

        {/* Render Selected Table */}
        {selectedReport === 'action_plan' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-100 font-bold text-center">
                  <th className="border border-slate-300 p-2 w-12">ល.រ</th>
                  <th className="border border-slate-300 p-2 w-48 text-left">លទ្ធផលរំពឹងទុក</th>
                  <th className="border border-slate-300 p-2 text-left">សកម្មភាព</th>
                  <th className="border border-slate-300 p-1 w-20">ត្រីមាស</th>
                  <th className="border border-slate-300 p-2 w-32">អ្នកទទួលខុសត្រូវ</th>
                  <th className="border border-slate-300 p-2 w-28 text-right font-mono">ថវិកាសរុប</th>
                </tr>
              </thead>
              <tbody>
                {SCHOOL_STANDARDS.map((std) => {
                  const rows = actionPlanData.filter((r) => r.standardId === std.id);
                  if (rows.length === 0) return null;
                  const stdTotal = rows.reduce((s, r) => s + (r.totalBudget || 0), 0);
                  return (
                    <React.Fragment key={std.id}>
                      <tr className="bg-slate-200 font-bold">
                        <td colSpan={5} className="border border-slate-300 p-2 text-slate-900">
                          {std.titleKhmer}
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-mono font-bold text-slate-900">
                          {formatCurrencyKhmer(stdTotal)}
                        </td>
                      </tr>
                      {rows.map((row) => (
                        <tr key={row.id} className="border-b border-slate-200">
                          <td className="border border-slate-300 p-2 text-center font-bold font-mono">{row.activityCode}</td>
                          <td className="border border-slate-300 p-2 font-medium">{row.expectedResult}</td>
                          <td className="border border-slate-300 p-2 text-slate-700 leading-relaxed">
                            {row.activities.join(' • ')}
                          </td>
                          <td className="border border-slate-300 p-1 text-center font-mono">
                            {[
                              row.quarters.q1 ? '1' : '',
                              row.quarters.q2 ? '2' : '',
                              row.quarters.q3 ? '3' : '',
                              row.quarters.q4 ? '4' : '',
                            ]
                              .filter(Boolean)
                              .join(',')}
                          </td>
                          <td className="border border-slate-300 p-2 text-slate-600">{row.responsiblePerson}</td>
                          <td className="border border-slate-300 p-2 text-right font-mono font-bold">
                            {row.totalBudget > 0 ? formatNumberOnly(row.totalBudget) + ' ៛' : '-'}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'sof' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-100 font-bold text-center">
                  <th className="border border-slate-300 p-2 w-12">ល.រ</th>
                  <th className="border border-slate-300 p-2 text-left">ឈ្មោះសូចនាករ</th>
                  <th className="border border-slate-300 p-2 w-16">ឯកតា</th>
                  <th className="border border-slate-300 p-2 w-20">លទ្ធផល N</th>
                  <th className="border border-slate-300 p-2 w-20">គោលដៅ N+1</th>
                  <th className="border border-slate-300 p-2 w-24 text-right font-mono">ថវិការដ្ឋ</th>
                  <th className="border border-slate-300 p-2 w-24 text-right font-mono">ក្រៅពីរដ្ឋ</th>
                  <th className="border border-slate-300 p-2 w-28 text-right font-mono">ថវិកាសរុប</th>
                </tr>
              </thead>
              <tbody>
                {sofData.map((row) => (
                  <tr key={row.id}>
                    <td className="border border-slate-300 p-2 text-center font-bold font-mono">{row.indicatorCode}</td>
                    <td className="border border-slate-300 p-2">{row.indicatorTitle}</td>
                    <td className="border border-slate-300 p-2 text-center">{row.unit}</td>
                    <td className="border border-slate-300 p-2 text-center font-mono">{String(row.currentYearResultN)}</td>
                    <td className="border border-slate-300 p-2 text-center font-mono font-bold text-blue-800">{String(row.targetYearGoalNPlus1)}</td>
                    <td className="border border-slate-300 p-2 text-right font-mono">{row.budgetState > 0 ? formatNumberOnly(row.budgetState) : '-'}</td>
                    <td className="border border-slate-300 p-2 text-right font-mono">{row.budgetNonState > 0 ? formatNumberOnly(row.budgetNonState) : '-'}</td>
                    <td className="border border-slate-300 p-2 text-right font-mono font-bold">{row.budgetTotal > 0 ? formatNumberOnly(row.budgetTotal) + ' ៛' : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'efms' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-100 font-bold text-center">
                  <th className="border border-slate-300 p-2 w-12">ល.រ</th>
                  <th className="border border-slate-300 p-2 text-left">សូចនាករ</th>
                  <th className="border border-slate-300 p-2 w-24 text-right font-mono">ថវិកា N+1</th>
                  <th className="border border-slate-300 p-2 w-16">N-1</th>
                  <th className="border border-slate-300 p-2 w-16">N</th>
                  <th className="border border-slate-300 p-2 w-16">N+1</th>
                  <th className="border border-slate-300 p-2 text-left">មូលហេតុនៃការផ្លាស់ប្តូរ</th>
                  <th className="border border-slate-300 p-2 w-16">N+2</th>
                  <th className="border border-slate-300 p-2 w-16">N+3</th>
                </tr>
              </thead>
              <tbody>
                {efmsData.map((row) => (
                  <tr key={row.id}>
                    <td className="border border-slate-300 p-2 text-center font-bold font-mono">{row.indicatorCode}</td>
                    <td className="border border-slate-300 p-2">{row.indicatorTitle}</td>
                    <td className="border border-slate-300 p-2 text-right font-mono">{row.budgetNPlus1 > 0 ? formatNumberOnly(row.budgetNPlus1) : '-'}</td>
                    <td className="border border-slate-300 p-2 text-center font-mono">{String(row.historyNMinus1)}</td>
                    <td className="border border-slate-300 p-2 text-center font-mono">{String(row.currentYearN)}</td>
                    <td className="border border-slate-300 p-2 text-center font-mono font-bold text-blue-800">{String(row.targetNPlus1)}</td>
                    <td className="border border-slate-300 p-2 text-slate-600 text-[11px]">{row.reasonForChange || '-'}</td>
                    <td className="border border-slate-300 p-2 text-center font-mono">{String(row.targetNPlus2)}</td>
                    <td className="border border-slate-300 p-2 text-center font-mono">{String(row.targetNPlus3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Official Signature Footer */}
        <div className="grid grid-cols-2 gap-8 mt-12 pt-8 text-center text-xs sm:text-sm font-khmer">
          <div>
            <p className="font-semibold text-slate-600">បានឃើញ និងឯកភាព</p>
            <p className="font-bold text-slate-900 mt-1">ប្រធានគណៈកម្មការគ្រប់គ្រងសាលារៀន (គ.គ.ស)</p>
            <div className="h-16"></div>
            <p className="font-bold text-slate-900">{schoolInfo.committeeLeader || '....................................................'}</p>
          </div>

          <div>
            <p className="text-slate-600">ថ្ងៃទី.........ខែ.........ឆ្នាំ ២០២...</p>
            <p className="font-bold text-slate-900 mt-1">នាយកសាលាបឋមសិក្សា</p>
            <div className="h-16"></div>
            <p className="font-bold text-slate-900">{schoolInfo.principalName || '....................................................'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
