import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

const addTestPrescription = async () => {
  try {
    console.log("💊 Test reçete verisi ekleniyor...");
    
    const prescriptionsRef = collection(db, "prescriptions");
    
    const testPrescription = {
      patientId: "mUeDmHcUXTz5LvR3yZCU", // İsmail Emir'in patient ID'si
      medicine: "Parol (Paracetamol)",
      dosage: "500mg",
      doctor: "Dr. Zeynep Tiryaki",
      doctorId: "zeynep-tiryaki-id",
      date: "2024-01-15",
      status: "active",
      instructions: "Günde 3 kez, yemeklerden sonra 1 tablet alın. Aç karnına almayın.",
      quantity: "30 tablet",
      refills: 2,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(prescriptionsRef, testPrescription);
    
    console.log("✅ Test reçete başarıyla eklendi!");
    console.log("📋 Reçete ID:", docRef.id);
    console.log("💊 İlaç:", testPrescription.medicine);
    console.log("👨‍⚕️ Doktor:", testPrescription.doctor);
    console.log("📅 Tarih:", testPrescription.date);
    console.log("🔄 Durum:", testPrescription.status);
    
  } catch (error) {
    console.error("❌ Test reçete eklenirken hata:", error);
  }
};

addTestPrescription(); 