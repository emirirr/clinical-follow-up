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
    console.log("👤 Hasta bilgileri getiriliyor, userId:", userId);
    
    // Önce users koleksiyonundan hasta bilgilerini çek
    const usersQuery = query(collection(db, "users"), where("userId", "==", userId));
    const usersSnapshot = await getDocs(usersQuery);
    
    console.log("👥 Users sorgu sonucu:", usersSnapshot.size, "doküman bulundu");
    
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      const userData = userDoc.data();
      console.log("👤 User verisi:", userData);
      
      // PatientInfo formatına dönüştür
      const patientData: PatientInfo = {
        id: userDoc.id,
        userId: userData.userId || userId,
        name: userData.name || "Bilinmeyen Hasta",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
        birthDate: userData.birthDate || "",
        bloodType: userData.bloodType || "",
        gender: userData.gender || "other",
        emergencyContact: userData.emergencyContact || {
          name: "",
          phone: "",
          relationship: ""
        },
        medicalHistory: userData.medicalHistory || [],
        allergies: userData.allergies || [],
        currentMedications: userData.currentMedications || [],
        insuranceInfo: userData.insuranceInfo,
        createdAt: userData.createdAt || Timestamp.now(),
        updatedAt: userData.updatedAt || Timestamp.now()
      };
      
      console.log("✅ Hasta bilgileri başarıyla getirildi:", patientData);
      return patientData;
    }
    
    // Eğer users'da bulunamazsa patients koleksiyonunu da kontrol et
    console.log("🔍 Patients koleksiyonunda aranıyor...");
    const patientsQuery = query(collection(db, "patients"), where("userId", "==", userId));
    const patientsSnapshot = await getDocs(patientsQuery);
    
    console.log("🏥 Patients sorgu sonucu:", patientsSnapshot.size, "doküman bulundu");
    
    if (!patientsSnapshot.empty) {
      const doc = patientsSnapshot.docs[0];
      const patientData = { id: doc.id, ...doc.data() } as PatientInfo;
      console.log("✅ Patients koleksiyonundan hasta bilgileri:", patientData);
      return patientData;
    }
    
    console.log("❌ Hasta bilgileri bulunamadı");
    return null;
  } catch (error: any) {
    console.error("❌ Hasta bilgileri getirilemedi:", error);
    console.error("🔍 Hata detayları:", {
      userId,
      errorCode: error.code,
      errorMessage: error.message,
      stack: error.stack
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
    console.log("📅 Randevular getiriliyor, patientId:", patientId);
    
    // Önce index olmadan deneyelim
    try {
      const q = query(
        collection(db, "appointments"), 
        where("patientId", "==", patientId),
        orderBy("date", "desc")
      );
      const querySnapshot = await getDocs(q);
      
      const appointments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      
      console.log("✅ Randevular başarıyla getirildi:", appointments.length);
      return appointments;
    } catch (indexError: any) {
      console.log("⚠️ Index hatası, sıralama olmadan deniyorum...");
      
      // Index hatası varsa sıralama olmadan dene
      const q = query(
        collection(db, "appointments"), 
        where("patientId", "==", patientId)
      );
      const querySnapshot = await getDocs(q);
      
      const appointments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      
      // Client-side sıralama
      appointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      console.log("✅ Randevular (client-side sıralama ile) getirildi:", appointments.length);
      return appointments;
    }
  } catch (error: any) {
    console.error("❌ Randevular getirilemedi:", error);
    console.error("🔍 Hata detayları:", {
      patientId,
      errorCode: error.code,
      errorMessage: error.message
    });
    throw error;
  }
};

// Yeni randevu oluştur
export const createAppointment = async (appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  try {
    console.log("📅 Randevu oluşturuluyor...");
    console.log("📝 Randevu verisi:", appointment);
    
    // Veri doğrulama
    if (!appointment.patientId) {
      throw new Error("Hasta ID gereklidir");
    }
    if (!appointment.doctorId) {
      throw new Error("Doktor ID gereklidir");
    }
    if (!appointment.date) {
      throw new Error("Tarih gereklidir");
    }
    if (!appointment.time) {
      throw new Error("Saat gereklidir");
    }
    if (!appointment.type) {
      throw new Error("Randevu türü gereklidir");
    }
    
    console.log("✅ Veri doğrulama başarılı");
    
    const now = Timestamp.now();
    const data = {
      ...appointment,
      createdAt: now,
      updatedAt: now
    };
    
    console.log("💾 Firebase'e kaydediliyor...");
    console.log("📊 Kaydedilecek veri:", data);
    
    const appointmentsRef = collection(db, "appointments");
    console.log("📋 Appointments koleksiyonu referansı:", appointmentsRef);
    
    const docRef = await addDoc(appointmentsRef, data);
    
    console.log("✅ Randevu başarıyla oluşturuldu, ID:", docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error("❌ Randevu oluşturulamadı:", error);
    console.error("🔍 Hata detayları:", {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
};

// Randevu güncelle
export const updateAppointment = async (appointmentId: string, updates: Partial<Appointment>): Promise<void> => {
  try {
    console.log("📝 Randevu güncelleniyor...");
    console.log("🆔 Randevu ID:", appointmentId);
    console.log("📋 Güncelleme verileri:", updates);
    
    const docRef = doc(db, "appointments", appointmentId);
    console.log("📋 Doküman referansı:", docRef);
    
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    
    console.log("💾 Firebase'e güncelleniyor...");
    console.log("📊 Güncellenecek veri:", updateData);
    
    await updateDoc(docRef, updateData);
    
    console.log("✅ Randevu başarıyla güncellendi");
  } catch (error: any) {
    console.error("❌ Randevu güncellenemedi:", error);
    console.error("🔍 Hata detayları:", {
      appointmentId,
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
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
    console.log("💊 Hasta reçeteleri getiriliyor, patientId:", patientId);
    
    const prescriptionsRef = collection(db, "prescriptions");
    
    try {
      // Önce orderBy ile deneyelim
      const q = query(
        prescriptionsRef, 
        where("patientId", "==", patientId),
        orderBy("date", "desc")
      );
      const querySnapshot = await getDocs(q);
      
      const prescriptions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Prescription[];
      
      console.log("✅ Reçeteler başarıyla getirildi (orderBy ile):", prescriptions.length);
      
      // Doktor bilgilerini getir
      const prescriptionsWithDoctorInfo = await Promise.all(
        prescriptions.map(async (prescription) => {
          if (prescription.doctorId) {
            try {
              console.log("👨‍⚕️ Doktor bilgileri getiriliyor, doctorId:", prescription.doctorId);
              
              // users koleksiyonundan doktor bilgilerini çek
              const usersQuery = query(
                collection(db, "users"), 
                where("userId", "==", prescription.doctorId)
              );
              const usersSnapshot = await getDocs(usersQuery);
              
              if (!usersSnapshot.empty) {
                const doctorData = usersSnapshot.docs[0].data();
                console.log("✅ Doktor bilgileri bulundu:", doctorData.name);
                
                return {
                  ...prescription,
                  doctor: doctorData.name || prescription.doctor || "Bilinmeyen Doktor"
                };
              } else {
                console.warn("⚠️ Doktor bilgileri bulunamadı, doctorId:", prescription.doctorId);
                return prescription;
              }
            } catch (error) {
              console.error("❌ Doktor bilgileri getirilemedi:", error);
              return prescription;
            }
          } else {
            console.log("ℹ️ Doktor ID yok, mevcut doktor bilgisi kullanılıyor:", prescription.doctor);
            return prescription;
          }
        })
      );
      
      return prescriptionsWithDoctorInfo;
      
    } catch (indexError: any) {
      // Index hatası varsa, orderBy olmadan deneyelim
      if (indexError.code === 'failed-precondition' || indexError.message.includes('index')) {
        console.log("⚠️ Index hatası, orderBy olmadan deneyelim...");
        
        const q = query(
          prescriptionsRef, 
          where("patientId", "==", patientId)
        );
        const querySnapshot = await getDocs(q);
        
        const prescriptions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Prescription[];
        
        // Client-side sorting
        prescriptions.sort((a, b) => b.date.localeCompare(a.date));
        
        console.log("✅ Reçeteler başarıyla getirildi (client-side sorted):", prescriptions.length);
        
        // Doktor bilgilerini getir
        const prescriptionsWithDoctorInfo = await Promise.all(
          prescriptions.map(async (prescription) => {
            if (prescription.doctorId) {
              try {
                console.log("👨‍⚕️ Doktor bilgileri getiriliyor, doctorId:", prescription.doctorId);
                
                // users koleksiyonundan doktor bilgilerini çek
                const usersQuery = query(
                  collection(db, "users"), 
                  where("userId", "==", prescription.doctorId)
                );
                const usersSnapshot = await getDocs(usersQuery);
                
                if (!usersSnapshot.empty) {
                  const doctorData = usersSnapshot.docs[0].data();
                  console.log("✅ Doktor bilgileri bulundu:", doctorData.name);
                  
                  return {
                    ...prescription,
                    doctor: doctorData.name || prescription.doctor || "Bilinmeyen Doktor"
                  };
                } else {
                  console.warn("⚠️ Doktor bilgileri bulunamadı, doctorId:", prescription.doctorId);
                  return prescription;
                }
              } catch (error) {
                console.error("❌ Doktor bilgileri getirilemedi:", error);
                return prescription;
              }
            } else {
              console.log("ℹ️ Doktor ID yok, mevcut doktor bilgisi kullanılıyor:", prescription.doctor);
              return prescription;
            }
          })
        );
        
        return prescriptionsWithDoctorInfo;
      } else {
        throw indexError;
      }
    }
  } catch (error) {
    console.error("❌ Reçeteler getirilemedi:", error);
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
    console.log("👨‍⚕️ Firebase'den doktorlar getiriliyor...");
    
    // users koleksiyonundan doktorları çek
    const q = query(
      collection(db, "users"), 
      where("role", "==", "doctor"),
      where("status", "==", "active")
    );
    const querySnapshot = await getDocs(q);
    
    const doctors = querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || "Bilinmeyen Doktor",
      specialty: doc.data().specialty || "Genel",
      department: doc.data().department || "Genel Bölüm",
      ...doc.data()
    }));
    
    console.log("✅ Doktorlar başarıyla getirildi:", doctors.length);
    console.log("📋 Doktor listesi:", doctors);
    
    return doctors;
  } catch (error) {
    console.error("❌ Doktorlar getirilemedi:", error);
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