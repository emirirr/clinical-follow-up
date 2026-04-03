/** In-memory demo data — no network / Firebase. */

export function demoTs() {
  const d = new Date();
  return {
    toDate: () => new Date(d),
    seconds: Math.floor(d.getTime() / 1000),
    nanoseconds: 0,
  };
}

export const DEMO_PATIENT_UID = "demo-patient-uid";
export const DEMO_DOCTOR_UID = "demo-doctor-uid";
export const DEMO_ADMIN_UID = "demo-admin-uid";

export const DEMO_PATIENT_DOC_ID = "pat-1";
export const DEMO_DOCTOR_DOC_ID = "doc-1";
export const DEMO_ADMIN_DOC_ID = "adm-1";

export type DemoUserDoc = {
  id: string;
  userId: string;
  email: string;
  role: "patient" | "doctor" | "admin";
  name: string;
  phone?: string;
  status: "active" | "inactive";
  createdAt: ReturnType<typeof demoTs>;
  updatedAt: ReturnType<typeof demoTs>;
  birthDate?: string;
  gender?: string;
  bloodType?: string;
  specialty?: string;
  department?: string;
  address?: string;
};

export type DemoAppointment = {
  id: string;
  patientId: string;
  patientName?: string;
  doctor: string;
  doctorId: string;
  doctorName?: string;
  date: string;
  time: string;
  type: string;
  status: "upcoming" | "completed" | "cancelled";
  location: string;
  notes?: string;
  createdAt: ReturnType<typeof demoTs>;
  updatedAt: ReturnType<typeof demoTs>;
};

export type DemoPrescription = {
  id: string;
  patientId: string;
  medicine: string;
  dosage: string;
  doctor: string;
  doctorId: string;
  date: string;
  status: "active" | "completed";
  instructions: string;
  quantity: string;
  refills?: number;
  createdAt: ReturnType<typeof demoTs>;
  updatedAt: ReturnType<typeof demoTs>;
};

export type DemoTestResult = {
  id: string;
  patientId: string;
  testName: string;
  date: string;
  result: string;
  doctor: string;
  doctorId: string;
  status: "normal" | "abnormal" | "pending";
  labName?: string;
  notes?: string;
  createdAt: ReturnType<typeof demoTs>;
  updatedAt: ReturnType<typeof demoTs>;
};

export type DemoNotification = {
  id: string;
  patientId: string;
  title?: string;
  message?: string;
  read: boolean;
  createdAt: ReturnType<typeof demoTs>;
};

export type SystemSettingsState = {
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicEmail: string;
  timezone: string;
  language: string;
  notifications: { email: boolean; sms: boolean; push: boolean };
  security: { twoFactorAuth: boolean; sessionTimeout: number; passwordPolicy: string };
  backup: { autoBackup: boolean; backupFrequency: string; retentionDays: number };
};

function seedUsers(): DemoUserDoc[] {
  const t = demoTs();
  return [
    {
      id: DEMO_PATIENT_DOC_ID,
      userId: DEMO_PATIENT_UID,
      email: "hasta@demo.local",
      role: "patient",
      name: "Ayşe Yılmaz",
      phone: "+90 532 111 2233",
      status: "active",
      birthDate: "1990-05-12",
      gender: "female",
      bloodType: "A+",
      address: "Kadıköy, İstanbul",
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "pat-2",
      userId: "demo-patient-2-uid",
      email: "ali.veli@demo.local",
      role: "patient",
      name: "Ali Veli",
      phone: "+90 533 444 5566",
      status: "active",
      birthDate: "1985-11-03",
      gender: "male",
      bloodType: "0+",
      createdAt: t,
      updatedAt: t,
    },
    {
      id: DEMO_DOCTOR_DOC_ID,
      userId: DEMO_DOCTOR_UID,
      email: "doktor@demo.local",
      role: "doctor",
      name: "Dr. Mehmet Kaya",
      phone: "+90 212 555 0101",
      specialty: "Kardiyoloji",
      department: "İç Hastalıkları",
      status: "active",
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "doc-2",
      userId: "demo-doctor-2-uid",
      email: "dr.yilmaz@demo.local",
      role: "doctor",
      name: "Dr. Zeynep Yılmaz",
      phone: "+90 212 555 0202",
      specialty: "Dahiliye",
      department: "Poliklinik",
      status: "active",
      createdAt: t,
      updatedAt: t,
    },
    {
      id: DEMO_ADMIN_DOC_ID,
      userId: DEMO_ADMIN_UID,
      email: "admin@demo.local",
      role: "admin",
      name: "Sistem Yöneticisi",
      phone: "+90 212 555 0000",
      status: "active",
      createdAt: t,
      updatedAt: t,
    },
  ];
}

function seedAppointments(): DemoAppointment[] {
  const t = demoTs();
  return [
    {
      id: "apt-1",
      patientId: DEMO_PATIENT_DOC_ID,
      patientName: "Ayşe Yılmaz",
      doctorId: DEMO_DOCTOR_DOC_ID,
      doctor: "Dr. Mehmet Kaya",
      doctorName: "Dr. Mehmet Kaya",
      date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
      time: "10:30",
      type: "Kontrol",
      status: "upcoming",
      location: "Ana poliklinik — Oda 3",
      notes: "Tansiyon takibi",
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "apt-2",
      patientId: "pat-2",
      patientName: "Ali Veli",
      doctorId: DEMO_DOCTOR_DOC_ID,
      doctor: "Dr. Mehmet Kaya",
      doctorName: "Dr. Mehmet Kaya",
      date: new Date(Date.now() - 86400000 * 5).toISOString().slice(0, 10),
      time: "14:00",
      type: "Muayene",
      status: "completed",
      location: "Ana poliklinik — Oda 3",
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "apt-3",
      patientId: DEMO_PATIENT_DOC_ID,
      patientName: "Ayşe Yılmaz",
      doctorId: DEMO_DOCTOR_DOC_ID,
      doctor: "Dr. Mehmet Kaya",
      doctorName: "Dr. Mehmet Kaya",
      date: new Date(Date.now() - 86400000 * 14).toISOString().slice(0, 10),
      time: "09:00",
      type: "EKG",
      status: "completed",
      location: "Giriş kat — EKG",
      createdAt: t,
      updatedAt: t,
    },
  ];
}

function seedPrescriptions(): DemoPrescription[] {
  const t = demoTs();
  return [
    {
      id: "rx-1",
      patientId: DEMO_PATIENT_DOC_ID,
      medicine: "Losartan 50 mg",
      dosage: "Günde 1 tablet",
      doctorId: DEMO_DOCTOR_DOC_ID,
      doctor: "Dr. Mehmet Kaya",
      date: new Date().toISOString().slice(0, 10),
      status: "active",
      instructions: "Sabah aç karnına",
      quantity: "30 tablet",
      refills: 2,
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "rx-2",
      patientId: DEMO_PATIENT_DOC_ID,
      medicine: "Vitamin D3",
      dosage: "Haftada 1",
      doctorId: DEMO_DOCTOR_DOC_ID,
      doctor: "Dr. Mehmet Kaya",
      date: new Date(Date.now() - 86400000 * 60).toISOString().slice(0, 10),
      status: "completed",
      instructions: "Yemekle birlikte",
      quantity: "12 ampul",
      createdAt: t,
      updatedAt: t,
    },
  ];
}

function seedTestResults(): DemoTestResult[] {
  const t = demoTs();
  return [
    {
      id: "lab-1",
      patientId: DEMO_PATIENT_DOC_ID,
      testName: "Tam kan sayımı",
      date: new Date(Date.now() - 86400000 * 7).toISOString().slice(0, 10),
      result: "Sınırlar içinde",
      doctorId: DEMO_DOCTOR_DOC_ID,
      doctor: "Dr. Mehmet Kaya",
      status: "normal",
      labName: "Demo Lab",
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "lab-2",
      patientId: DEMO_PATIENT_DOC_ID,
      testName: "Lipid paneli",
      date: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10),
      result: "Hafif LDL yüksekliği",
      doctorId: DEMO_DOCTOR_DOC_ID,
      doctor: "Dr. Mehmet Kaya",
      status: "abnormal",
      labName: "Demo Lab",
      notes: "Diyet önerildi",
      createdAt: t,
      updatedAt: t,
    },
  ];
}

function seedNotifications(): DemoNotification[] {
  const t = demoTs();
  return [
    {
      id: "ntf-1",
      patientId: DEMO_PATIENT_DOC_ID,
      title: "Yaklaşan randevu",
      message: "2 gün içinde kontrol randevunuz var.",
      read: false,
      createdAt: t,
    },
  ];
}

const defaultSettings: SystemSettingsState = {
  clinicName: "Klinik Takip (Demo)",
  clinicAddress: "İstanbul, Türkiye",
  clinicPhone: "+90 212 555 0123",
  clinicEmail: "info@klinik-demo.local",
  timezone: "Europe/Istanbul",
  language: "tr",
  notifications: { email: true, sms: false, push: true },
  security: { twoFactorAuth: false, sessionTimeout: 30, passwordPolicy: "strong" },
  backup: { autoBackup: true, backupFrequency: "daily", retentionDays: 30 },
};

let users = seedUsers();
let appointments = seedAppointments();
let prescriptions = seedPrescriptions();
let testResults = seedTestResults();
let notifications = seedNotifications();
let systemSettings: SystemSettingsState = { ...defaultSettings, notifications: { ...defaultSettings.notifications }, security: { ...defaultSettings.security }, backup: { ...defaultSettings.backup } };

const activityLogsSeed = [
  { id: "log-1", action: "Giriş", user: "admin@demo.local", createdAt: demoTs() },
  { id: "log-2", action: "Ayarlar görüntülendi", user: "admin@demo.local", createdAt: demoTs() },
];
let activityLogs = [...activityLogsSeed];
const securityLogsSeed = [
  { id: "sec-1", event: "Oturum açıldı", ip: "127.0.0.1", createdAt: demoTs() },
];
let securityLogs = [...securityLogsSeed];

export function getDemoUsers(): DemoUserDoc[] {
  return users;
}

export function findUserByAuthUid(uid: string): DemoUserDoc | undefined {
  return users.find((u) => u.userId === uid);
}

export function findUserDocById(id: string): DemoUserDoc | undefined {
  return users.find((u) => u.id === id);
}

export function upsertDemoUser(doc: Omit<DemoUserDoc, "createdAt" | "updatedAt"> & { id?: string }) {
  const t = demoTs();
  if (doc.id) {
    const i = users.findIndex((u) => u.id === doc.id);
    if (i >= 0) {
      users[i] = { ...users[i], ...doc, updatedAt: t };
      return users[i].id;
    }
  }
  const id = doc.id ?? `u-${Date.now()}`;
  users.push({
    ...doc,
    id,
    createdAt: t,
    updatedAt: t,
  } as DemoUserDoc);
  return id;
}

export function removeDemoUser(docId: string) {
  users = users.filter((u) => u.id !== docId);
}

export function getDemoAppointments(): DemoAppointment[] {
  return appointments;
}

export function setDemoAppointments(next: DemoAppointment[]) {
  appointments = next;
}

export function addDemoAppointment(a: Omit<DemoAppointment, "id" | "createdAt" | "updatedAt">): string {
  const t = demoTs();
  const id = `apt-${Date.now()}`;
  appointments.push({
    ...a,
    id,
    createdAt: t,
    updatedAt: t,
  });
  return id;
}

export function patchDemoAppointment(id: string, patch: Partial<DemoAppointment>) {
  const i = appointments.findIndex((x) => x.id === id);
  if (i < 0) return;
  appointments[i] = {
    ...appointments[i],
    ...patch,
    updatedAt: demoTs(),
  };
}

export function removeDemoAppointment(id: string) {
  appointments = appointments.filter((a) => a.id !== id);
}

export function getDemoPrescriptions(): DemoPrescription[] {
  return prescriptions;
}

export function addDemoPrescription(p: Omit<DemoPrescription, "id" | "createdAt" | "updatedAt">): string {
  const t = demoTs();
  const id = `rx-${Date.now()}`;
  prescriptions.push({ ...p, id, createdAt: t, updatedAt: t });
  return id;
}

export function getDemoTestResults(): DemoTestResult[] {
  return testResults;
}

export function getDemoNotifications(): DemoNotification[] {
  return notifications;
}

export function getDemoSystemSettings(): SystemSettingsState {
  return {
    ...systemSettings,
    notifications: { ...systemSettings.notifications },
    security: { ...systemSettings.security },
    backup: { ...systemSettings.backup },
  };
}

export function saveDemoSystemSettings(s: SystemSettingsState) {
  systemSettings = {
    ...s,
    notifications: { ...s.notifications },
    security: { ...s.security },
    backup: { ...s.backup },
  };
}

export function getDemoActivityLogs() {
  return activityLogs;
}

export function getDemoSecurityLogs() {
  return securityLogs;
}

export function demoExportCollection(name: string): unknown[] {
  switch (name) {
    case "users":
      return [...users];
    case "appointments":
      return [...appointments];
    case "prescriptions":
      return [...prescriptions];
    case "testResults":
      return [...testResults];
    case "notifications":
      return [...notifications];
    default:
      return [];
  }
}
