import {
  findUserByAuthUid,
  getDemoAppointments,
  getDemoPrescriptions,
  getDemoUsers,
  patchDemoAppointment,
  addDemoPrescription,
  upsertDemoUser,
  type DemoUserDoc,
} from "@/lib/demo-store";

export async function getDoctorRecordForAuthUid(authUid: string) {
  const q = findUserByAuthUid(authUid);
  if (!q || q.role !== "doctor") return null;
  return { id: q.id, ...q };
}

export interface DoctorStats {
  totalPatients: number;
  totalAppointments: number;
  completedAppointments: number;
  upcomingAppointments: number;
  cancelledAppointments: number;
  totalPrescriptions: number;
}

export async function getDoctorStats(doctorDocId: string): Promise<DoctorStats> {
  const appts = getDemoAppointments().filter((a) => a.doctorId === doctorDocId);
  const uniquePatients = new Set(appts.map((a) => a.patientId));
  const rx = getDemoPrescriptions().filter((p) => p.doctorId === doctorDocId);
  return {
    totalPatients: uniquePatients.size,
    totalAppointments: appts.length,
    completedAppointments: appts.filter((a) => a.status === "completed").length,
    upcomingAppointments: appts.filter((a) => a.status === "upcoming").length,
    cancelledAppointments: appts.filter((a) => a.status === "cancelled").length,
    totalPrescriptions: rx.length,
  };
}

export async function getRecentAppointmentsForDoctor(doctorDocId: string, limit = 5) {
  return getDemoAppointments()
    .filter((a) => a.doctorId === doctorDocId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
    .map((doc) => ({
      id: doc.id,
      patientName: doc.patientName || "Bilinmeyen Hasta",
      date: doc.date || "",
      time: doc.time || "",
      status: doc.status || "upcoming",
      type: doc.type || "",
      location: doc.location || "",
    }));
}

export async function getAppointmentsForDoctor(doctorDocId: string) {
  return getDemoAppointments()
    .filter((a) => a.doctorId === doctorDocId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((d) => ({ id: d.id, ...d }));
}

export async function updateAppointmentFields(appointmentId: string, updates: Record<string, unknown>) {
  patchDemoAppointment(appointmentId, updates as any);
}

export type DoctorPatientRow = {
  patientId: string;
  patientName: string;
  email: string;
  phone: string;
  lastVisit: string;
  nextAppointment?: string;
  totalAppointments: number;
  completedAppointments: number;
  upcomingAppointments: number;
  birthDate?: string;
  gender?: string;
  bloodType?: string;
  status: string;
};

export async function getDoctorPatientsList(doctorDocId: string): Promise<DoctorPatientRow[]> {
  const appts = getDemoAppointments().filter((a) => a.doctorId === doctorDocId);
  const byPatient = new Map<string, typeof appts>();
  for (const a of appts) {
    const list = byPatient.get(a.patientId) ?? [];
    list.push(a);
    byPatient.set(a.patientId, list);
  }
  const rows: DoctorPatientRow[] = [];
  for (const [patientId, list] of byPatient) {
    const patientUser = getDemoUsers().find((u) => u.id === patientId);
    const sorted = [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const upcoming = list
      .filter((x) => x.status === "upcoming")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    rows.push({
      patientId,
      patientName: patientUser?.name || sorted[0]?.patientName || "Bilinmeyen",
      email: patientUser?.email || "",
      phone: patientUser?.phone || "",
      birthDate: patientUser?.birthDate,
      gender: patientUser?.gender,
      bloodType: patientUser?.bloodType,
      lastVisit: sorted[0]?.date || "",
      nextAppointment: upcoming?.date,
      totalAppointments: list.length,
      completedAppointments: list.filter((x) => x.status === "completed").length,
      upcomingAppointments: list.filter((x) => x.status === "upcoming").length,
      status: "active",
    });
  }
  return rows.sort((a, b) => b.lastVisit.localeCompare(a.lastVisit));
}

export async function getPrescriptionsForDoctor(doctorDocId: string) {
  const rx = getDemoPrescriptions().filter((p) => p.doctorId === doctorDocId);
  const out: any[] = [];
  for (const p of rx) {
    const patient = getDemoUsers().find((u) => u.id === p.patientId);
    out.push({
      id: p.id,
      ...p,
      patientName: patient?.name || "Hasta",
      patientEmail: patient?.email || "",
    });
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

export async function addPrescriptionForDoctor(data: {
  patientId: string;
  patientName: string;
  medicine: string;
  dosage: string;
  instructions: string;
  quantity: string;
  doctorName: string;
  doctorId: string;
  date: string;
  status: "active" | "completed";
}) {
  return addDemoPrescription({
    patientId: data.patientId,
    medicine: data.medicine,
    dosage: data.dosage,
    doctor: data.doctorName,
    doctorId: data.doctorId,
    date: data.date,
    status: data.status,
    instructions: data.instructions,
    quantity: data.quantity,
  });
}

export async function updateDoctorProfile(docId: string, fields: Partial<DemoUserDoc>) {
  const u = getDemoUsers().find((x) => x.id === docId);
  if (!u) return;
  upsertDemoUser({ ...u, ...fields, id: docId } as DemoUserDoc);
}
