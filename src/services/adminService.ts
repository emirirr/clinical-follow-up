import {
  getDemoUsers,
  getDemoAppointments,
  upsertDemoUser,
  removeDemoUser,
  addDemoAppointment,
  patchDemoAppointment,
  removeDemoAppointment,
  getDemoSystemSettings,
  saveDemoSystemSettings,
  getDemoActivityLogs,
  getDemoSecurityLogs,
  demoExportCollection,
  type DemoUserDoc,
  type SystemSettingsState,
} from "@/lib/demo-store";

export interface AdminStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  activeDoctors: number;
  completedAppointments: number;
  cancelledAppointments: number;
  monthlyGrowth: number;
  patientGrowth: number;
  doctorGrowth: number;
  thisMonthAppointments: number;
  thisMonthPatients: number;
  thisMonthDoctors: number;
  recentPatients: any[];
  recentDoctors: any[];
  recentAppointments: any[];
}

export const getAdminStats = async (): Promise<AdminStats> => {
  const users = getDemoUsers();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const patients = users.filter((u) => u.role === "patient");
  const doctors = users.filter((u) => u.role === "doctor");
  const totalPatients = patients.length;
  const totalDoctors = doctors.length;
  const activeDoctors = doctors.filter((d) => d.status === "active").length;

  const thisMonthPatients = patients.filter((p) => {
    const createdAt = p.createdAt?.toDate?.() ?? new Date();
    return createdAt >= startOfMonth && createdAt <= endOfMonth;
  }).length;

  const thisMonthDoctors = doctors.filter((d) => {
    const createdAt = d.createdAt?.toDate?.() ?? new Date();
    return createdAt >= startOfMonth && createdAt <= endOfMonth;
  }).length;

  const recentPatients = [...patients]
    .sort((a, b) => {
      const da = a.createdAt?.toDate?.() ?? new Date();
      const db = b.createdAt?.toDate?.() ?? new Date();
      return db.getTime() - da.getTime();
    })
    .slice(0, 5)
    .map((p) => ({ id: p.id, ...p }));

  const recentDoctors = [...doctors]
    .sort((a, b) => {
      const da = a.createdAt?.toDate?.() ?? new Date();
      const db = b.createdAt?.toDate?.() ?? new Date();
      return db.getTime() - da.getTime();
    })
    .slice(0, 5)
    .map((d) => ({ id: d.id, ...d }));

  const appointments = getDemoAppointments();
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter((a) => a.status === "completed").length;
  const cancelledAppointments = appointments.filter((a) => a.status === "cancelled").length;

  const thisMonthAppointments = appointments.filter((a) => {
    const appointmentDate = new Date(a.date);
    return (
      appointmentDate.getMonth() === now.getMonth() &&
      appointmentDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const lastMonthPatients = Math.max(0, totalPatients - thisMonthPatients);
  const patientGrowth = lastMonthPatients > 0 ? (thisMonthPatients / lastMonthPatients) * 100 : 0;
  const lastMonthDoctors = Math.max(0, totalDoctors - thisMonthDoctors);
  const doctorGrowth = lastMonthDoctors > 0 ? (thisMonthDoctors / lastMonthDoctors) * 100 : 0;
  const lastMonthAppointments = Math.max(0, totalAppointments - thisMonthAppointments);
  const monthlyGrowth =
    lastMonthAppointments > 0 ? (thisMonthAppointments / lastMonthAppointments) * 100 : 0;

  const recentAppointments = [...appointments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((appointment) => ({
      id: appointment.id,
      patientName: appointment.patientName || "Bilinmeyen Hasta",
      doctorName: appointment.doctorName || "Bilinmeyen Doktor",
      date: appointment.date,
      time: appointment.time || "00:00",
      status: appointment.status || "upcoming",
      type: appointment.type || "Muayene",
      location: appointment.location || "Belirtilmemiş",
    }));

  return {
    totalPatients,
    totalDoctors,
    totalAppointments,
    activeDoctors,
    completedAppointments,
    cancelledAppointments,
    monthlyGrowth,
    patientGrowth,
    doctorGrowth,
    thisMonthAppointments,
    thisMonthPatients,
    thisMonthDoctors,
    recentPatients,
    recentDoctors,
    recentAppointments,
  };
};

export const getRecentDoctors = async (limitCount: number = 5) => {
  const doctors = getDemoUsers().filter((u) => u.role === "doctor");
  return doctors
    .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
    .slice(0, limitCount)
    .map((d) => ({ id: d.id, ...d }));
};

export const getRecentPatients = async (limitCount: number = 5) => {
  const patients = getDemoUsers().filter((u) => u.role === "patient");
  return patients
    .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
    .slice(0, limitCount)
    .map((p) => ({ id: p.id, ...p }));
};

export const listAllUsers = (): DemoUserDoc[] => getDemoUsers();

export function demoUpdateUserDoc(docId: string, patch: Partial<DemoUserDoc>) {
  const u = getDemoUsers().find((x) => x.id === docId);
  if (!u) return;
  upsertDemoUser({ ...u, ...patch, id: docId } as DemoUserDoc);
}

export function demoDeleteUserDoc(docId: string) {
  removeDemoUser(docId);
}

export function demoCreateUser(input: {
  email: string;
  name: string;
  phone?: string;
  role: "patient" | "doctor" | "admin";
  birthDate?: string;
  gender?: string;
  bloodType?: string;
  specialty?: string;
  department?: string;
}): { docId: string; userId: string } {
  const userId = `demo-${input.role}-${Date.now()}`;
  const docId = upsertDemoUser({
    userId,
    email: input.email,
    role: input.role,
    name: input.name,
    phone: input.phone,
    status: "active",
    birthDate: input.birthDate,
    gender: input.gender,
    bloodType: input.bloodType,
    specialty: input.specialty,
    department: input.department,
  } as Omit<DemoUserDoc, "id" | "createdAt" | "updatedAt"> & { id?: string });
  return { docId, userId };
}

export function demoAddAppointment(data: Parameters<typeof addDemoAppointment>[0]) {
  return addDemoAppointment(data);
}

export function demoPatchAppointment(id: string, patch: Parameters<typeof patchDemoAppointment>[1]) {
  patchDemoAppointment(id, patch);
}

export function demoRemoveAppointment(id: string) {
  removeDemoAppointment(id);
}

export async function getSystemSettings(): Promise<SystemSettingsState> {
  return getDemoSystemSettings();
}

export async function saveSystemSettings(settings: SystemSettingsState, _updatedBy?: string) {
  saveDemoSystemSettings(settings);
}

export async function loadUsersForAdmin() {
  return getDemoUsers().map((u) => ({ id: u.id, ...u }));
}

export async function loadActivityLogsForAdmin() {
  return getDemoActivityLogs();
}

export async function loadSecurityLogsForAdmin() {
  return getDemoSecurityLogs();
}

export async function exportCollectionDemo(collectionName: string) {
  return demoExportCollection(collectionName);
}
