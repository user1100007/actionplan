export interface ActionPlanRow {
  id: string;
  standardId: number;
  standardTitle: string;
  categoryTitle: string;
  activityCode: string;
  expectedResult: string;
  activities: string[];
  rawActivityText: string;
  quarters: {
    q1: boolean;
    q2: boolean;
    q3: boolean;
    q4: boolean;
  };
  responsiblePerson: string;
  funding: {
    state: number;
    community: number;
    partner: number;
  };
  totalBudget: number;
}

export interface SOFRow {
  id: string;
  standardId: number;
  standardTitle: string;
  categoryNumber?: string;
  categoryTitle?: string;
  indicatorCode: string;
  indicatorTitle: string;
  unit: string;
  currentYearResultN: string | number;
  targetYearGoalNPlus1: string | number;
  budgetState: number;
  budgetNonState: number;
  budgetTotal: number;
}

export interface EFMSRow {
  id: string;
  standardId: number;
  standardTitle: string;
  categoryTitle?: string;
  indicatorCode: string;
  indicatorTitle: string;
  budgetNPlus1: number;
  historyNMinus1: string | number;
  currentYearN: string | number;
  targetNPlus1: string | number;
  reasonForChange: string;
  targetNPlus2: string | number;
  targetNPlus3: string | number;
  genderRows?: {
    label: string;
    nMinus1: string | number;
    currentN: string | number;
    targetNPlus2: string | number;
    targetNPlus3: string | number;
  }[];
}

export interface SchoolStandard {
  id: number;
  code: string;
  titleKhmer: string;
  titleEnglish: string;
  iconName: string;
  color: string;
  badgeBg: string;
}

export type ViewTab = 'dashboard' | 'action_plan' | 'sof' | 'efms' | 'budget_planner' | 'export_print';

export interface SimulatorState {
  stateMultiplier: number;
  communityMultiplier: number;
  partnerMultiplier: number;
  standardAdjustments: { [key: number]: number };
}

export interface SchoolInfo {
  schoolName: string;
  province: string;
  district: string;
  academicYear: string;
  principalName: string;
  committeeLeader: string;
}

export type SyncStatus = 'synced' | 'saving' | 'local_only' | 'offline' | 'error';
