import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";

const LoginDebug = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const { signIn, user, userProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setDebugInfo([]);

    addDebugInfo("Login işlemi başlatılıyor...");
    addDebugInfo(`Email: ${email}`);
    addDebugInfo(`Password: ${password ? "***" : "boş"}`);

    try {
      addDebugInfo("signIn fonksiyonu çağrılıyor...");
      await signIn(email, password);
      addDebugInfo("✅ signIn başarılı!");
      
      // Kısa bir süre bekleyip kullanıcı durumunu kontrol et
      setTimeout(() => {
        addDebugInfo(`Kullanıcı durumu: ${user ? "Giriş yapılmış" : "Giriş yapılmamış"}`);
        addDebugInfo(`User ID: ${user?.uid || "Yok"}`);
        addDebugInfo(`User Email: ${user?.email || "Yok"}`);
        addDebugInfo(`User Profile: ${userProfile ? "Var" : "Yok"}`);
        if (userProfile) {
          addDebugInfo(`User Role: ${userProfile.role}`);
        }
      }, 1000);

      navigate("/dashboard");
    } catch (error: any) {
      addDebugInfo(`❌ Login hatası: ${error.message}`);
      addDebugInfo(`Hata kodu: ${error.code}`);
      
      console.error("Giriş hatası:", error);
      
      if (error.code === "auth/user-not-found") {
        setError("Bu email adresi ile kayıtlı kullanıcı bulunamadı. Lütfen kayıt olun.");
      } else if (error.code === "auth/wrong-password") {
        setError("Yanlış şifre. Lütfen şifrenizi kontrol edin.");
      } else if (error.code === "auth/invalid-email") {
        setError("Geçersiz email adresi. Lütfen doğru bir email adresi girin.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Çok fazla başarısız giriş denemesi. Lütfen bir süre bekleyin.");
      } else if (error.code === "auth/network-request-failed") {
        setError("Ağ bağlantısı sorunu. Lütfen internet bağlantınızı kontrol edin.");
      } else {
        setError(error.message || "Giriş yapılırken bir hata oluştu");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              🔧 Login Debug Sayfası
            </CardTitle>
            <CardDescription className="text-center">
              Login işlemini detaylı olarak test edin
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Debug Info */}
            <div className="mb-6 p-4 bg-gray-100 rounded-lg max-h-40 overflow-y-auto">
              <h3 className="font-semibold mb-2">Debug Bilgileri:</h3>
              <div className="text-sm space-y-1">
                <div>Auth Loading: {authLoading ? "Evet" : "Hayır"}</div>
                <div>User: {user ? "Var" : "Yok"}</div>
                <div>User Profile: {userProfile ? "Var" : "Yok"}</div>
                {userProfile && <div>Role: {userProfile.role}</div>}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Şifrenizi girin"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>

            {/* Debug Logs */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Debug Logları:</h3>
              <div className="bg-gray-100 p-4 rounded-lg max-h-60 overflow-y-auto">
                {debugInfo.length === 0 ? (
                  <p className="text-gray-500">Henüz log yok</p>
                ) : (
                  <div className="space-y-1 text-sm">
                    {debugInfo.map((log, index) => (
                      <div key={index} className="font-mono">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Test hesabı: test@example.com / 123456
              </p>
              <div className="mt-2 space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEmail("test@example.com");
                    setPassword("123456");
                  }}
                >
                  Test Hesabını Doldur
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/login")}
                >
                  Normal Login Sayfası
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginDebug; 