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

const createDoctorUser = async () => {
  try {
    console.log('Doktor kullanıcısı oluşturuluyor...');
    
    // Doktor kullanıcısını oluştur
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'doctor@klinik.com',
      '123456'
    );

    console.log('Firebase Auth kullanıcısı oluşturuldu:', userCredential.user.uid);

    // Doktor profilini Firestore'a kaydet
    const doctorProfile = {
      userId: userCredential.user.uid,
      email: 'doctor@klinik.com',
      role: 'doctor',
      name: 'Dr. Ahmet Yılmaz',
      phone: '+90 555 123 4567',
      department: 'Kardiyoloji',
      specialty: 'Kardiyoloji Uzmanı',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), doctorProfile);

    console.log('Doktor profili Firestore\'a kaydedildi');
    console.log('✅ Doktor kullanıcısı başarıyla oluşturuldu!');
    console.log('Email: doctor@klinik.com');
    console.log('Şifre: 123456');
    console.log('Role: doctor');
    console.log('Ad: Dr. Ahmet Yılmaz');
    console.log('Departman: Kardiyoloji');

  } catch (error: any) {
    console.error('❌ Hata oluştu:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('Bu email adresi zaten kullanımda. Kullanıcı mevcut.');
    } else {
      console.log('Beklenmeyen hata:', error.message);
    }
  }
};

createDoctorUser(); 