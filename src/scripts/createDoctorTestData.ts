import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

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
const db = getFirestore(app);

const createDoctorTestData = async () => {
  try {
    console.log('Doktor test verileri oluşturuluyor...');
    
    // Önce doktor ID'sini bul
    const usersRef = collection(db, "users");
    const doctorQuery = query(usersRef, where("email", "==", "doctor@klinik.com"));
    const doctorSnapshot = await getDocs(doctorQuery);
    
    if (doctorSnapshot.empty) {
      console.error('❌ Doktor bulunamadı. Önce doktor hesabı oluşturun.');
      return;
    }
    
    const doctorDoc = doctorSnapshot.docs[0];
    const doctorId = doctorDoc.id;
    console.log('👨‍⚕️ Doktor ID bulundu:', doctorId);
    
    // Test randevuları oluştur
    const appointments = [
      {
        patientId: "patient-1",
        patientName: "Ahmet Yılmaz",
        doctorId: doctorId,
        doctorName: "Dr. Ahmet Yılmaz",
        date: "2024-01-25",
        time: "09:00",
        type: "Kontrol",
        status: "upcoming",
        location: "Kardiyoloji Polikliniği",
        notes: "Rutin kontrol",
        createdAt: new Date()
      },
      {
        patientId: "patient-2",
        patientName: "Fatma Demir",
        doctorId: doctorId,
        doctorName: "Dr. Ahmet Yılmaz",
        date: "2024-01-24",
        time: "14:30",
        type: "İlk Muayene",
        status: "completed",
        location: "Kardiyoloji Polikliniği",
        notes: "Yeni hasta muayenesi tamamlandı",
        createdAt: new Date()
      },
      {
        patientId: "patient-3",
        patientName: "Mehmet Kaya",
        doctorId: doctorId,
        doctorName: "Dr. Ahmet Yılmaz",
        date: "2024-01-23",
        time: "11:15",
        type: "Kontrol",
        status: "completed",
        location: "Kardiyoloji Polikliniği",
        notes: "Kontrol muayenesi",
        createdAt: new Date()
      },
      {
        patientId: "patient-4",
        patientName: "Ayşe Özkan",
        doctorId: doctorId,
        doctorName: "Dr. Ahmet Yılmaz",
        date: "2024-01-22",
        time: "16:00",
        type: "Kontrol",
        status: "cancelled",
        location: "Kardiyoloji Polikliniği",
        notes: "Hasta iptal etti",
        createdAt: new Date()
      },
      {
        patientId: "patient-5",
        patientName: "Ali Veli",
        doctorId: doctorId,
        doctorName: "Dr. Ahmet Yılmaz",
        date: "2024-01-21",
        time: "10:30",
        type: "İlk Muayene",
        status: "completed",
        location: "Kardiyoloji Polikliniği",
        notes: "Yeni hasta muayenesi",
        createdAt: new Date()
      },
      {
        patientId: "patient-6",
        patientName: "Zeynep Arslan",
        doctorId: doctorId,
        doctorName: "Dr. Ahmet Yılmaz",
        date: "2024-01-26",
        time: "13:45",
        type: "Kontrol",
        status: "upcoming",
        location: "Kardiyoloji Polikliniği",
        notes: "Kontrol randevusu",
        createdAt: new Date()
      }
    ];

    console.log('Randevular oluşturuluyor...');
    for (const appointment of appointments) {
      await addDoc(collection(db, "appointments"), appointment);
      console.log(`✅ Randevu oluşturuldu: ${appointment.patientName} - ${appointment.date} ${appointment.time}`);
    }

    // Test reçeteleri oluştur
    const prescriptions = [
      {
        patientId: "patient-1",
        patientName: "Ahmet Yılmaz",
        doctorId: doctorId,
        doctorName: "Dr. Ahmet Yılmaz",
        date: "2024-01-25",
        medications: ["Aspirin", "Metoprolol"],
        dosage: "Aspirin 100mg günde 1 kez, Metoprolol 50mg günde 2 kez",
        instructions: "Yemeklerden sonra alınacak",
        status: "active",
        notes: "Kardiyovasküler koruma",
        createdAt: new Date()
      },
      {
        patientId: "patient-2",
        patientName: "Fatma Demir",
        doctorId: doctorId,
        doctorName: "Dr. Ahmet Yılmaz",
        date: "2024-01-24",
        medications: ["Lisinopril", "Amlodipin"],
        dosage: "Lisinopril 10mg günde 1 kez, Amlodipin 5mg günde 1 kez",
        instructions: "Sabah aç karnına alınacak",
        status: "active",
        notes: "Hipertansiyon tedavisi",
        createdAt: new Date()
      },
      {
        patientId: "patient-3",
        patientName: "Mehmet Kaya",
        doctorId: doctorId,
        doctorName: "Dr. Ahmet Yılmaz",
        date: "2024-01-23",
        medications: ["Atorvastatin"],
        dosage: "Atorvastatin 20mg günde 1 kez",
        instructions: "Akşam yemeğinden sonra alınacak",
        status: "active",
        notes: "Kolesterol tedavisi",
        createdAt: new Date()
      }
    ];

    console.log('Reçeteler oluşturuluyor...');
    for (const prescription of prescriptions) {
      await addDoc(collection(db, "prescriptions"), prescription);
      console.log(`✅ Reçete oluşturuldu: ${prescription.patientName} - ${prescription.medications.join(", ")}`);
    }

    console.log('✅ Tüm doktor test verileri başarıyla oluşturuldu!');
    console.log('📊 Oluşturulan veriler:');
    console.log('- 6 randevu (2 yaklaşan, 3 tamamlanan, 1 iptal)');
    console.log('- 3 reçete');
    console.log('- 6 farklı hasta');
    console.log('👨‍⚕️ Doktor ID:', doctorId);

  } catch (error: any) {
    console.error('❌ Doktor test verileri oluşturulamadı:', error);
    
    if (error.code === 'permission-denied') {
      console.log('🔒 Firebase güvenlik kuralları nedeniyle veri oluşturulamadı.');
      console.log('💡 Firebase Console\'da güvenlik kurallarını güncelleyin veya manuel olarak veri ekleyin.');
    }
  }
};

createDoctorTestData(); 