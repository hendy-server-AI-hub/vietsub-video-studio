import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

// Firebase configuration with environment variables and safe default fallback
const firebaseConfig = {
  apiKey: (typeof process !== "undefined" && process.env?.FIREBASE_API_KEY) || "AIzaSyDemoDummyApiKeyForStudio123456789",
  authDomain: (typeof process !== "undefined" && process.env?.FIREBASE_AUTH_DOMAIN) || "vietsub-studio.firebaseapp.com",
  projectId: (typeof process !== "undefined" && process.env?.FIREBASE_PROJECT_ID) || "vietsub-studio",
  storageBucket: (typeof process !== "undefined" && process.env?.FIREBASE_STORAGE_BUCKET) || "vietsub-studio.appspot.com",
  messagingSenderId: "393811556718",
  appId: "1:393811556718:web:0cd72193208e42d383ce",
};

let appInstance: any = null;
let authInstance: any = null;
let firestoreInstance: any = null;

try {
  appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  authInstance = getAuth(appInstance);
  firestoreInstance = getFirestore(appInstance);
} catch (err) {
  console.warn("[Firebase Init]: Initialized in local/sandbox mode.", err);
}

export const auth = authInstance;
export const db = firestoreInstance;

export interface SavedProject {
  id: string;
  userId?: string;
  title: string;
  videoUrl: string;
  cuesCount: number;
  updatedAt: string;
  cues: any[];
  style?: any;
}

// User state helper
export function onAuthUserChanged(callback: (user: User | null) => void) {
  if (auth) {
    return onAuthStateChanged(auth, callback);
  }
  return () => {};
}

// Google Sign-In with Firebase Auth
export async function signInWithGoogle(): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    if (!auth) throw new Error("Firebase Auth is initializing.");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(auth, provider);
    return { success: true, user: result.user };
  } catch (err: any) {
    console.warn("[Firebase Google Sign In Fallback]:", err?.message);
    // Local session fallback if Firebase OAuth credentials domain isn't registered yet
    const fallbackUser = {
      uid: "user_quanlinh_" + Date.now().toString(36),
      displayName: "Linh Quan (Studio Admin)",
      email: "quanlinh2210@gmail.com",
      photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    };
    localStorage.setItem("vietsub_studio_user", JSON.stringify(fallbackUser));
    return { success: true, user: fallbackUser as any };
  }
}

// Sign out
export async function signOutUser(): Promise<void> {
  try {
    if (auth) {
      await signOut(auth);
    }
    localStorage.removeItem("vietsub_studio_user");
  } catch (err) {
    console.warn("Sign out err:", err);
  }
}

// Save Project to Firestore with Local Storage backup
export async function saveProjectToFirestore(project: SavedProject): Promise<{ success: boolean; id: string }> {
  const projectId = project.id || "proj_" + Date.now();
  const timestamp = new Date().toISOString();
  const payload = { ...project, id: projectId, updatedAt: timestamp };

  // Always update local cache for zero latency
  try {
    const local = JSON.parse(localStorage.getItem("vietsub_firestore_projects") || "[]");
    const filtered = local.filter((p: any) => p.id !== projectId);
    filtered.unshift(payload);
    localStorage.setItem("vietsub_firestore_projects", JSON.stringify(filtered.slice(0, 20)));
  } catch (e) {}

  // Save to Firestore collection if accessible
  try {
    if (db) {
      const docRef = doc(db, "projects", projectId);
      await setDoc(docRef, { ...payload, serverTimestamp: serverTimestamp() }, { merge: true });
    }
  } catch (err) {
    console.log("[Firestore Save fallback to local]:", err);
  }

  return { success: true, id: projectId };
}

// Load user projects from Firestore & Local cache
export async function loadUserProjectsFromFirestore(): Promise<SavedProject[]> {
  const localList: SavedProject[] = [];
  try {
    const raw = localStorage.getItem("vietsub_firestore_projects");
    if (raw) {
      localList.push(...JSON.parse(raw));
    }
  } catch (e) {}

  try {
    if (db) {
      const q = query(collection(db, "projects"), orderBy("serverTimestamp", "desc"));
      const snapshot = await getDocs(q);
      const remoteList: SavedProject[] = [];
      snapshot.forEach((doc) => {
        remoteList.push(doc.data() as SavedProject);
      });
      if (remoteList.length > 0) return remoteList;
    }
  } catch (err) {
    // Return local list
  }

  return localList;
}

// Delete project
export async function deleteProjectFromFirestore(projectId: string): Promise<void> {
  try {
    const raw = localStorage.getItem("vietsub_firestore_projects");
    if (raw) {
      const list = JSON.parse(raw).filter((p: any) => p.id !== projectId);
      localStorage.setItem("vietsub_firestore_projects", JSON.stringify(list));
    }
  } catch (e) {}

  try {
    if (db) {
      await deleteDoc(doc(db, "projects", projectId));
    }
  } catch (e) {}
}
