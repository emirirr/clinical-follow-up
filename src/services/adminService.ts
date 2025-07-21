import { getFirestore, collection, getDocs, query, where, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  try {
    const usersRef = collection(db, "users");
    
    // Tüm kullanıcıları getir
    const usersSnapshot = await getDocs(usersRef);
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    
    // Hasta sayısı
    const patients = users.filter((user: any) => user.role === "patient");
    const totalPatients = patients.length;
    
    // Doktor sayısı
    const doctors = users.filter((user: any) => user.role === "doctor");
    const totalDoctors = doctors.length;
    const activeDoctors = doctors.filter((doctor: any) => doctor.status === "active").length;
    
    // Bu ayki veriler
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Bu ayki hasta kayıtları
    const thisMonthPatients = patients.filter((patient: any) => {
      const createdAt = patient.createdAt?.toDate?.() || new Date(patient.createdAt);
      return createdAt >= startOfMonth && createdAt <= endOfMonth;
    }).length;
    
    // Bu ayki doktor kayıtları
    const thisMonthDoctors = doctors.filter((doctor: any) => {
      const createdAt = doctor.createdAt?.toDate?.() || new Date(doctor.createdAt);
      return createdAt >= startOfMonth && createdAt <= endOfMonth;
    }).length;
    
    // Son 5 hasta
    const recentPatients = patients
      .sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);
    
    // Son 5 doktor
    const recentDoctors = doctors
      .sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);
    
    // Randevu sayıları (şimdilik mock data - gerçek randevu collection'ı eklendiğinde güncellenecek)
    const totalAppointments = 573;
    const completedAppointments = 445;
    const cancelledAppointments = 28;
    const thisMonthAppointments = 45; // Bu ayki randevu sayısı
    
    // Büyüme oranları (hesaplanmış)
    const lastMonthPatients = Math.max(0, totalPatients - thisMonthPatients);
    const patientGrowth = lastMonthPatients > 0 ? ((thisMonthPatients / lastMonthPatients) * 100) : 0;
    
    const lastMonthDoctors = Math.max(0, totalDoctors - thisMonthDoctors);
    const doctorGrowth = lastMonthDoctors > 0 ? ((thisMonthDoctors / lastMonthDoctors) * 100) : 0;
    
    const monthlyGrowth = 12.5; // Randevu büyüme oranı (şimdilik mock)
    
    // Son randevular (mock data)
    const recentAppointments = [
      {
        id: "1",
        patientName: "Ahmet Yılmaz",
        doctorName: "Dr. Ayşe Yılmaz",
        date: "2024-01-15",
        time: "09:00",
        status: "upcoming"
      },
      {
        id: "2",
        patientName: "Fatma Demir",
        doctorName: "Dr. Mehmet Demir",
        date: "2024-01-16",
        time: "14:30",
        status: "upcoming"
      }
    ];
    
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
      recentAppointments
    };
  } catch (error) {
    console.error("Admin istatistikleri alınırken hata:", error);
    
    // Hata durumunda varsayılan değerler
    return {
      totalPatients: 0,
      totalDoctors: 0,
      totalAppointments: 0,
      activeDoctors: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      monthlyGrowth: 0,
      patientGrowth: 0,
      doctorGrowth: 0,
      thisMonthAppointments: 0,
      thisMonthPatients: 0,
      thisMonthDoctors: 0,
      recentPatients: [],
      recentDoctors: [],
      recentAppointments: []
    };
  }
};

export const getRecentDoctors = async (limitCount: number = 5) => {
  try {
    const usersRef = collection(db, "users");
    const doctorsQuery = query(
      usersRef,
      where("role", "==", "doctor"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(doctorsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Son doktorlar alınırken hata:", error);
    return [];
  }
};

export const getRecentPatients = async (limitCount: number = 5) => {
  try {
    const usersRef = collection(db, "users");
    const patientsQuery = query(
      usersRef,
      where("role", "==", "patient"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(patientsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Son hastalar alınırken hata:", error);
    return [];
  }
}; 