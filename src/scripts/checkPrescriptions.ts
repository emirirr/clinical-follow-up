import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

const checkPrescriptions = async () => {
  try {
    console.log("🔍 Firebase'deki reçete verileri kontrol ediliyor...");
    
    const prescriptionsRef = collection(db, "prescriptions");
    const querySnapshot = await getDocs(prescriptionsRef);
    
    console.log(`📊 Toplam ${querySnapshot.size} reçete bulundu`);
    
    querySnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n📝 Reçete ${index + 1} (ID: ${doc.id}):`);
      console.log("  - İlaç:", data.medicine);
      console.log("  - Doktor:", data.doctor);
      console.log("  - Doktor ID:", data.doctorId);
      console.log("  - Hasta ID:", data.patientId);
      console.log("  - Durum:", data.status);
      console.log("  - Tarih:", data.date);
      console.log("  - Dozaj:", data.dosage);
      console.log("  - Miktar:", data.quantity);
      console.log("  - Yenileme:", data.refills);
      console.log("  - Talimatlar:", data.instructions);
    });
    
  } catch (error) {
    console.error("❌ Reçete verileri kontrol edilirken hata:", error);
  }
};

checkPrescriptions(); 