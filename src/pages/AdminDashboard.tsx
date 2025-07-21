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
  Filter,
  Calendar,
  FileText,
  Bell
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveUserProfile, type UserRole } from "@/services/userService";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import AdminNavbar from "@/components/AdminNavbar";
import { getAdminStats, type AdminStats } from "@/services/adminService";

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
  const [statsLoading, setStatsLoading] = useState(true);
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    activeDoctors: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    monthlyGrowth: 0,
    patientGrowth: 0,
    doctorGrowth: 0,
    thisMonthAppointments: 0,
    thisMonthPatients: 0,
    thisMonthDoctors: 0,
    recentPatients: [],
    recentDoctors: [],
    recentAppointments: []
  });
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
    
    // Form validasyonu
    if (!doctorForm.name.trim()) {
      toast({
        title: "Hata",
        description: "Doktor adı gereklidir.",
        variant: "destructive",
      });
      return;
    }
    
    if (!doctorForm.email.trim()) {
      toast({
        title: "Hata",
        description: "Email adresi gereklidir.",
        variant: "destructive",
      });
      return;
    }
    
    if (!doctorForm.department.trim()) {
      toast({
        title: "Hata",
        description: "Bölüm seçimi gereklidir.",
        variant: "destructive",
      });
      return;
    }
    
    if (!doctorForm.specialty.trim()) {
      toast({
        title: "Hata",
        description: "Uzmanlık alanı gereklidir.",
        variant: "destructive",
      });
      return;
    }
    
    if (doctorForm.password.length < 6) {
      toast({
        title: "Hata",
        description: "Şifre en az 6 karakter olmalıdır.",
        variant: "destructive",
      });
      return;
    }
    
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
        description: `Dr. ${doctorForm.name} hesabı başarıyla oluşturuldu. Email: ${doctorForm.email}`,
      });

      // İstatistikleri yenile
      const adminStats = await getAdminStats();
      setStats(adminStats);

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

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    handleInputChange("password", password);
  };

  // İstatistikleri yükle
  useEffect(() => {
    const loadStats = async () => {
      try {
        setStatsLoading(true);
        const adminStats = await getAdminStats();
        setStats(adminStats);
      } catch (error) {
        console.error("İstatistikler yüklenirken hata:", error);
        toast({
          title: "Hata",
          description: "İstatistikler yüklenirken bir hata oluştu.",
          variant: "destructive",
        });
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, [toast]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <AdminNavbar currentPage="dashboard" />

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
              {statsLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.totalPatients.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Bu ay: +{stats.thisMonthPatients} yeni hasta
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Doktor</CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.activeDoctors}</div>
                  <p className="text-xs text-muted-foreground">
                    Bu ay: +{stats.thisMonthDoctors} yeni doktor
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bu Ay Randevu</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.thisMonthAppointments}</div>
                  <p className="text-xs text-muted-foreground">
                    Toplam: {stats.totalAppointments} randevu
                  </p>
                </>
              )}
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

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Son Hastalar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Son Kayıt Olan Hastalar
              </CardTitle>
              <CardDescription>
                Son 5 hasta kaydı
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : stats.recentPatients.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentPatients.map((patient: any) => (
                    <div key={patient.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <div>
                        <div className="font-medium text-sm">{patient.name}</div>
                        <div className="text-xs text-gray-500">{patient.email}</div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {patient.createdAt?.toDate?.() 
                          ? patient.createdAt.toDate().toLocaleDateString('tr-TR')
                          : new Date(patient.createdAt).toLocaleDateString('tr-TR')
                        }
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Henüz hasta kaydı yok</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Son Doktorlar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                Son Kayıt Olan Doktorlar
              </CardTitle>
              <CardDescription>
                Son 5 doktor kaydı
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : stats.recentDoctors.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentDoctors.map((doctor: any) => (
                    <div key={doctor.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <div>
                        <div className="font-medium text-sm">Dr. {doctor.name}</div>
                        <div className="text-xs text-gray-500">{doctor.department}</div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {doctor.createdAt?.toDate?.() 
                          ? doctor.createdAt.toDate().toLocaleDateString('tr-TR')
                          : new Date(doctor.createdAt).toLocaleDateString('tr-TR')
                        }
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Stethoscope className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Henüz doktor kaydı yok</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Son Randevular */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Son Randevular
              </CardTitle>
              <CardDescription>
                Son 5 randevu
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : stats.recentAppointments.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentAppointments.map((appointment: any) => (
                    <div key={appointment.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <div>
                        <div className="font-medium text-sm">{appointment.patientName}</div>
                        <div className="text-xs text-gray-500">{appointment.doctorName}</div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {appointment.date} {appointment.time}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Henüz randevu yok</p>
                </div>
              )}
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
                        <Select value={doctorForm.department} onValueChange={(value) => handleInputChange("department", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Bölüm seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Kardiyoloji">Kardiyoloji</SelectItem>
                            <SelectItem value="Nöroloji">Nöroloji</SelectItem>
                            <SelectItem value="Ortopedi">Ortopedi</SelectItem>
                            <SelectItem value="Dahiliye">Dahiliye</SelectItem>
                            <SelectItem value="Göz Hastalıkları">Göz Hastalıkları</SelectItem>
                            <SelectItem value="Kulak Burun Boğaz">Kulak Burun Boğaz</SelectItem>
                            <SelectItem value="Dermatoloji">Dermatoloji</SelectItem>
                            <SelectItem value="Psikiyatri">Psikiyatri</SelectItem>
                            <SelectItem value="Çocuk Sağlığı">Çocuk Sağlığı</SelectItem>
                            <SelectItem value="Kadın Doğum">Kadın Doğum</SelectItem>
                            <SelectItem value="Genel Cerrahi">Genel Cerrahi</SelectItem>
                            <SelectItem value="Üroloji">Üroloji</SelectItem>
                            <SelectItem value="Diğer">Diğer</SelectItem>
                          </SelectContent>
                        </Select>
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
                      <div className="flex gap-2">
                        <Input
                          id="password"
                          type="password"
                          value={doctorForm.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          placeholder="En az 6 karakter"
                          minLength={6}
                          required
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={generatePassword}
                          className="whitespace-nowrap"
                        >
                          Otomatik Oluştur
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Doktor ilk girişte şifresini değiştirecek
                      </p>
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