import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SimpleTest = () => {
  const [results, setResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testFirebaseImport = () => {
    addResult("Firebase import test ediliyor...");
    
    try {
      // Firebase modüllerini import et
      const { initializeApp } = require("firebase/app");
      const { getFirestore } = require("firebase/firestore");
      
      addResult("✅ Firebase modülleri başarıyla import edildi");
      
      // Konfigürasyonu test et
      const config = {
        apiKey: "AIzaSyBALwj-lCresjKXSI2JJvJ_-WHRjkYP1pQ",
        authDomain: "kliniktakip-95901.firebaseapp.com",
        projectId: "kliniktakip-95901",
        storageBucket: "kliniktakip-95901.firebasestorage.app",
        messagingSenderId: "1091367979212",
        appId: "1:1091367979212:web:d02d7850787b881ca89a69",
        measurementId: "G-3FCFDR1LR8"
      };
      
      addResult("✅ Konfigürasyon objesi oluşturuldu");
      
      // App'i başlat
      const app = initializeApp(config);
      addResult("✅ Firebase app başlatıldı");
      
      // Firestore'u başlat
      const db = getFirestore(app);
      addResult("✅ Firestore başlatıldı");
      
      addResult("🎉 Firebase başarıyla başlatıldı!");
      
    } catch (error: any) {
      addResult(`❌ Hata: ${error.message}`);
      console.error("Firebase test hatası:", error);
    }
  };

  const testNetworkConnection = async () => {
    addResult("Ağ bağlantısı test ediliyor...");
    
    try {
      const response = await fetch("https://www.google.com");
      if (response.ok) {
        addResult("✅ İnternet bağlantısı var");
      } else {
        addResult("❌ İnternet bağlantısı sorunu");
      }
    } catch (error) {
      addResult("❌ İnternet bağlantısı yok");
    }
  };

  const testFirebaseProject = async () => {
    addResult("Firebase projesi test ediliyor...");
    
    try {
      const response = await fetch("https://kliniktakip-95901.firebaseapp.com");
      if (response.ok) {
        addResult("✅ Firebase projesi erişilebilir");
      } else {
        addResult("⚠️ Firebase projesi yanıt vermiyor");
      }
    } catch (error) {
      addResult("❌ Firebase projesine erişilemiyor");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basit Firebase Test</CardTitle>
            <CardDescription>
              Firebase bağlantısını adım adım test edin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <Button onClick={testNetworkConnection}>
                İnternet Bağlantısı Test Et
              </Button>
              <Button onClick={testFirebaseProject}>
                Firebase Projesi Test Et
              </Button>
              <Button onClick={testFirebaseImport}>
                Firebase Import Test Et
              </Button>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Test Sonuçları:</h3>
              <div className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-y-auto">
                {results.length === 0 ? (
                  <p className="text-gray-500">Henüz test yapılmadı</p>
                ) : (
                  <div className="space-y-1">
                    {results.map((result, index) => (
                      <div key={index} className="text-sm font-mono">
                        {result}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimpleTest; 