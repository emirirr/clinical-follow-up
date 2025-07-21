import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

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

const updateAdminUser = async () => {
  try {
    console.log('Admin kullanıcısı giriş yapılıyor...');
    
    // Admin kullanıcısına giriş yap
    const userCredential = await signInWithEmailAndPassword(
      auth,
      'ismailtiraki1@gmail.com',
      '123456'
    );

    console.log('✅ Admin kullanıcısına giriş yapıldı:', userCredential.user.uid);

    // Mevcut profili kontrol et
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (userDoc.exists()) {
      console.log('Mevcut profil:', userDoc.data());
    } else {
      console.log('Profil bulunamadı, yeni profil oluşturuluyor...');
    }

    // Admin profilini güncelle/oluştur
    const adminProfile = {
      userId: userCredential.user.uid,
      email: 'ismailtiraki1@gmail.com',
      role: 'admin',
      name: 'Admin User',
      phone: '',
      department: '',
      specialty: '',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), adminProfile);

    console.log('✅ Admin profili güncellendi/oluşturuldu');
    console.log('Email: ismailtiraki1@gmail.com');
    console.log('Şifre: 123456');
    console.log('Role: admin');

  } catch (error: any) {
    console.error('❌ Hata oluştu:', error);
    
    if (error.code === 'auth/user-not-found') {
      console.log('Kullanıcı bulunamadı. Önce kullanıcı oluşturulmalı.');
    } else if (error.code === 'auth/wrong-password') {
      console.log('Yanlış şifre.');
    } else {
      console.log('Beklenmeyen hata:', error.message);
    }
  }
};

// Scripti çalıştır
updateAdminUser(); 