import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Appointment {
  id?: string;
  patientId: string;
  doctor: string;
  doctorId: string;
  date: string;
  time: string;
  type: string;
  status: "upcoming" | "completed" | "cancelled";
  location: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Hasta bilgilerini getir
export const getPatientInfo = async (userId: string): Promise<PatientInfo | null> => {
  try {
    console.log("Hasta bilgileri getiriliyor, userId:", userId);
    
    const q = query(collection(db, "patients"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    console.log("Sorgu sonucu:", querySnapshot.size, "doküman bulundu");
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const patientData = { id: doc.id, ...doc.data() } as PatientInfo;
      console.log("Hasta bilgileri:", patientData);
      return patientData;
    }
    
    console.log("Hasta bilgileri bulunamadı");
    return null;
  } catch (error) {
    console.error("Hasta bilgileri getirilemedi:", error);
    console.error("Hata detayları:", {
      userId,
      errorCode: (error as any).code,
      errorMessage: (error as any).message
    });
    throw error;
  }
};

// Hasta bilgilerini kaydet/güncelle
export const savePatientInfo = async (patientInfo: Omit<PatientInfo, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  try {
    const now = Timestamp.now();
    const data = {
      ...patientInfo,
      createdAt: now,
      updatedAt: now
    };

    const existingPatient = await getPatientInfo(patientInfo.userId);
    
    if (existingPatient && existingPatient.id) {
      // Güncelle - sadece değişen alanları güncelle
      const docRef = doc(db, "patients", existingPatient.id);
      await updateDoc(docRef, {
        name: patientInfo.name,
        email: patientInfo.email,
        phone: patientInfo.phone,
        address: patientInfo.address,
        birthDate: patientInfo.birthDate,
        bloodType: patientInfo.bloodType,
        gender: patientInfo.gender,
        emergencyContact: patientInfo.emergencyContact,
        medicalHistory: patientInfo.medicalHistory,
        allergies: patientInfo.allergies,
        currentMedications: patientInfo.currentMedications,
        updatedAt: now
      });
      return existingPatient.id;
    } else {
      // Yeni kayıt
      const docRef = await addDoc(collection(db, "patients"), data);
      return docRef.id;
    }
  } catch (error) {
    console.error("Hasta bilgileri kaydedilemedi:", error);
    console.error("Hata detayları:", {
      userId: patientInfo.userId,
      name: patientInfo.name,
      email: patientInfo.email
    });
    throw error;
  }
};

// Randevuları getir
export const getAppointments = async (patientId: string): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, "appointments"), 
      where("patientId", "==", patientId),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];
  } catch (error) {
    console.error("Randevular getirilemedi:", error);
    throw error;
  }
};

// Yeni randevu oluştur
export const createAppointment = async (appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  try {
    const now = Timestamp.now();
    const data = {
      ...appointment,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(db, "appointments"), data);
    return docRef.id;
  } catch (error) {
    console.error("Randevu oluşturulamadı:", error);
    throw error;
  }
};

// Randevu güncelle
export const updateAppointment = async (appointmentId: string, updates: Partial<Appointment>): Promise<void> => {
  try {
    const docRef = doc(db, "appointments", appointmentId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error("Randevu güncellenemedi:", error);
    throw error;
  }
};

// Randevu sil
export const deleteAppointment = async (appointmentId: string): Promise<void> => {
  try {
    const docRef = doc(db, "appointments", appointmentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Randevu silinemedi:", error);
    throw error;
  }
};

// Reçeteleri getir
export const getPrescriptions = async (patientId: string): Promise<Prescription[]> => {
  try {
    const q = query(
      collection(db, "prescriptions"), 
      where("patientId", "==", patientId),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Prescription[];
  } catch (error) {
    console.error("Reçeteler getirilemedi:", error);
    throw error;
  }
};

// Test sonuçlarını getir
export const getTestResults = async (patientId: string): Promise<TestResult[]> => {
  try {
    const q = query(
      collection(db, "testResults"), 
      where("patientId", "==", patientId),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TestResult[];
  } catch (error) {
    console.error("Test sonuçları getirilemedi:", error);
    throw error;
  }
};

// Doktorları getir
export const getDoctors = async (): Promise<any[]> => {
  try {
    const q = query(collection(db, "doctors"), where("status", "==", "active"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Doktorlar getirilemedi:", error);
    throw error;
  }
};

// Bildirimleri getir
export const getNotifications = async (patientId: string): Promise<any[]> => {
  try {
    const q = query(
      collection(db, "notifications"), 
      where("patientId", "==", patientId),
      where("read", "==", false),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Bildirimler getirilemedi:", error);
    throw error;
  }
}; 