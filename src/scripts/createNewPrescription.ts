import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

const createNewPrescription = async () => {
  try {
    console.log("💊 Yeni test reçetesi oluşturuluyor...");
    
    const prescriptionsRef = collection(db, "prescriptions");
    
    const newPrescription = {
      patientId: "mUeDmHcUXTz5LvR3yZCU", // İsmail Emir'in patient ID'si
      medicine: "Aspirin",
      dosage: "100mg",
      doctor: "Dr. Zeynep Tiryaki",
      doctorId: "zeynep-tiryaki-id",
      date: "2024-01-20",
      status: "active",
      instructions: "Günde 1 kez, kahvaltıdan sonra 1 tablet alın. Mide rahatsızlığı varsa yemekle birlikte alın.",
      quantity: "20 tablet",
      refills: 1,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(prescriptionsRef, newPrescription);
    
    console.log("✅ Yeni reçete başarıyla oluşturuldu!");
    console.log("📋 Reçete ID:", docRef.id);
    console.log("💊 İlaç:", newPrescription.medicine);
    console.log("👨‍⚕️ Doktor:", newPrescription.doctor);
    console.log("📅 Tarih:", newPrescription.date);
    console.log("🔄 Durum:", newPrescription.status);
    
  } catch (error) {
    console.error("❌ Yeni reçete oluşturulurken hata:", error);
  }
};

createNewPrescription(); 