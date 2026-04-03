import { useState, useEffect, createContext, useContext } from "react";
import { getDemoUsers } from "@/lib/demo-store";
import {
  DEMO_ADMIN_UID,
  DEMO_DOCTOR_UID,
  DEMO_PATIENT_UID,
} from "@/lib/demo-store";
import { getUserProfile, saveUserProfile, type UserProfile } from "@/services/userService";

const SESSION_KEY = "clinical-demo-session";

/** Oturum kullanıcısı (Firebase yerine demo). */
export interface DemoAuthUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

interface AuthContextType {
  user: DemoAuthUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<DemoAuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readSession(): DemoAuthUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoAuthUser;
  } catch {
    return null;
  }
}

function writeSession(u: DemoAuthUser | null) {
  if (!u) sessionStorage.removeItem(SESSION_KEY);
  else sessionStorage.setItem(SESSION_KEY, JSON.stringify(u));
}

function resolveDemoUid(email: string): string {
  const normalized = email.trim().toLowerCase();
  const fromDb = getDemoUsers().find((u) => u.email.toLowerCase() === normalized);
  if (fromDb) return fromDb.userId;
  if (normalized.includes("admin")) return DEMO_ADMIN_UID;
  if (normalized.includes("doktor") || normalized.includes("doctor")) return DEMO_DOCTOR_UID;
  return DEMO_PATIENT_UID;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<DemoAuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = readSession();
    setUser(session);
    if (session?.uid) {
      getUserProfile(session.uid)
        .then((p) => setUserProfile(p))
        .catch(() => setUserProfile(null))
        .finally(() => setLoading(false));
    } else {
      setUserProfile(null);
      setLoading(false);
    }
  }, []);

  const refreshUser = async () => {
    const session = readSession();
    setUser(session);
    if (session?.uid) {
      const p = await getUserProfile(session.uid);
      setUserProfile(p);
    } else {
      setUserProfile(null);
    }
  };

  const signIn = async (email: string, _password: string) => {
    const uid = resolveDemoUid(email);
    const profile = await getUserProfile(uid);
    const sessionUser: DemoAuthUser = {
      uid,
      email: email.trim(),
      displayName: profile?.name ?? null,
    };
    setUser(sessionUser);
    writeSession(sessionUser);
    setUserProfile(profile);
  };

  const signUp = async (email: string, _password: string): Promise<DemoAuthUser> => {
    const uid = `reg-${Date.now()}`;
    const sessionUser: DemoAuthUser = {
      uid,
      email: email.trim(),
      displayName: null,
    };
    setUser(sessionUser);
    writeSession(sessionUser);
    return sessionUser;
  };

  const logout = async () => {
    setUser(null);
    setUserProfile(null);
    writeSession(null);
  };

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/** Kayıt sonrası profil kaydı — Register sayfası kullanır */
export async function persistNewUserProfileAfterSignUp(
  uid: string,
  profile: Omit<UserProfile, "id" | "createdAt" | "updatedAt">
) {
  await saveUserProfile({ ...profile, userId: uid });
}
