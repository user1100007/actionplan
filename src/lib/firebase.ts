import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
  measurementId: firebaseConfigJson.measurementId,
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export { onAuthStateChanged };
export type { User };
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore (support named database if specified)
const firestoreDbId = firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)'
  ? firebaseConfigJson.firestoreDatabaseId
  : undefined;

export const db = firestoreDbId ? getFirestore(app, firestoreDbId) : getFirestore(app);

// Auth Helpers
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    return { user: null, error: error.message || 'Failed to sign in with Google' };
  }
};

export const signInWithEmail = async (email: string, pass: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error('Error signing in with email:', error);
    return { user: null, error: error.message || 'Failed to sign in' };
  }
};

export const signUpWithEmail = async (email: string, pass: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error('Error registering with email:', error);
    return { user: null, error: error.message || 'Failed to register' };
  }
};

export const signInGuest = async () => {
  try {
    const result = await signInAnonymously(auth);
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error('Error signing in anonymously:', error);
    return { user: null, error: error.message || 'Failed guest login' };
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error('Error signing out:', error);
    return { success: false, error: error.message };
  }
};

// Firestore Sync Helpers
export interface CloudPlanPayload {
  userId: string;
  userEmail?: string | null;
  userDisplayName?: string | null;
  actionPlanData: any[];
  sofData: any[];
  efmsData: any[];
  simulatorState: {
    stateMultiplier: number;
    communityMultiplier: number;
    partnerMultiplier: number;
    standardAdjustments: { [key: number]: number };
  };
  schoolInfo?: {
    schoolName: string;
    province: string;
    academicYear: string;
  };
  updatedAt?: any;
}

export const savePlanToFirestore = async (userId: string, data: Omit<CloudPlanPayload, 'userId'>) => {
  if (!userId) return false;
  try {
    const docRef = doc(db, 'schoolPlans', userId);
    await setDoc(docRef, {
      userId,
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving plan to Firestore:', err);
    return false;
  }
};

export const loadPlanFromFirestore = async (userId: string): Promise<CloudPlanPayload | null> => {
  if (!userId) return null;
  try {
    const docRef = doc(db, 'schoolPlans', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as CloudPlanPayload;
    }
    return null;
  } catch (err) {
    console.error('Error loading plan from Firestore:', err);
    return null;
  }
};
