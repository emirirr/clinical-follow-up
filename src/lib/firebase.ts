// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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