import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { ActionPlanView } from './components/ActionPlanView';
import { SOFView } from './components/SOFView';
import { EFMSView } from './components/EFMSView';
import { BudgetSimulatorView } from './components/BudgetSimulatorView';
import { ExportPrintView } from './components/ExportPrintView';

const MainContent: React.FC = () => {
  const { tab } = useApp();

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {tab === 'dashboard' && <DashboardView />}
      {tab === 'action_plan' && <ActionPlanView />}
      {tab === 'sof' && <SOFView />}
      {tab === 'efms' && <EFMSView />}
      {tab === 'budget_planner' && <BudgetSimulatorView />}
      {tab === 'export_print' && <ExportPrintView />}
    </main>
  );
};

export function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-100 selection:text-blue-900 font-khmer">
        <Header />
        <Navigation />
        <div className="flex-1">
          <MainContent />
        </div>
      </div>
    </AppProvider>
  );
}

export default App;
