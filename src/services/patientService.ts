import {
  findUserByAuthUid,
  getDemoAppointments,
  getDemoNotifications,
  getDemoPrescriptions,
  getDemoTestResults,
  getDemoUsers,
  demoTs,
  addDemoAppointment,
  patchDemoAppointment,
  removeDemoAppointment,
  upsertDemoUser,
  type DemoAppointment,
  type DemoPrescription,
  type DemoTestResult,
  type DemoUserDoc,
} from "@/lib/demo-store";

export type DemoTimestamp = ReturnType<typeof demoTs>;

export interface Appointment {
  id?: string;
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
  createdAt: DemoTimestamp;
  updatedAt: DemoTimestamp;
}

export interface Prescription {
  id?: string;
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
  createdAt: DemoTimestamp;
  updatedAt: DemoTimestamp;
}

export interface TestResult {
  id?: string;
  patientId: string;
  testName: string;
  date: string;
  result: string;
  doctor: string;
  doctorId: string;
  status: "normal" | "abnormal" | "pending";
  labName?: string;
  notes?: string;
  createdAt: DemoTimestamp;
  updatedAt: DemoTimestamp;
}

export interface PatientInfo {
  id?: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  bloodType: string;
  gender: "male" | "female" | "other";
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory: string[];
  allergies: string[];
  currentMedications: string[];
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
  };
  createdAt: DemoTimestamp;
  updatedAt: DemoTimestamp;
}

function asAppointment(a: DemoAppointment): Appointment {
  return { ...a };
}

function asPrescription(p: DemoPrescription): Prescription {
  return { ...p };
}

function asTestResult(t: DemoTestResult): TestResult {
  return { ...t };
}

export const getPatientInfo = async (userId: string): Promise<PatientInfo | null> => {
  const u = findUserByAuthUid(userId);
  if (!u || u.role !== "patient") return null;
  const t = demoTs();
  return {
    id: u.id,
    userId: u.userId,
    name: u.name,
    email: u.email,
    phone: u.phone ?? "",
    address: u.address ?? "",
    birthDate: u.birthDate ?? "",
    bloodType: u.bloodType ?? "",
    gender: (u.gender as PatientInfo["gender"]) || "other",
    emergencyContact: { name: "", phone: "", relationship: "" },
    medicalHistory: [],
    allergies: [],
    currentMedications: [],
    createdAt: u.createdAt ?? t,
    updatedAt: u.updatedAt ?? t,
  };
};

export const savePatientInfo = async (
  patientInfo: Omit<PatientInfo, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const existing = findUserByAuthUid(patientInfo.userId);
  const t = demoTs();
  upsertDemoUser({
    id: existing?.id,
    userId: patientInfo.userId,
    email: patientInfo.email,
    role: "patient",
    name: patientInfo.name,
    phone: patientInfo.phone,
    status: "active",
    birthDate: patientInfo.birthDate,
    gender: patientInfo.gender,
    bloodType: patientInfo.bloodType,
    address: patientInfo.address,
    createdAt: existing?.createdAt ?? t,
    updatedAt: t,
  } as DemoUserDoc);
  return existing?.id ?? getDemoUsers().find((x) => x.userId === patientInfo.userId)!.id;
};

export const getAppointments = async (patientId: string): Promise<Appointment[]> => {
  return getDemoAppointments()
    .filter((a) => a.patientId === patientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(asAppointment);
};

export const createAppointment = async (
  appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  return addDemoAppointment({
    patientId: appointment.patientId,
    patientName: appointment.patientName,
    doctor: appointment.doctor,
    doctorId: appointment.doctorId,
    doctorName: appointment.doctorName,
    date: appointment.date,
    time: appointment.time,
    type: appointment.type,
    status: appointment.status,
    location: appointment.location,
    notes: appointment.notes,
  });
};

export const updateAppointment = async (
  appointmentId: string,
  updates: Partial<Appointment>
): Promise<void> => {
  patchDemoAppointment(appointmentId, updates as Partial<DemoAppointment>);
};

export const deleteAppointment = async (appointmentId: string): Promise<void> => {
  removeDemoAppointment(appointmentId);
};

export const getPrescriptions = async (patientId: string): Promise<Prescription[]> => {
  return getDemoPrescriptions()
    .filter((p) => p.patientId === patientId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(asPrescription);
};

export const getTestResults = async (patientId: string): Promise<TestResult[]> => {
  return getDemoTestResults()
    .filter((r) => r.patientId === patientId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(asTestResult);
};

export const getDoctors = async (): Promise<any[]> => {
  return getDemoUsers()
    .filter((u) => u.role === "doctor" && u.status === "active")
    .map((u) => ({
      id: u.id,
      userId: u.userId,
      name: u.name,
      specialty: u.specialty || "Genel",
      department: u.department || "Poliklinik",
      ...u,
    }));
};

export const getNotifications = async (patientId: string): Promise<any[]> => {
  return getDemoNotifications()
    .filter((n) => n.patientId === patientId && !n.read)
    .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
    .map((n) => ({ id: n.id, ...n }));
};
