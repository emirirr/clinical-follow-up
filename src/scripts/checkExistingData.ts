import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

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

const checkExistingData = async () => {
  try {
    console.log('🔍 Mevcut Firebase verileri kontrol ediliyor...');
    
    // Kullanıcıları kontrol et
    console.log('\n👥 KULLANICILAR:');
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);
    
    if (usersSnapshot.empty) {
      console.log('❌ Hiç kullanıcı bulunamadı');
    } else {
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`✅ Kullanıcı: ${data.name || 'İsimsiz'} (${data.email}) - Rol: ${data.role} - ID: ${doc.id}`);
      });
    }
    
    // Randevuları kontrol et
    console.log('\n📅 RANDEVULAR:');
    const appointmentsRef = collection(db, "appointments");
    const appointmentsSnapshot = await getDocs(appointmentsRef);
    
    if (appointmentsSnapshot.empty) {
      console.log('❌ Hiç randevu bulunamadı');
    } else {
      appointmentsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`✅ Randevu: ${data.patientName || 'Bilinmeyen Hasta'} - ${data.date} ${data.time} - Durum: ${data.status} - Doktor: ${data.doctorName || 'Bilinmeyen Doktor'}`);
      });
    }
    
    // Reçeteleri kontrol et
    console.log('\n💊 REÇETELER:');
    const prescriptionsRef = collection(db, "prescriptions");
    const prescriptionsSnapshot = await getDocs(prescriptionsRef);
    
    if (prescriptionsSnapshot.empty) {
      console.log('❌ Hiç reçete bulunamadı');
    } else {
      prescriptionsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`✅ Reçete: ${data.patientName || 'Bilinmeyen Hasta'} - ${data.date} - İlaçlar: ${data.medications?.join(', ') || 'Belirtilmemiş'}`);
      });
    }
    
    // Zeynep Tiryaki'yi özel olarak ara
    console.log('\n🔍 ZEYNEP TİRYAKİ ARAMA:');
    const zeynepQuery = query(usersRef, where("name", "==", "Zeynep Tiryaki"));
    const zeynepSnapshot = await getDocs(zeynepQuery);
    
    if (zeynepSnapshot.empty) {
      console.log('❌ Zeynep Tiryaki kullanıcısı bulunamadı');
      
      // Benzer isimleri ara
      console.log('\n🔍 BENZER İSİMLER:');
      const allUsers = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, name: data.name || '', email: data.email || '', role: data.role || '' };
      });
      const similarNames = allUsers.filter(user => 
        user.name && (
          user.name.toLowerCase().includes('zeynep') || 
          user.name.toLowerCase().includes('tiryaki')
        )
      );
      
      if (similarNames.length > 0) {
        console.log('Benzer isimler bulundu:');
        similarNames.forEach(user => {
          console.log(`- ${user.name} (${user.email}) - Rol: ${user.role}`);
        });
      } else {
        console.log('❌ Zeynep veya Tiryaki içeren isim bulunamadı');
      }
    } else {
      const zeynepData = zeynepSnapshot.docs[0].data();
      console.log(`✅ Zeynep Tiryaki bulundu: ${zeynepData.email} - Rol: ${zeynepData.role} - ID: ${zeynepSnapshot.docs[0].id}`);
      
      // Zeynep'in randevularını ara
      const zeynepAppointments = appointmentsSnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.patientName === "Zeynep Tiryaki" || data.patientId === zeynepSnapshot.docs[0].id;
      });
      
      console.log(`📅 Zeynep Tiryaki'nin randevuları: ${zeynepAppointments.length} adet`);
      zeynepAppointments.forEach(doc => {
        const data = doc.data();
        console.log(`- ${data.date} ${data.time} - ${data.type} - Durum: ${data.status}`);
      });
    }
    
    console.log('\n✅ Veri kontrolü tamamlandı!');
    
  } catch (error: any) {
    console.error('❌ Veri kontrolü sırasında hata:', error);
    
    if (error.code === 'permission-denied') {
      console.log('🔒 Firebase güvenlik kuralları nedeniyle veri okunamadı.');
      console.log('💡 Firebase Console\'da güvenlik kurallarını güncelleyin.');
    }
  }
};

checkExistingData(); 