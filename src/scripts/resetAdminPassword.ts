import { initializeApp } from 'firebase/app';
import { getAuth, updatePassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBALwj-lCresjKXSI2JJvJ_-WHRjkYP1pQ",
  authDomain: "kliniktakip-95901.firebaseapp.com",
  projectId: "kliniktakip-95901",
  storageBucket: "kliniktakip-95901.firebasestorage.app",
  messagingSenderId: "1091367979212",
  appId: "1:1091367979212:web:d02d7850787b881ca89a69",
  measurementId: "G-3FCFDR1LR8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const resetAdminPassword = async () => {
  try {
    console.log('Admin kullanıcısı kontrol ediliyor...');
    
    // Önce mevcut şifre ile giriş yapmayı deneyelim
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        'ismailtiraki1@gmail.com',
        '123456'
      );
      
      console.log('✅ Mevcut şifre ile giriş başarılı');
      console.log('Kullanıcı ID:', userCredential.user.uid);
      
      // Profili kontrol et
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        console.log('Profil bilgileri:', userDoc.data());
      }
      
    } catch (error: any) {
      console.log('❌ Mevcut şifre ile giriş başarısız:', error.code);
      
      if (error.code === 'auth/invalid-credential') {
        console.log('Şifre yanlış. Firebase Console\'dan şifre sıfırlama yapılmalı.');
        console.log('Adımlar:');
        console.log('1. https://console.firebase.google.com adresine gidin');
        console.log('2. kliniktakip-95901 projesini seçin');
        console.log('3. Authentication > Users bölümüne gidin');
        console.log('4. ismailtiraki1@gmail.com kullanıcısını bulun');
        console.log('5. "Reset password" butonuna tıklayın');
        console.log('6. Yeni şifre: 123456');
      }
    }

  } catch (error: any) {
    console.error('❌ Hata oluştu:', error);
  }
};

// Scripti çalıştır
resetAdminPassword(); 