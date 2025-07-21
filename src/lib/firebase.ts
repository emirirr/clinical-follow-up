// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBALwj-lCresjKXSI2JJvJ_-WHRjkYP1pQ",
  authDomain: "kliniktakip-95901.firebaseapp.com",
  projectId: "kliniktakip-95901",
  storageBucket: "kliniktakip-95901.firebasestorage.app",
  messagingSenderId: "1091367979212",
  appId: "1:1091367979212:web:d02d7850787b881ca89a69",
  measurementId: "G-3FCFDR1LR8"
};

// Firebase konfigürasyonunu doğrula
const validateFirebaseConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);
  
  if (missingFields.length > 0) {
    console.error('❌ Eksik Firebase konfigürasyon alanları:', missingFields);
    return false;
  }
  
  console.log('✅ Firebase konfigürasyonu doğru');
  return true;
};

// Firebase bağlantı test fonksiyonu
export const testFirebaseConnection = async () => {
  try {
    console.log('🔍 Firebase bağlantısı test ediliyor...');
    
    // Firestore bağlantısını test et
    const testCollection = collection(db, "test");
    const testSnapshot = await getDocs(testCollection);
    
    console.log('✅ Firestore bağlantısı başarılı');
    console.log('📊 Test koleksiyonu doküman sayısı:', testSnapshot.docs.length);
    
    // Users koleksiyonunu test et
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);
    
    console.log('✅ Users koleksiyonu erişilebilir');
    console.log('👥 Toplam kullanıcı sayısı:', usersSnapshot.docs.length);
    
    // Appointments koleksiyonunu test et
    const appointmentsCollection = collection(db, "appointments");
    const appointmentsSnapshot = await getDocs(appointmentsCollection);
    
    console.log('✅ Appointments koleksiyonu erişilebilir');
    console.log('📅 Toplam randevu sayısı:', appointmentsSnapshot.docs.length);
    
    return {
      success: true,
      users: usersSnapshot.docs.length,
      appointments: appointmentsSnapshot.docs.length,
      message: 'Firebase bağlantısı başarılı'
    };
    
  } catch (error) {
    console.error('❌ Firebase bağlantı testi başarısız:', error);
    return {
      success: false,
      error: error,
      message: 'Firebase bağlantısı başarısız'
    };
  }
};

// Initialize Firebase
let app;
let auth;
let db;
let storage;
let analytics;

try {
  console.log('Firebase başlatılıyor...');
  
  // Konfigürasyonu doğrula
  if (!validateFirebaseConfig()) {
    throw new Error('Firebase konfigürasyonu eksik');
  }
  
  console.log('Konfigürasyon:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    apiKey: firebaseConfig.apiKey ? 'Mevcut' : 'Eksik'
  });

  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app başlatıldı');

  auth = getAuth(app);
  console.log('✅ Firebase Auth başlatıldı');

  db = getFirestore(app);
  console.log('✅ Firebase Firestore başlatıldı');

  storage = getStorage(app);
  console.log('✅ Firebase Storage başlatıldı');

  // Analytics'i sadece browser'da başlat
  if (typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app);
      console.log('✅ Firebase Analytics başlatıldı');
    } catch (error) {
      console.warn('⚠️ Analytics başlatılamadı:', error);
    }
  }

  console.log('🎉 Firebase başarıyla başlatıldı!');
} catch (error) {
  console.error('❌ Firebase başlatma hatası:', error);
  throw error;
}

export { app, analytics, auth, db, storage }; 