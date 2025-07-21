import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { RoleCard } from "@/components/RoleCard";
import { PatientCard } from "@/components/PatientCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  UserCheck, 
  Stethoscope, 
  Shield, 
  Calendar, 
  Users, 
  Activity, 
  Bell, 
  FileText, 
  LogIn, 
  UserPlus,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  X,
  BarChart3,
  Settings,
  UserPlus as UserPlusIcon,
  FileText as FileTextIcon,
  Pill,
  Eye
} from "lucide-react";
import medicalHero from "@/assets/medical-hero.jpg";
import { getRedirectUrlByRole } from "@/services/userService";

type UserRole = "admin" | "doctor" | "patient" | null;

const Index = () => {
  const { user, userProfile, loading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [showDemo, setShowDemo] = useState(false);
  const [demoRole, setDemoRole] = useState<UserRole>(null);
  const navigate = useNavigate();

  // Giriş yapmış kullanıcıyı doğru panele yönlendir
  useEffect(() => {
    if (!loading && user && userProfile) {
      const redirectUrl = getRedirectUrlByRole(userProfile.role);
      navigate(redirectUrl);
    }
  }, [user, userProfile, loading, navigate]);

  const handleDemo = (role: UserRole) => {
    setDemoRole(role);
    setShowDemo(true);
  };

  const closeDemo = () => {
    setShowDemo(false);
    setDemoRole(null);
  };

  // Giriş yapmamış kullanıcılar için ana sayfa içeriği
  if (user && !userProfile && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Profil Tamamlanıyor...</h2>
          <p className="text-muted-foreground mb-4">
            Kullanıcı profiliniz yükleniyor, lütfen bekleyin.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (selectedRole === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Stethoscope className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Klinik Takip</span>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={() => navigate("/login")}>
                  Giriş Yap
                </Button>
                <Button onClick={() => navigate("/register")}>
                  Kayıt Ol
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${medicalHero})` }}
          />
          <div className="relative container mx-auto px-4 py-24">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">
                🏥 Modern Sağlık Teknolojisi
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
                Klinik Takip
                <span className="block text-blue-600">Sistemi</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Doktorlar, hastalar ve yöneticiler için özel olarak tasarlanmış kapsamlı sağlık yönetim platformu. 
                Randevu takibi, hasta kayıtları ve raporlama işlemlerinizi kolaylaştırın.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate("/register")}
                  size="lg"
                  className="px-8 py-4 text-lg"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Hemen Başlayın
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate("/login")}
                  size="lg"
                  className="px-8 py-4 text-lg"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Giriş Yapın
                </Button>
              </div>
            </div>

            {/* Features Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Akıllı Randevu Yönetimi</h3>
                  <p className="text-gray-600 mb-4">
                    Doktor ve hasta uygunluklarına göre otomatik randevu planlama, 
                    hatırlatmalar ve takip sistemi.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      Online randevu alma
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      Otomatik hatırlatmalar
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      Takvim entegrasyonu
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Kapsamlı Hasta Takibi</h3>
                  <p className="text-gray-600 mb-4">
                    Hasta geçmişi, reçeteler, test sonuçları ve tedavi planları 
                    tek bir platformda.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      Dijital hasta dosyası
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      Reçete yönetimi
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      Test sonuçları
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Gelişmiş Raporlama</h3>
                  <p className="text-gray-600 mb-4">
                    Detaylı analizler, performans raporları ve istatistikler 
                    ile klinik verimliliğinizi artırın.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      Gerçek zamanlı istatistikler
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      Performans analizleri
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      Özelleştirilebilir raporlar
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Role Selection */}
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Kullanıcı Panelleri</h2>
              <p className="text-gray-600 mb-8">Her kullanıcı tipi için özel olarak tasarlanmış paneller</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <RoleCard
                title="Admin Paneli"
                description="Sistem yönetimi ve genel kontrolör"
                icon={Shield}
                features={[
                  "Kullanıcı yönetimi",
                  "Sistem ayarları",
                  "Raporlar ve istatistikler",
                  "Klinik konfigürasyonu"
                ]}
                onSelect={() => setSelectedRole("admin")}
                gradient="bg-gradient-to-br from-red-500 to-red-600"
              />
              <RoleCard
                title="Doktor Paneli"
                description="Hasta takibi ve randevu yönetimi"
                icon={Stethoscope}
                features={[
                  "Hasta listesi",
                  "Randevu yönetimi",
                  "Reçete yazma",
                  "Hasta geçmişi"
                ]}
                onSelect={() => setSelectedRole("doctor")}
                gradient="bg-gradient-to-br from-blue-500 to-blue-600"
              />
              <RoleCard
                title="Hasta Paneli"
                description="Kişisel sağlık bilgileri ve randevular"
                icon={UserCheck}
                features={[
                  "Randevu alma",
                  "Reçete görüntüleme",
                  "Test sonuçları",
                  "Profil yönetimi"
                ]}
                onSelect={() => setSelectedRole("patient")}
                gradient="bg-gradient-to-br from-green-500 to-green-600"
              />
            </div>

            {/* Demo Buttons */}
            <div className="text-center mt-12">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Demo Panelleri</h3>
              <p className="text-gray-600 mb-8">Sistemi test etmeden önce demo panellerini inceleyin</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline"
                  onClick={() => handleDemo("admin")}
                  className="px-6 py-3"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Demo
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleDemo("doctor")}
                  className="px-6 py-3"
                >
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Doktor Demo
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleDemo("patient")}
                  className="px-6 py-3"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Hasta Demo
                </Button>
              </div>
            </div>

            {/* Contact Section */}
            <div className="mt-20 text-center">
              <h2 className="text-2xl font-bold mb-8 text-gray-900">İletişim</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="flex items-center justify-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-600">0543 447 6245</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-600">info@tiryakiyazilim.com</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-600">İstanbul, Türkiye</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Modal */}
        <Dialog open={showDemo} onOpenChange={setShowDemo}>
          <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                {demoRole === "admin" ? <Shield className="h-5 w-5" /> :
                 demoRole === "doctor" ? <Stethoscope className="h-5 w-5" /> :
                 <UserCheck className="h-5 w-5" />}
                <span>
                  {demoRole === "admin" ? "Admin Paneli" :
                   demoRole === "doctor" ? "Doktor Paneli" :
                   "Hasta Paneli"} Demo
                </span>
              </DialogTitle>
              <DialogDescription>
                {demoRole === "admin" ? "Sistem yönetimi ve genel kontrolör paneli" :
                 demoRole === "doctor" ? "Hasta takibi ve randevu yönetimi paneli" :
                 "Kişisel sağlık bilgileri ve randevular paneli"}
              </DialogDescription>
            </DialogHeader>
            
            {demoRole && (
              <div className="space-y-6">
                {/* Header Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {demoRole === "admin" && (
                    <>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Users className="h-8 w-8 text-blue-600" />
                            <div>
                              <p className="text-2xl font-bold">1,247</p>
                              <p className="text-sm text-gray-500">Toplam Hasta</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Stethoscope className="h-8 w-8 text-green-600" />
                            <div>
                              <p className="text-2xl font-bold">12</p>
                              <p className="text-sm text-gray-500">Aktif Doktor</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-8 w-8 text-purple-600" />
                            <div>
                              <p className="text-2xl font-bold">573</p>
                              <p className="text-sm text-gray-500">Bu Ay Randevu</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="h-8 w-8 text-orange-600" />
                            <div>
                              <p className="text-2xl font-bold">₺45,231</p>
                              <p className="text-sm text-gray-500">Aylık Gelir</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                  
                  {demoRole === "doctor" && (
                    <>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-8 w-8 text-blue-600" />
                            <div>
                              <p className="text-2xl font-bold">8</p>
                              <p className="text-sm text-gray-500">Bugün Randevu</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Users className="h-8 w-8 text-green-600" />
                            <div>
                              <p className="text-2xl font-bold">32</p>
                              <p className="text-sm text-gray-500">Bu Hafta Hasta</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <FileTextIcon className="h-8 w-8 text-purple-600" />
                            <div>
                              <p className="text-2xl font-bold">5</p>
                              <p className="text-sm text-gray-500">Bekleyen Rapor</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Pill className="h-8 w-8 text-orange-600" />
                            <div>
                              <p className="text-2xl font-bold">12</p>
                              <p className="text-sm text-gray-500">Aktif Reçete</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                  
                  {demoRole === "patient" && (
                    <>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-8 w-8 text-blue-600" />
                            <div>
                              <p className="text-2xl font-bold">25 Ara</p>
                              <p className="text-sm text-gray-500">Sonraki Randevu</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Pill className="h-8 w-8 text-green-600" />
                            <div>
                              <p className="text-2xl font-bold">2</p>
                              <p className="text-sm text-gray-500">Aktif Reçete</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <FileTextIcon className="h-8 w-8 text-purple-600" />
                            <div>
                              <p className="text-2xl font-bold">Normal</p>
                              <p className="text-sm text-gray-500">Test Sonucu</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Bell className="h-8 w-8 text-orange-600" />
                            <div>
                              <p className="text-2xl font-bold">3</p>
                              <p className="text-sm text-gray-500">Yeni Bildirim</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Activity className="h-5 w-5" />
                        <span>Son Aktiviteler</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {demoRole === "admin" && (
                          <>
                            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                              <UserPlusIcon className="h-4 w-4 text-blue-600" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">Yeni hasta kaydı</p>
                                <p className="text-xs text-gray-500">2 saat önce</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                              <Calendar className="h-4 w-4 text-green-600" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">Dr. Özkan randevu oluşturdu</p>
                                <p className="text-xs text-gray-500">10 dakika önce</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                              <FileTextIcon className="h-4 w-4 text-purple-600" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">Reçete oluşturuldu</p>
                                <p className="text-xs text-gray-500">1 saat önce</p>
                              </div>
                            </div>
                          </>
                        )}
                        
                        {demoRole === "doctor" && (
                          <>
                            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                              <Users className="h-4 w-4 text-blue-600" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">Ayşe Yılmaz randevusu</p>
                                <p className="text-xs text-gray-500">14:30 - Bugün</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                              <FileTextIcon className="h-4 w-4 text-green-600" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">Reçete yazıldı</p>
                                <p className="text-xs text-gray-500">Mehmet Kaya için</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                              <Pill className="h-4 w-4 text-purple-600" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">Test sonucu hazır</p>
                                <p className="text-xs text-gray-500">Fatma Öz - Kan tahlili</p>
                              </div>
                            </div>
                          </>
                        )}
                        
                        {demoRole === "patient" && (
                          <>
                            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">Randevu onaylandı</p>
                                <p className="text-xs text-gray-500">Dr. Özkan - 25 Ara 14:30</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                              <Pill className="h-4 w-4 text-green-600" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">Yeni reçete</p>
                                <p className="text-xs text-gray-500">Aspirin 100mg - Dr. Özkan</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                              <FileTextIcon className="h-4 w-4 text-purple-600" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">Test sonucu hazır</p>
                                <p className="text-xs text-gray-500">Kan tahlili - Normal</p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Settings className="h-5 w-5" />
                        <span>Hızlı İşlemler</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {demoRole === "admin" && (
                          <>
                            <Button variant="outline" className="h-12">
                              <Users className="h-4 w-4 mr-2" />
                              Hasta Yönetimi
                            </Button>
                            <Button variant="outline" className="h-12">
                              <Stethoscope className="h-4 w-4 mr-2" />
                              Doktor Yönetimi
                            </Button>
                            <Button variant="outline" className="h-12">
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Raporlar
                            </Button>
                            <Button variant="outline" className="h-12">
                              <Settings className="h-4 w-4 mr-2" />
                              Sistem Ayarları
                            </Button>
                          </>
                        )}
                        
                        {demoRole === "doctor" && (
                          <>
                            <Button variant="outline" className="h-12">
                              <Calendar className="h-4 w-4 mr-2" />
                              Randevularım
                            </Button>
                            <Button variant="outline" className="h-12">
                              <Users className="h-4 w-4 mr-2" />
                              Hastalarım
                            </Button>
                            <Button variant="outline" className="h-12">
                              <Pill className="h-4 w-4 mr-2" />
                              Reçetelerim
                            </Button>
                            <Button variant="outline" className="h-12">
                              <FileTextIcon className="h-4 w-4 mr-2" />
                              Raporlarım
                            </Button>
                          </>
                        )}
                        
                        {demoRole === "patient" && (
                          <>
                            <Button variant="outline" className="h-12">
                              <Calendar className="h-4 w-4 mr-2" />
                              Randevularım
                            </Button>
                            <Button variant="outline" className="h-12">
                              <Pill className="h-4 w-4 mr-2" />
                              Reçetelerim
                            </Button>
                            <Button variant="outline" className="h-12">
                              <FileTextIcon className="h-4 w-4 mr-2" />
                              Test Sonuçları
                            </Button>
                            <Button variant="outline" className="h-12">
                              <UserCheck className="h-4 w-4 mr-2" />
                              Profilim
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Demo Info */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Eye className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Demo Modu</p>
                        <p className="text-xs text-blue-700">
                          Bu bir demo görünümüdür. Gerçek sistemi denemek için giriş yapın.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={closeDemo}>
                <X className="h-4 w-4 mr-2" />
                Kapat
              </Button>
              <Button onClick={() => navigate("/register")}>
                <UserPlus className="h-4 w-4 mr-2" />
                Gerçek Hesap Oluştur
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Role Selection for Login
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-primary">Klinik Takip</h1>
            <span className="text-muted-foreground">|</span>
            <span className="capitalize font-medium">
              {selectedRole === "admin" ? "Admin" : 
               selectedRole === "doctor" ? "Doktor" : "Hasta"} Paneli
            </span>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setSelectedRole(null)}
          >
            Ana Sayfaya Dön
          </Button>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            {selectedRole === "admin" ? "Admin Paneli" : 
             selectedRole === "doctor" ? "Doktor Paneli" : "Hasta Paneli"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {selectedRole === "admin" ? "Sistem yönetimi ve genel kontrolör" : 
             selectedRole === "doctor" ? "Hasta takibi ve randevu yönetimi" : 
             "Kişisel sağlık bilgileri ve randevular"}
          </p>
          
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    {selectedRole === "admin" ? <Shield className="w-8 h-8 text-primary" /> :
                     selectedRole === "doctor" ? <Stethoscope className="w-8 h-8 text-primary" /> :
                     <UserCheck className="w-8 h-8 text-primary" />}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {selectedRole === "admin" ? "Admin Girişi" : 
                     selectedRole === "doctor" ? "Doktor Girişi" : "Hasta Girişi"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {selectedRole === "admin" ? "Sistem yönetimi için giriş yapın" : 
                     selectedRole === "doctor" ? "Hasta takibi için giriş yapın" : 
                     "Kişisel bilgileriniz için giriş yapın"}
                  </p>
                  <Button 
                    onClick={() => navigate("/login")}
                    className="w-full"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Giriş Yap
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
