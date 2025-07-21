import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where,
  deleteDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  createdAt: any;
  updatedAt: any;
}

// Firebase konfigürasyonunu test et
export const testFirebaseConfig = (): boolean => {
  try {
    console.log("🔧 Firebase konfigürasyonu test ediliyor...");
    
    // db instance'ının var olup olmadığını kontrol et
    if (!db) {
      console.error("❌ Firestore instance bulunamadı");
      return false;
    }
    
    console.log("✅ Firestore instance mevcut");
    console.log("Firestore instance:", db);
    
    return true;
  } catch (error) {
    console.error("❌ Firebase konfigürasyon hatası:", error);
    return false;
  }
};

// Firestore güvenlik kurallarını test et
export const testFirestoreRules = async (): Promise<{read: boolean, write: boolean}> => {
  const testData = {
    test: true,
    timestamp: new Date(),
    userId: "test-user"
  };

  try {
    // Okuma testi
    console.log("📖 Firestore okuma testi başlatılıyor...");
    const testQuery = query(collection(db, "test"), where("test", "==", false));
    await getDocs(testQuery);
    console.log("✅ Firestore okuma testi başarılı");

    // Yazma testi
    console.log("✍️ Firestore yazma testi başlatılıyor...");
    const testDoc = await addDoc(collection(db, "test"), testData);
    console.log("✅ Firestore yazma testi başarılı, doküman ID:", testDoc.id);

    // Test dokümanını temizle
    try {
      await deleteDoc(doc(db, "test", testDoc.id));
      console.log("✅ Test dokümanı temizlendi");
    } catch (cleanupError) {
      console.warn("⚠️ Test dokümanı temizlenemedi:", cleanupError);
    }

    return { read: true, write: true };
  } catch (error: any) {
    console.error("❌ Firestore test hatası:", error);
    
    if (error.code === "permission-denied") {
      console.error("🔒 Firestore güvenlik kuralları nedeniyle erişim reddedildi");
      return { read: false, write: false };
    }
    
    return { read: false, write: false };
  }
};

// Firebase bağlantısını test et
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    console.log("🌐 Firebase bağlantısı test ediliyor...");
    console.log("Firestore instance:", db);
    
    // Basit bir doküman oluştur
    const testDoc = await addDoc(collection(db, "test"), {
      test: true,
      timestamp: new Date(),
      message: "Firebase bağlantı testi"
    });
    
    console.log("✅ Test dokümanı oluşturuldu, ID:", testDoc.id);
    
    // Dokümanı oku
    const docSnap = await getDocs(collection(db, "test"));
    console.log("✅ Test dokümanı okundu, sayı:", docSnap.size);
    
    // Test dokümanını temizle
    try {
      await deleteDoc(doc(db, "test", testDoc.id));
      console.log("✅ Test dokümanı temizlendi");
    } catch (cleanupError) {
      console.warn("⚠️ Test dokümanı temizlenemedi:", cleanupError);
    }
    
    console.log("✅ Firebase bağlantısı başarılı");
    return true;
  } catch (error: any) {
    console.error("❌ Firebase bağlantı hatası:", error);
    console.error("Hata kodu:", error.code);
    console.error("Hata mesajı:", error.message);
    console.error("Hata stack:", error.stack);
    
    // Hata türüne göre özel mesajlar
    if (error.code === "permission-denied") {
      console.error("🔒 Firestore güvenlik kuralları nedeniyle erişim reddedildi");
      console.error("💡 Çözüm: Firebase Console'da güvenlik kurallarını güncelleyin");
    } else if (error.code === "unavailable") {
      console.error("🌐 Firebase servisi şu anda kullanılamıyor");
    } else if (error.code === "unauthenticated") {
      console.error("👤 Kullanıcı kimlik doğrulaması gerekli");
    } else if (error.code === "not-found") {
      console.error("📁 Koleksiyon bulunamadı");
    } else if (error.code === "invalid-argument") {
      console.error("⚙️ Geçersiz Firebase konfigürasyonu");
    }
    
    return false;
  }
};

// Kullanıcı profilini getir
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const q = query(collection(db, "users"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Kullanıcı profili getirilemedi:", error);
    throw error;
  }
};

// Kullanıcı profilini kaydet/güncelle
export const saveUserProfile = async (userProfile: Omit<UserProfile, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  try {
    const now = new Date();
    const data = {
      ...userProfile,
      createdAt: now,
      updatedAt: now
    };

    // Önce mevcut kullanıcıyı kontrol et
    const existingUser = await getUserProfile(userProfile.userId);
    
    if (existingUser && existingUser.id) {
      // Güncelle
      const docRef = doc(db, "users", existingUser.id);
      await updateDoc(docRef, {
        ...userProfile,
        updatedAt: now
      });
      return existingUser.id;
    } else {
      // Yeni kayıt
      const docRef = await addDoc(collection(db, "users"), data);
      return docRef.id;
    }
  } catch (error) {
    console.error("Kullanıcı profili kaydedilemedi:", error);
    console.error("Hata detayları:", {
      userId: userProfile.userId,
      email: userProfile.email,
      role: userProfile.role,
      name: userProfile.name
    });
    throw error;
  }
};

// Kullanıcı rolüne göre yönlendirme URL'i
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

// Kullanıcı rolüne göre panel adı
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