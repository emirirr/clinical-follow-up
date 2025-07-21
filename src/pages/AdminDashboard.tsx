import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  UserPlus, 
  Stethoscope, 
  Activity, 
  Settings, 
  LogOut,
  Plus,
  Search,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveUserProfile, type UserRole } from "@/services/userService";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface DoctorFormData {
  name: string;
  email: string;
  phone: string;
  department: string;
  specialty: string;
  password: string;
}

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [doctorForm, setDoctorForm] = useState<DoctorFormData>({
    name: "",
    email: "",
    phone: "",
    department: "",
    specialty: "",
    password: ""
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Çıkış yapılırken hata:", error);
    }
  };

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Doktor hesabını oluştur
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        doctorForm.email, 
        doctorForm.password
      );

      // Doktor profilini kaydet
      const doctorProfile = {
        userId: userCredential.user.uid,
        email: doctorForm.email,
        role: "doctor" as UserRole,
        name: doctorForm.name,
        phone: doctorForm.phone,
        department: doctorForm.department,
        specialty: doctorForm.specialty,
        status: "active" as const
      };

      await saveUserProfile(doctorProfile);

      toast({
        title: "Başarılı",
        description: "Doktor hesabı başarıyla oluşturuldu.",
      });

      // Formu temizle
      setDoctorForm({
        name: "",
        email: "",
        phone: "",
        department: "",
        specialty: "",
        password: ""
      });
      setShowDoctorForm(false);

    } catch (error: any) {
      console.error("Doktor kayıt hatası:", error);
      
      let errorMessage = "Doktor kaydı oluşturulurken hata oluştu.";
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Bu email adresi zaten kullanımda. Lütfen farklı bir email adresi kullanın.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Geçersiz email adresi. Lütfen doğru bir email adresi girin.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Şifre çok zayıf. Lütfen en az 6 karakterli güçlü bir şifre seçin.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Ağ bağlantısı sorunu. Lütfen internet bağlantınızı kontrol edin.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof DoctorFormData, value: string) => {
    setDoctorForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Paneli</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {user?.email}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış Yap
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Hasta</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">
                +20.1% geçen aydan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Doktor</CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +2 yeni doktor
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bu Ay Randevu</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">573</div>
              <p className="text-xs text-muted-foreground">
                +12% artış
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sistem Durumu</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Aktif</div>
              <p className="text-xs text-muted-foreground">
                Tüm sistemler çalışıyor
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Doktor Kayıt */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Doktor Kayıt
              </CardTitle>
              <CardDescription>
                Yeni doktor hesabı oluşturun
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={showDoctorForm} onOpenChange={setShowDoctorForm}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Doktor Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Yeni Doktor Kayıt</DialogTitle>
                    <DialogDescription>
                      Doktor bilgilerini girin ve hesap oluşturun
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleDoctorSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Ad Soyad</Label>
                        <Input
                          id="name"
                          value={doctorForm.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Doktor adı"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">E-posta</Label>
                        <Input
                          id="email"
                          type="email"
                          value={doctorForm.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="doktor@klinik.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Telefon</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={doctorForm.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="Telefon numarası"
                        />
                      </div>
                      <div>
                        <Label htmlFor="department">Bölüm</Label>
                        <Input
                          id="department"
                          value={doctorForm.department}
                          onChange={(e) => handleInputChange("department", e.target.value)}
                          placeholder="Bölüm adı"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="specialty">Uzmanlık Alanı</Label>
                      <Input
                        id="specialty"
                        value={doctorForm.specialty}
                        onChange={(e) => handleInputChange("specialty", e.target.value)}
                        placeholder="Uzmanlık alanı"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="password">Geçici Şifre</Label>
                      <Input
                        id="password"
                        type="password"
                        value={doctorForm.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        placeholder="Geçici şifre"
                        required
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" disabled={loading} className="flex-1">
                        {loading ? "Kaydediliyor..." : "Doktor Kaydet"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowDoctorForm(false)}
                      >
                        İptal
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Sistem Ayarları */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Sistem Ayarları
              </CardTitle>
              <CardDescription>
                Klinik sistem ayarlarını yönetin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Kullanıcı Yönetimi
              </Button>
              <Button variant="outline" className="w-full">
                Klinik Ayarları
              </Button>
              <Button variant="outline" className="w-full">
                Raporlar
              </Button>
              <Button variant="outline" className="w-full">
                Yedekleme
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard; 