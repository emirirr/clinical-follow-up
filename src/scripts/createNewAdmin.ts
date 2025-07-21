import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

const createNewAdmin = async () => {
  try {
    console.log('Yeni admin kullanıcısı oluşturuluyor...');
    
    // Yeni admin kullanıcısını oluştur
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'admin@klinik.com',
      '123456'
    );

    console.log('Firebase Auth kullanıcısı oluşturuldu:', userCredential.user.uid);

    // Admin profilini Firestore'a kaydet
    const adminProfile = {
      userId: userCredential.user.uid,
      email: 'admin@klinik.com',
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

    console.log('✅ Yeni admin kullanıcısı başarıyla oluşturuldu!');
    console.log('Email: admin@klinik.com');
    console.log('Şifre: 123456');
    console.log('Role: admin');

  } catch (error: any) {
    console.error('❌ Hata oluştu:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('Bu email adresi zaten kullanımda. Kullanıcı mevcut.');
      console.log('Email: admin@klinik.com');
      console.log('Şifre: 123456');
    } else {
      console.log('Beklenmeyen hata:', error.message);
    }
  }
};

// Scripti çalıştır
createNewAdmin(); 