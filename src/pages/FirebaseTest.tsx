import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getPatientInfo, savePatientInfo } from "@/services/patientService";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const FirebaseTest = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testFirebaseConnection = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      addResult("Firebase bağlantısı test ediliyor...");
      
      // Firestore bağlantısını test et
      const db = getFirestore();
      addResult("Firestore başarıyla başlatıldı");
      
      // Test koleksiyonunu kontrol et
      const testCollection = collection(db, "test");
      const testSnapshot = await getDocs(testCollection);
      addResult(`Test koleksiyonu erişimi: ${testSnapshot.size} doküman`);
      
      // Patients koleksiyonunu kontrol et
      const patientsCollection = collection(db, "patients");
      const patientsSnapshot = await getDocs(patientsCollection);
      addResult(`Patients koleksiyonu erişimi: ${patientsSnapshot.size} doküman`);
      
      addResult("✅ Firebase bağlantısı başarılı!");
      
    } catch (error: any) {
      addResult(`❌ Firebase bağlantı hatası: ${error.message}`);
      console.error("Firebase test hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const testPatientProfile = async () => {
    if (!user) {
      addResult("❌ Kullanıcı girişi yapılmamış");
      return;
    }

    setLoading(true);
    
    try {
      addResult("Hasta profil testi başlatılıyor...");
      
      // Mevcut hasta bilgilerini getir
      addResult(`Kullanıcı ID: ${user.uid}`);
      const patient = await getPatientInfo(user.uid);
      
      if (patient) {
        addResult(`✅ Mevcut hasta bilgileri bulundu: ${patient.name}`);
        addResult(`Email: ${patient.email}, Telefon: ${patient.phone}`);
      } else {
        addResult("ℹ️ Mevcut hasta bilgileri bulunamadı (yeni profil)");
      }
      
      // Test hasta bilgileri oluştur
      const testPatientData = {
        userId: user.uid,
        name: "Test Hasta",
        email: user.email || "test@example.com",
        phone: "555-1234",
        address: "Test Adres",
        birthDate: "1990-01-01",
        bloodType: "A+",
        gender: "male" as const,
        emergencyContact: {
          name: "Test Acil",
          phone: "555-5678",
          relationship: "Aile"
        },
        medicalHistory: ["Test hastalık"],
        allergies: ["Test alerji"],
        currentMedications: ["Test ilaç"]
      };
      
      addResult("Test hasta bilgileri kaydediliyor...");
      const patientId = await savePatientInfo(testPatientData);
      addResult(`✅ Hasta bilgileri kaydedildi, ID: ${patientId}`);
      
      // Kaydedilen bilgileri tekrar getir
      const savedPatient = await getPatientInfo(user.uid);
      if (savedPatient) {
        addResult(`✅ Kaydedilen bilgiler doğrulandı: ${savedPatient.name}`);
      }
      
    } catch (error: any) {
      addResult(`❌ Hasta profil testi hatası: ${error.message}`);
      addResult(`Hata kodu: ${error.code}`);
      console.error("Hasta profil testi hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Firebase Test Sayfası</CardTitle>
            <CardDescription>
              Firebase bağlantısını ve hasta profil işlemlerini test edin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={testFirebaseConnection} 
                disabled={loading}
                variant="outline"
              >
                Firebase Bağlantısını Test Et
              </Button>
              <Button 
                onClick={testPatientProfile} 
                disabled={loading || !user}
                variant="outline"
              >
                Hasta Profil Testi
              </Button>
              <Button 
                onClick={clearResults} 
                variant="outline"
              >
                Sonuçları Temizle
              </Button>
            </div>

            {user ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  <strong>Giriş yapılmış:</strong> {user.email} (ID: {user.uid})
                </p>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">
                  <strong>Giriş yapılmamış</strong> - Hasta profil testi için giriş yapın
                </p>
              </div>
            )}

            <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
              <h3 className="font-semibold mb-2">Test Sonuçları:</h3>
              {testResults.length === 0 ? (
                <p className="text-gray-500">Henüz test yapılmadı</p>
              ) : (
                <div className="space-y-1">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FirebaseTest; 