import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";

const updatePrescriptions = async () => {
  try {
    console.log("🔍 Firebase'deki reçete verileri kontrol ediliyor...");
    
    const prescriptionsRef = collection(db, "prescriptions");
    const querySnapshot = await getDocs(prescriptionsRef);
    
    console.log(`📊 Toplam ${querySnapshot.size} reçete bulundu`);
    
    let index = 0;
    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      console.log(`\n📝 Reçete ${index + 1} (ID: ${docSnapshot.id}):`);
      console.log("  - İlaç:", data.medicine);
      console.log("  - Doktor:", data.doctor);
      console.log("  - Doktor ID:", data.doctorId);
      console.log("  - Hasta ID:", data.patientId);
      
      // Eksik verileri güncelle
      const updates: any = {};
      
      if (!data.medicine) {
        updates.medicine = "Parol (Paracetamol)";
        console.log("  ✅ İlaç adı eklendi");
      }
      
      if (!data.doctor) {
        updates.doctor = "Dr. Zeynep Tiryaki";
        console.log("  ✅ Doktor adı eklendi");
      }
      
      if (!data.doctorId) {
        updates.doctorId = "zeynep-tiryaki-id";
        console.log("  ✅ Doktor ID eklendi");
      }
      
      if (!data.dosage) {
        updates.dosage = "500mg";
        console.log("  ✅ Dozaj eklendi");
      }
      
      if (!data.quantity) {
        updates.quantity = "30 tablet";
        console.log("  ✅ Miktar eklendi");
      }
      
      if (!data.instructions) {
        updates.instructions = "Günde 3 kez, yemeklerden sonra 1 tablet alın. Aç karnına almayın.";
        console.log("  ✅ Talimatlar eklendi");
      }
      
      if (!data.status) {
        updates.status = "active";
        console.log("  ✅ Durum eklendi");
      }
      
      if (!data.refills) {
        updates.refills = 2;
        console.log("  ✅ Yenileme hakkı eklendi");
      }
      
      // Güncellemeler varsa uygula
      if (Object.keys(updates).length > 0) {
        try {
          await updateDoc(doc(db, "prescriptions", docSnapshot.id), updates);
          console.log("  ✅ Reçete güncellendi");
        } catch (error) {
          console.error("  ❌ Reçete güncellenirken hata:", error);
        }
      } else {
        console.log("  ℹ️ Güncelleme gerekmiyor");
      }
      
      index++;
    }
    
  } catch (error) {
    console.error("❌ Reçete verileri kontrol edilirken hata:", error);
  }
};

updatePrescriptions(); 