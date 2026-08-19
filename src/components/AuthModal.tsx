import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User as UserIcon, 
  LogIn, 
  LogOut, 
  Cloud, 
  CloudUpload, 
  CloudDownload, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  School, 
  ShieldCheck, 
  Save, 
  X,
  Mail,
  Lock,
  Sparkles
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
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
    schoolInfo,
    updateSchoolInfo,
  } = useApp();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // School profile form state
  const [editSchool, setEditSchool] = useState(false);
  const [schoolFormData, setSchoolFormData] = useState(schoolInfo);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setActionLoading(true);
    const res = await loginGoogle();
    setActionLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'បរាជ័យក្នុងការចូលគណនី Google');
    } else {
      setSuccessMsg('បានចូលគណនីជោគជ័យ និងបានតភ្ជាប់ Cloud Firestore!');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('សូមបញ្ចូលអ៊ីមែល និងលេខសម្ងាត់');
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    setActionLoading(true);

    let res;
    if (authMode === 'login') {
      res = await loginEmail(email, password);
    } else {
      res = await registerEmail(email, password);
    }
    setActionLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'ការផ្ទៀងផ្ទាត់បរាជ័យ');
    } else {
      setSuccessMsg(authMode === 'login' ? 'បានចូលគណនីជោគជ័យ!' : 'បានចុះឈ្មោះគណនីថ្មីជោគជ័យ!');
    }
  };

  const handleGuestLogin = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setActionLoading(true);
    const res = await loginGuest();
    setActionLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'បរាជ័យក្នុងការចូលជា Guest');
    } else {
      setSuccessMsg('បានចូលជា Guest និងបើកដំណើរការ Cloud Storage!');
    }
  };

  const handleManualSync = async () => {
    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    const ok = await syncToCloud();
    setActionLoading(false);
    if (ok) {
      setSuccessMsg('បានធ្វើសមកាលកម្មទិន្នន័យទៅ Cloud Firestore ដោយជោគជ័យ!');
    } else {
      setErrorMsg('បរាជ័យក្នុងការធ្វើសមកាលកម្ម');
    }
  };

  const handleManualLoad = async () => {
    if (!window.confirm('តើអ្នកចង់ទាញយកទិន្នន័យពី Cloud មកជំនួសទិន្នន័យក្នុង Browser នេះមែនទេ?')) return;
    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    const ok = await loadFromCloud();
    setActionLoading(false);
    if (ok) {
      setSuccessMsg('បានទាញយកទិន្នន័យពី Cloud Firestore ជោគជ័យ!');
    } else {
      setErrorMsg('រកមិនឃើញទិន្នន័យលើ Cloud ឬមានបញ្ហាតភ្ជាប់');
    }
  };

  const handleSaveSchoolInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolInfo(schoolFormData);
    setEditSchool(false);
    setSuccessMsg('បានរក្សាទុកព័ត៌មានសាលារៀនជោគជ័យ!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-slate-900 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Cloud className="w-4 h-4 text-blue-200" />
            </div>
            <div>
              <h3 className="text-base font-bold font-khmer">
                {user ? 'គណនី & សមកាលកម្ម Cloud Firestore' : 'ចូលគណនី / ធ្វើសមកាលកម្ម Cloud'}
              </h3>
              <p className="text-xs text-blue-200">
                រក្សាទុកទិន្នន័យផែនការសកម្មភាព និងម៉ាស៊ីនពិសោធន៍លើ Browser & Cloud
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-start gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LocalStorage Status Box */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Save className="w-4 h-4 text-emerald-600" />
                <span>ការរក្សាទុកក្នុង Browser (Local Persistence)</span>
              </span>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                សកម្ម (Active)
              </span>
            </div>
            <p className="text-xs text-slate-500">
              រាល់ការកែសម្រួលក្នុងផែនការសកម្មភាព និងម៉ាស៊ីនពិសោធន៍ថវិកា ត្រូវបានរក្សាទុកដោយស្វ័យប្រវត្តក្នុង <span className="font-mono font-bold text-slate-700">window.localStorage</span> មិនបាត់បង់ទិន្នន័យពេល Refresh ទំព័រឡើយ។
            </p>
          </div>

          {/* User Logged In State */}
          {user ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user.email ? user.email[0].toUpperCase() : 'U'
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">
                      {user.displayName || user.email || (user.isAnonymous ? 'ភ្ញៀវសាលារៀន (Guest User)' : 'អ្នកប្រើប្រាស់')}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user.email || `UID: ${user.uid.substring(0, 10)}...`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={logoutUser}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>ចាកចេញ</span>
                </button>
              </div>

              {/* Cloud Sync Status & Actions */}
              <div className="border border-slate-200 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-blue-600" />
                    <span>ស្ថានភាព Cloud Firestore</span>
                  </span>
                  <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                    syncStatus === 'synced' 
                      ? 'bg-blue-100 text-blue-800' 
                      : syncStatus === 'saving' 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {syncStatus === 'synced' && 'បានតភ្ជាប់ & ធ្វើសមកាលកម្មរួចរាល់'}
                    {syncStatus === 'saving' && 'កំពុងរក្សាទុក...'}
                    {syncStatus === 'local_only' && 'នៅក្នុង Browser'}
                    {syncStatus === 'error' && 'មានបញ្ហាតភ្ជាប់'}
                  </span>
                </div>

                {lastSyncTime && (
                  <p className="text-xs text-slate-500">
                    សមកាលកម្មចុងក្រោយ៖ {lastSyncTime.toLocaleTimeString('km-KH')}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleManualSync}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
                    <span>Sync ទៅ Cloud ឥឡូវនេះ</span>
                  </button>

                  <button
                    onClick={handleManualLoad}
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors disabled:opacity-50"
                    title="ទាញយកពី Cloud មកជំនួសទិន្នន័យបច្ចុប្បន្ន"
                  >
                    <CloudDownload className="w-4 h-4" />
                    <span>ទាញយកពី Cloud</span>
                  </button>
                </div>
              </div>

              {/* School Profile Info Section */}
              <div className="border border-slate-200 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <School className="w-4 h-4 text-indigo-600" />
                    <span>ព័ត៌មានសាលារៀន (School Profile)</span>
                  </span>
                  <button
                    onClick={() => {
                      setSchoolFormData(schoolInfo);
                      setEditSchool(!editSchool);
                    }}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    {editSchool ? 'បោះបង់' : 'កែសម្រួល'}
                  </button>
                </div>

                {editSchool ? (
                  <form onSubmit={handleSaveSchoolInfo} className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">ឈ្មោះសាលាបឋមសិក្សា</label>
                      <input
                        type="text"
                        value={schoolFormData.schoolName}
                        onChange={(e) => setSchoolFormData({ ...schoolFormData, schoolName: e.target.value })}
                        className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">រាជធានី/ខេត្ត</label>
                        <input
                          type="text"
                          value={schoolFormData.province}
                          onChange={(e) => setSchoolFormData({ ...schoolFormData, province: e.target.value })}
                          className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">ក្រុង/ស្រុក/ខណ្ឌ</label>
                        <input
                          type="text"
                          value={schoolFormData.district}
                          onChange={(e) => setSchoolFormData({ ...schoolFormData, district: e.target.value })}
                          className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">ឈ្មោះនាយកសាលា</label>
                        <input
                          type="text"
                          value={schoolFormData.principalName}
                          onChange={(e) => setSchoolFormData({ ...schoolFormData, principalName: e.target.value })}
                          className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">ប្រធាន គ.គ.ស</label>
                        <input
                          type="text"
                          value={schoolFormData.committeeLeader}
                          onChange={(e) => setSchoolFormData({ ...schoolFormData, committeeLeader: e.target.value })}
                          className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-colors"
                    >
                      រក្សាទុកព័ត៌មានសាលារៀន
                    </button>
                  </form>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                    <div>
                      <span className="text-slate-400 block text-[10px]">សាលារៀន៖</span>
                      <span className="font-semibold text-slate-800">{schoolInfo.schoolName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">ទីតាំង៖</span>
                      <span className="font-semibold text-slate-800">{schoolInfo.district}, {schoolInfo.province}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">នាយកសាលា៖</span>
                      <span className="font-semibold text-slate-800">{schoolInfo.principalName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">ប្រធាន គ.គ.ស៖</span>
                      <span className="font-semibold text-slate-800">{schoolInfo.committeeLeader}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* User Not Logged In - Login / Register Form */
            <div className="space-y-4">
              {/* Quick Google Sign In */}
              <button
                onClick={handleGoogleLogin}
                disabled={actionLoading}
                className="w-full py-2.5 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl flex items-center justify-center gap-3 transition-colors text-xs sm:text-sm shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>ចូលគណនីជាមួយ Google</span>
              </button>

              <div className="flex items-center my-3">
                <div className="flex-1 border-t border-slate-200"></div>
                <span className="px-3 text-slate-400 text-xs">ឬ ប្រើប្រាស់អ៊ីមែល</span>
                <div className="flex-1 border-t border-slate-200"></div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">អ៊ីមែល (Email)</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="teacher@school.edu.kh"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">លេខសម្ងាត់ (Password)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : authMode === 'login' ? (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>ចូលគណនី</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>ចុះឈ្មោះគណនីថ្មី</span>
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {authMode === 'login' ? 'មិនទាន់មានគណនី? ចុះឈ្មោះទីនេះ' : 'មានគណនីរួចហើយ? ចូលគណនី'}
                </button>

                <button
                  type="button"
                  onClick={handleGuestLogin}
                  className="text-slate-500 hover:text-slate-800 font-medium underline"
                >
                  បន្តជា Guest
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ទិន្នន័យរបស់អ្នកត្រូវបានការពារសុវត្ថិភាព</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
          >
            បិទ
          </button>
        </div>
      </div>
    </div>
  );
};
