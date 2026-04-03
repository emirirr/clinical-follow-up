import { findUserByAuthUid, upsertDemoUser, type DemoUserDoc } from "@/lib/demo-store";

export type UserRole = "patient" | "doctor" | "admin";

export interface UserProfile {
  id?: string;
  userId: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  department?: string;
  specialty?: string;
  status: "active" | "inactive";
  createdAt: unknown;
  updatedAt: unknown;
}

function toProfile(u: DemoUserDoc): UserProfile {
  return {
    id: u.id,
    userId: u.userId,
    email: u.email,
    role: u.role,
    name: u.name,
    phone: u.phone,
    department: u.department,
    specialty: u.specialty,
    status: u.status,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export const testFirebaseConfig = (): boolean => true;

export const testFirestoreRules = async (): Promise<{ read: boolean; write: boolean }> => ({
  read: true,
  write: true,
});

export const testFirebaseConnection = async (): Promise<boolean> => true;

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const u = findUserByAuthUid(userId);
  if (!u) return null;
  return toProfile(u);
};

export const saveUserProfile = async (
  userProfile: Omit<UserProfile, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const existing = findUserByAuthUid(userProfile.userId);
  return upsertDemoUser({
    id: existing?.id,
    userId: userProfile.userId,
    email: userProfile.email,
    role: userProfile.role,
    name: userProfile.name,
    phone: userProfile.phone,
    department: userProfile.department,
    specialty: userProfile.specialty,
    status: userProfile.status,
    birthDate: existing?.birthDate,
    gender: existing?.gender,
    bloodType: existing?.bloodType,
    address: existing?.address,
  } as DemoUserDoc);
};

export const getRedirectUrlByRole = (role: UserRole): string => {
  switch (role) {
    case "patient":
      return "/patient";
    case "doctor":
      return "/doctor";
    case "admin":
      return "/admin";
    default:
      return "/dashboard";
  }
};

export const getPanelNameByRole = (role: UserRole): string => {
  switch (role) {
    case "patient":
      return "Hasta Paneli";
    case "doctor":
      return "Doktor Paneli";
    case "admin":
      return "Admin Paneli";
    default:
      return "Dashboard";
  }
};
