import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

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

const createTestData = async () => {
  try {
    console.log('Test verileri oluşturuluyor...');
    
    // Test randevuları oluştur
    const appointments = [
      {
        patientId: "test-patient-1",
        patientName: "Ahmet Yılmaz",
        doctorId: "TMavQJfybxPZL8pxCGATyBjkOv83",
        doctorName: "Dr. Ahmet Yılmaz",
        date: "2024-01-15",
        time: "10:00",
        type: "Kontrol",
        status: "completed",
        location: "Kardiyoloji Polikliniği",
        notes: "Hasta kontrolden geçti",
        createdAt: new Date()
      },
      {
        patientId: "test-patient-2",
        patientName: "Fatma Demir",
        doctorId: "TMavQJfybxPZL8pxCGATyBjkOv83",
        doctorName: "Dr. Ahmet Yılmaz",
        date: "2024-01-20",
        time: "14:30",
        type: "İlk Muayene",
        status: "upcoming",
        location: "Kardiyoloji Polikliniği",
        notes: "Yeni hasta",
        createdAt: new Date()
      },
      {
        patientId: "test-patient-3",
        patientName: "Mehmet Kaya",
        doctorId: "TMavQJfybxPZL8pxCGATyBjkOv83",
        doctorName: "Dr. Ahmet Yılmaz",
        date: "2024-01-18",
        time: "11:15",
        type: "Kontrol",
        status: "completed",
        location: "Kardiyoloji Polikliniği",
        notes: "Rutin kontrol",
        createdAt: new Date()
      }
    ];

    console.log('Randevular oluşturuluyor...');
    for (const appointment of appointments) {
      await addDoc(collection(db, "appointments"), appointment);
      console.log(`✅ Randevu oluşturuldu: ${appointment.patientName} - ${appointment.date}`);
    }

    // Test reçeteleri oluştur
    const prescriptions = [
      {
        patientId: "test-patient-1",
        patientName: "Ahmet Yılmaz",
        doctorId: "TMavQJfybxPZL8pxCGATyBjkOv83",
        doctorName: "Dr. Ahmet Yılmaz",
        date: "2024-01-15",
        medications: ["Aspirin", "Metoprolol"],
        dosage: "Aspirin 100mg günde 1 kez, Metoprolol 50mg günde 2 kez",
        instructions: "Yemeklerden sonra alınacak",
        status: "active",
        notes: "Kardiyovasküler koruma",
        createdAt: new Date()
      },
      {
        patientId: "test-patient-2",
        patientName: "Fatma Demir",
        doctorId: "TMavQJfybxPZL8pxCGATyBjkOv83",
        doctorName: "Dr. Ahmet Yılmaz",
        date: "2024-01-20",
        medications: ["Lisinopril", "Amlodipin"],
        dosage: "Lisinopril 10mg günde 1 kez, Amlodipin 5mg günde 1 kez",
        instructions: "Sabah aç karnına alınacak",
        status: "active",
        notes: "Hipertansiyon tedavisi",
        createdAt: new Date()
      }
    ];

    console.log('Reçeteler oluşturuluyor...');
    for (const prescription of prescriptions) {
      await addDoc(collection(db, "prescriptions"), prescription);
      console.log(`✅ Reçete oluşturuldu: ${prescription.patientName} - ${prescription.medications.join(", ")}`);
    }

    console.log('✅ Tüm test verileri başarıyla oluşturuldu!');
    console.log('📊 Oluşturulan veriler:');
    console.log('- 3 randevu');
    console.log('- 2 reçete');
    console.log('- 3 farklı hasta');

  } catch (error: any) {
    console.error('❌ Test verileri oluşturulamadı:', error);
  }
};

createTestData(); 