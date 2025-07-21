import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPatientInfo } from "@/services/patientService";

const ProfileDebug = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  useEffect(() => {
    addDebugInfo("ProfileDebug sayfası yüklendi");
    addDebugInfo(`Auth Loading: ${authLoading}`);
    addDebugInfo(`User: ${user ? "Var" : "Yok"}`);
    if (user) {
      addDebugInfo(`User ID: ${user.uid}`);
      addDebugInfo(`User Email: ${user.email}`);
    }
    addDebugInfo(`User Profile: ${userProfile ? "Var" : "Yok"}`);
    if (userProfile) {
      addDebugInfo(`User Role: ${userProfile.role}`);
    }
  }, []);

  const testPatientInfo = async () => {
    if (!user) {
      addDebugInfo("❌ Kullanıcı giriş yapmamış");
      return;
    }

    setLoading(true);
    addDebugInfo("Hasta bilgileri test ediliyor...");
    
    try {
      const patient = await getPatientInfo(user.uid);
      setPatientInfo(patient);
      
      if (patient) {
        addDebugInfo(`✅ Hasta bilgileri bulundu: ${patient.name}`);
        addDebugInfo(`Email: ${patient.email}`);
        addDebugInfo(`Phone: ${patient.phone}`);
      } else {
        addDebugInfo("ℹ️ Hasta bilgileri bulunamadı (yeni profil)");
      }
    } catch (error: any) {
      addDebugInfo(`❌ Hasta bilgileri hatası: ${error.message}`);
      addDebugInfo(`Hata kodu: ${error.code}`);
      console.error("Hasta bilgileri hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearDebugInfo = () => {
    setDebugInfo([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>🔧 Profil Debug Sayfası</CardTitle>
            <CardDescription>
              Profil sayfası sorunlarını test edin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={testPatientInfo} 
                disabled={loading || !user}
                variant="outline"
              >
                Hasta Bilgilerini Test Et
              </Button>
              <Button 
                onClick={clearDebugInfo} 
                variant="outline"
              >
                Debug Loglarını Temizle
              </Button>
            </div>

            {/* Auth Status */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Auth Durumu:</h3>
              <div className="text-sm space-y-1">
                <div>Auth Loading: {authLoading ? "Evet" : "Hayır"}</div>
                <div>User: {user ? "Var" : "Yok"}</div>
                {user && <div>User ID: {user.uid}</div>}
                {user && <div>User Email: {user.email}</div>}
                <div>User Profile: {userProfile ? "Var" : "Yok"}</div>
                {userProfile && <div>Role: {userProfile.role}</div>}
              </div>
            </div>

            {/* Patient Info */}
            {patientInfo && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Hasta Bilgileri:</h3>
                <div className="text-sm space-y-1">
                  <div>Name: {patientInfo.name}</div>
                  <div>Email: {patientInfo.email}</div>
                  <div>Phone: {patientInfo.phone}</div>
                  <div>Address: {patientInfo.address}</div>
                  <div>Blood Type: {patientInfo.bloodType}</div>
                  <div>Gender: {patientInfo.gender}</div>
                </div>
              </div>
            )}

            {/* Debug Logs */}
            <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
              <h3 className="font-semibold mb-2">Debug Logları:</h3>
              {debugInfo.length === 0 ? (
                <p className="text-gray-500">Henüz log yok</p>
              ) : (
                <div className="space-y-1">
                  {debugInfo.map((log, index) => (
                    <div key={index} className="text-sm font-mono">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="text-center space-x-4">
              <Button
                variant="outline"
                onClick={() => window.location.href = "/patient/profile"}
              >
                Normal Profil Sayfası
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = "/login"}
              >
                Login Sayfası
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileDebug; 