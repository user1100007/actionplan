import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ActionPlanRow, SOFRow, EFMSRow, ViewTab, SimulatorState, SchoolInfo, SyncStatus } from '../types';
import { parseActionPlan, parseSOF, parseEFMS } from '../data/parser';
import { 
  auth, 
  onAuthStateChanged, 
  User, 
  savePlanToFirestore, 
  loadPlanFromFirestore,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signInGuest,
  logOut
} from '../lib/firebase';

interface AppContextType {
  tab: ViewTab;
  setTab: (tab: ViewTab) => void;
  selectedStandard: number | null;
  setSelectedStandard: (standard: number | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Data
  actionPlanData: ActionPlanRow[];
  sofData: SOFRow[];
  efmsData: EFMSRow[];
  
  // Budget Simulator State (Persisted in localStorage & Firestore)
  simulatorState: SimulatorState;
  setSimulatorState: React.Dispatch<React.SetStateAction<SimulatorState>>;
  updateSimulatorMultipliers: (multipliers: Partial<Pick<SimulatorState, 'stateMultiplier' | 'communityMultiplier' | 'partnerMultiplier'>>) => void;
  updateStandardAdjustment: (standardId: number, adjustment: number) => void;
  resetSimulator: () => void;

  // School Metadata (Persisted)
  schoolInfo: SchoolInfo;
  updateSchoolInfo: (info: Partial<SchoolInfo>) => void;

  // Mutations
  updateActionPlanRow: (id: string, updated: Partial<ActionPlanRow>) => void;
  addActionPlanRow: (newRow: Omit<ActionPlanRow, 'id'>) => void;
  deleteActionPlanRow: (id: string) => void;
  
  updateSOFRow: (id: string, updated: Partial<SOFRow>) => void;
  updateEFMSRow: (id: string, updated: Partial<EFMSRow>) => void;
  
  resetToDefaultData: () => void;
  
  // Totals & Analytics
  totalActionPlanBudget: number;
  totalStateBudget: number;
  totalCommunityBudget: number;
  totalPartnerBudget: number;
  
  totalSOFBudget: number;
  totalEFMSBudget: number;

  // Authentication & Cloud Sync
  user: User | null;
  authLoading: boolean;
  syncStatus: SyncStatus;
  lastSyncTime: Date | null;
  syncToCloud: () => Promise<boolean>;
  loadFromCloud: () => Promise<boolean>;
  
  // Auth actions
  loginGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginGuest: () => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => Promise<void>;
}

const DEFAULT_SIMULATOR_STATE: SimulatorState = {
  stateMultiplier: 0,
  communityMultiplier: 0,
  partnerMultiplier: 0,
  standardAdjustments: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

const DEFAULT_SCHOOL_INFO: SchoolInfo = {
  schoolName: 'សាលាបឋមសិក្សាគំរូ',
  province: 'រាជធានីភ្នំពេញ',
  district: 'ខណ្ឌដូនពេញ',
  academicYear: 'ឆ្នាំ ២០២៥ - ២០២៦ (ឆ្នាំ N+1)',
  principalName: 'លោក ហ៊ឹម សុផល',
  committeeLeader: 'លោក ស៊ុន វណ្ណា',
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Tab state persistence
  const [tab, setTabState] = useState<ViewTab>(() => {
    try {
      const savedTab = localStorage.getItem('active_tab_v1') as ViewTab;
      if (['dashboard', 'action_plan', 'sof', 'efms', 'budget_planner', 'export_print'].includes(savedTab)) {
        return savedTab;
      }
    } catch (e) {
      console.warn('Could not read tab from localStorage', e);
    }
    return 'dashboard';
  });

  const setTab = (newTab: ViewTab) => {
    setTabState(newTab);
    try {
      localStorage.setItem('active_tab_v1', newTab);
    } catch (e) {
      console.warn('Could not save tab to localStorage', e);
    }
  };

  const [selectedStandard, setSelectedStandard] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Action Plan Data with localStorage persistence
  const [actionPlanData, setActionPlanData] = useState<ActionPlanRow[]>(() => {
    try {
      const saved = localStorage.getItem('actionplan_data_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved action plan data from localStorage', e);
    }
    return parseActionPlan();
  });

  // 2. SOF Data with localStorage persistence
  const [sofData, setSofData] = useState<SOFRow[]>(() => {
    try {
      const saved = localStorage.getItem('sof_data_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved SOF data from localStorage', e);
    }
    return parseSOF();
  });

  // 3. EFMS Data with localStorage persistence
  const [efmsData, setEfmsData] = useState<EFMSRow[]>(() => {
    try {
      const saved = localStorage.getItem('efms_data_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved EFMS data from localStorage', e);
    }
    return parseEFMS();
  });

  // 4. Budget Simulator Settings with localStorage persistence
  const [simulatorState, setSimulatorState] = useState<SimulatorState>(() => {
    try {
      const saved = localStorage.getItem('budget_simulator_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          stateMultiplier: typeof parsed.stateMultiplier === 'number' ? parsed.stateMultiplier : 0,
          communityMultiplier: typeof parsed.communityMultiplier === 'number' ? parsed.communityMultiplier : 0,
          partnerMultiplier: typeof parsed.partnerMultiplier === 'number' ? parsed.partnerMultiplier : 0,
          standardAdjustments: parsed.standardAdjustments || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        };
      }
    } catch (e) {
      console.error('Failed to parse budget simulator settings from localStorage', e);
    }
    return DEFAULT_SIMULATOR_STATE;
  });

  // 5. School Info with localStorage persistence
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(() => {
    try {
      const saved = localStorage.getItem('school_profile_v1');
      if (saved) {
        return { ...DEFAULT_SCHOOL_INFO, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to parse school profile from localStorage', e);
    }
    return DEFAULT_SCHOOL_INFO;
  });

  // Firebase Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local_only');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Reference for debounce syncing
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialCloudLoad = useRef<boolean>(false);

  // Monitor Auth Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        setSyncStatus('synced');
        // Fetch cloud data if available
        try {
          const cloudData = await loadPlanFromFirestore(currentUser.uid);
          if (cloudData) {
            if (cloudData.actionPlanData && Array.isArray(cloudData.actionPlanData) && cloudData.actionPlanData.length > 0) {
              setActionPlanData(cloudData.actionPlanData);
              localStorage.setItem('actionplan_data_v1', JSON.stringify(cloudData.actionPlanData));
            }
            if (cloudData.sofData && Array.isArray(cloudData.sofData) && cloudData.sofData.length > 0) {
              setSofData(cloudData.sofData);
              localStorage.setItem('sof_data_v1', JSON.stringify(cloudData.sofData));
            }
            if (cloudData.efmsData && Array.isArray(cloudData.efmsData) && cloudData.efmsData.length > 0) {
              setEfmsData(cloudData.efmsData);
              localStorage.setItem('efms_data_v1', JSON.stringify(cloudData.efmsData));
            }
            if (cloudData.simulatorState) {
              setSimulatorState(cloudData.simulatorState);
              localStorage.setItem('budget_simulator_v1', JSON.stringify(cloudData.simulatorState));
            }
            if (cloudData.schoolInfo) {
              setSchoolInfo((prev) => ({ ...prev, ...cloudData.schoolInfo }));
              localStorage.setItem('school_profile_v1', JSON.stringify({ ...schoolInfo, ...cloudData.schoolInfo }));
            }
            setLastSyncTime(new Date());
            isInitialCloudLoad.current = true;
          } else {
            // First time login for this user: push local copy to cloud
            await savePlanToFirestore(currentUser.uid, {
              userEmail: currentUser.email,
              userDisplayName: currentUser.displayName,
              actionPlanData,
              sofData,
              efmsData,
              simulatorState,
              schoolInfo,
            });
            setLastSyncTime(new Date());
          }
        } catch (err) {
          console.error('Error hydrating from Firestore on login:', err);
        }
      } else {
        setSyncStatus('local_only');
      }
    });

    return () => unsubscribe();
  }, []);

  // Save to LocalStorage whenever actionPlanData changes
  useEffect(() => {
    try {
      localStorage.setItem('actionplan_data_v1', JSON.stringify(actionPlanData));
    } catch (e) {
      console.error('Failed to write actionPlanData to localStorage', e);
    }
  }, [actionPlanData]);

  // Save to LocalStorage whenever sofData changes
  useEffect(() => {
    try {
      localStorage.setItem('sof_data_v1', JSON.stringify(sofData));
    } catch (e) {
      console.error('Failed to write sofData to localStorage', e);
    }
  }, [sofData]);

  // Save to LocalStorage whenever efmsData changes
  useEffect(() => {
    try {
      localStorage.setItem('efms_data_v1', JSON.stringify(efmsData));
    } catch (e) {
      console.error('Failed to write efmsData to localStorage', e);
    }
  }, [efmsData]);

  // Save to LocalStorage whenever simulatorState changes
  useEffect(() => {
    try {
      localStorage.setItem('budget_simulator_v1', JSON.stringify(simulatorState));
    } catch (e) {
      console.error('Failed to write budget_simulator_v1 to localStorage', e);
    }
  }, [simulatorState]);

  // Save to LocalStorage whenever schoolInfo changes
  useEffect(() => {
    try {
      localStorage.setItem('school_profile_v1', JSON.stringify(schoolInfo));
    } catch (e) {
      console.error('Failed to write school_profile_v1 to localStorage', e);
    }
  }, [schoolInfo]);

  // Auto-sync to Firebase Firestore if logged in
  useEffect(() => {
    if (!user) return;
    if (authLoading) return;

    setSyncStatus('saving');

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        const success = await savePlanToFirestore(user.uid, {
          userEmail: user.email,
          userDisplayName: user.displayName,
          actionPlanData,
          sofData,
          efmsData,
          simulatorState,
          schoolInfo,
        });

        if (success) {
          setSyncStatus('synced');
          setLastSyncTime(new Date());
        } else {
          setSyncStatus('error');
        }
      } catch (err) {
        console.error('Cloud auto-sync error:', err);
        setSyncStatus('error');
      }
    }, 1500);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [user, actionPlanData, sofData, efmsData, simulatorState, schoolInfo]);

  // Manual Sync function
  const syncToCloud = async (): Promise<boolean> => {
    if (!user) {
      return false;
    }
    setSyncStatus('saving');
    try {
      const success = await savePlanToFirestore(user.uid, {
        userEmail: user.email,
        userDisplayName: user.displayName,
        actionPlanData,
        sofData,
        efmsData,
        simulatorState,
        schoolInfo,
      });
      if (success) {
        setSyncStatus('synced');
        setLastSyncTime(new Date());
        return true;
      } else {
        setSyncStatus('error');
        return false;
      }
    } catch (e) {
      console.error('Manual sync failed', e);
      setSyncStatus('error');
      return false;
    }
  };

  // Manual Load from Cloud
  const loadFromCloud = async (): Promise<boolean> => {
    if (!user) return false;
    setSyncStatus('saving');
    try {
      const cloudData = await loadPlanFromFirestore(user.uid);
      if (cloudData) {
        if (cloudData.actionPlanData) setActionPlanData(cloudData.actionPlanData);
        if (cloudData.sofData) setSofData(cloudData.sofData);
        if (cloudData.efmsData) setEfmsData(cloudData.efmsData);
        if (cloudData.simulatorState) setSimulatorState(cloudData.simulatorState);
        if (cloudData.schoolInfo) setSchoolInfo((prev) => ({ ...prev, ...cloudData.schoolInfo }));
        
        setSyncStatus('synced');
        setLastSyncTime(new Date());
        return true;
      }
      return false;
    } catch (e) {
      console.error('Load from cloud failed', e);
      setSyncStatus('error');
      return false;
    }
  };

  // Auth Operations
  const loginGoogle = async () => {
    const res = await signInWithGoogle();
    if (res.user) {
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const loginEmail = async (email: string, pass: string) => {
    const res = await signInWithEmail(email, pass);
    if (res.user) {
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const registerEmail = async (email: string, pass: string) => {
    const res = await signUpWithEmail(email, pass);
    if (res.user) {
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const loginGuest = async () => {
    const res = await signInGuest();
    if (res.user) {
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const logoutUser = async () => {
    await logOut();
    setSyncStatus('local_only');
  };

  // Simulator Mutators
  const updateSimulatorMultipliers = (
    multipliers: Partial<Pick<SimulatorState, 'stateMultiplier' | 'communityMultiplier' | 'partnerMultiplier'>>
  ) => {
    setSimulatorState((prev) => ({
      ...prev,
      ...multipliers,
    }));
  };

  const updateStandardAdjustment = (standardId: number, adjustment: number) => {
    setSimulatorState((prev) => ({
      ...prev,
      standardAdjustments: {
        ...prev.standardAdjustments,
        [standardId]: adjustment,
      },
    }));
  };

  const resetSimulator = () => {
    setSimulatorState(DEFAULT_SIMULATOR_STATE);
  };

  const updateSchoolInfo = (info: Partial<SchoolInfo>) => {
    setSchoolInfo((prev) => ({ ...prev, ...info }));
  };

  // Action Plan Mutators
  const updateActionPlanRow = (id: string, updated: Partial<ActionPlanRow>) => {
    setActionPlanData((prev) =>
      prev.map((row) => {
        if (row.id === id) {
          const merged = { ...row, ...updated };
          if (updated.funding) {
            merged.totalBudget =
              (updated.funding.state || 0) +
              (updated.funding.community || 0) +
              (updated.funding.partner || 0);
          }
          return merged;
        }
        return row;
      })
    );
  };

  const addActionPlanRow = (newRow: Omit<ActionPlanRow, 'id'>) => {
    const id = `act-custom-${Date.now()}`;
    const totalBudget =
      (newRow.funding?.state || 0) +
      (newRow.funding?.community || 0) +
      (newRow.funding?.partner || 0);
    setActionPlanData((prev) => [{ id, ...newRow, totalBudget }, ...prev]);
  };

  const deleteActionPlanRow = (id: string) => {
    setActionPlanData((prev) => prev.filter((r) => r.id !== id));
  };

  // SOF Mutators
  const updateSOFRow = (id: string, updated: Partial<SOFRow>) => {
    setSofData((prev) =>
      prev.map((row) => {
        if (row.id === id) {
          const merged = { ...row, ...updated };
          if (updated.budgetState !== undefined || updated.budgetNonState !== undefined) {
            merged.budgetTotal = (merged.budgetState || 0) + (merged.budgetNonState || 0);
          }
          return merged;
        }
        return row;
      })
    );
  };

  // EFMS Mutators
  const updateEFMSRow = (id: string, updated: Partial<EFMSRow>) => {
    setEfmsData((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...updated } : row))
    );
  };

  // Reset to original dataset
  const resetToDefaultData = () => {
    if (window.confirm('តើអ្នកពិតជាចង់កំណត់ទិន្នន័យឡើងវិញទៅតាមគំរូដើមមែនទេ? (Are you sure you want to reset all data to default template?)')) {
      const ap = parseActionPlan();
      const sof = parseSOF();
      const efms = parseEFMS();
      setActionPlanData(ap);
      setSofData(sof);
      setEfmsData(efms);
      setSimulatorState(DEFAULT_SIMULATOR_STATE);
      setSchoolInfo(DEFAULT_SCHOOL_INFO);

      try {
        localStorage.removeItem('actionplan_data_v1');
        localStorage.removeItem('sof_data_v1');
        localStorage.removeItem('efms_data_v1');
        localStorage.removeItem('budget_simulator_v1');
        localStorage.removeItem('school_profile_v1');
      } catch (e) {
        console.warn('Failed clearing localStorage items', e);
      }
    }
  };

  // Calculations
  const totalStateBudget = actionPlanData.reduce((sum, r) => sum + (r.funding.state || 0), 0);
  const totalCommunityBudget = actionPlanData.reduce((sum, r) => sum + (r.funding.community || 0), 0);
  const totalPartnerBudget = actionPlanData.reduce((sum, r) => sum + (r.funding.partner || 0), 0);
  const totalActionPlanBudget = actionPlanData.reduce((sum, r) => sum + (r.totalBudget || 0), 0);

  const totalSOFBudget = sofData.reduce((sum, r) => sum + (r.budgetTotal || 0), 0);
  const totalEFMSBudget = efmsData.reduce((sum, r) => sum + (r.budgetNPlus1 || 0), 0);

  return (
    <AppContext.Provider
      value={{
        tab,
        setTab,
        selectedStandard,
        setSelectedStandard,
        searchQuery,
        setSearchQuery,
        actionPlanData,
        sofData,
        efmsData,
        simulatorState,
        setSimulatorState,
        updateSimulatorMultipliers,
        updateStandardAdjustment,
        resetSimulator,
        schoolInfo,
        updateSchoolInfo,
        updateActionPlanRow,
        addActionPlanRow,
        deleteActionPlanRow,
        updateSOFRow,
        updateEFMSRow,
        resetToDefaultData,
        totalActionPlanBudget,
        totalStateBudget,
        totalCommunityBudget,
        totalPartnerBudget,
        totalSOFBudget,
        totalEFMSBudget,
        user,
        authLoading,
        syncStatus,
        lastSyncTime,
        syncToCloud,
        loadFromCloud,
        loginGoogle,
        loginEmail,
        registerEmail,
        loginGuest,
        logoutUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
