import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LogOut, 
  User, 
  Calendar, 
  FileText, 
  Pill, 
  Activity, 
  Bell, 
  Clock,
  MapPin,
  Phone,
  Mail,
  Edit,
  Plus,
  Search,
  Filter,
  Settings,
  Trash2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  getPatientInfo, 
  getAppointments, 
  getPrescriptions, 
  getTestResults, 
  getNotifications,
  updateAppointment,
  deleteAppointment,
  type Appointment,
  type Prescription,
  type TestResult
} from "@/services/patientService";
import NewAppointmentModal from "@/components/NewAppointmentModal";
import PatientNavbar from "@/components/PatientNavbar";

// Interface'ler artık servis dosyasından import ediliyor

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);

  // URL'den aktif sayfayı belirle
  const getCurrentPage = () => {
    const path = window.location.pathname;
    if (path.includes("/patient/appointments")) return "appointments";
    if (path.includes("/patient/prescriptions")) return "prescriptions";
    if (path.includes("/patient/test-results")) return "test-results";
    if (path.includes("/patient/notifications")) return "notifications";
    return "dashboard";
  };

  // Verileri yükle
  useEffect(() => {
    if (user) {
      loadPatientData();
    }
  }, [user]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      
      console.log("🔄 Hasta verileri yükleniyor...");
      console.log("👤 Kullanıcı ID:", user!.uid);
      
      // Hasta bilgilerini getir
      const patient = await getPatientInfo(user!.uid);
      console.log("📋 Hasta bilgileri:", patient);
      setPatientInfo(patient);

      if (patient) {
        console.log("✅ Hasta bulundu, diğer veriler yükleniyor...");
        
        // Randevuları getir
        const appointmentsData = await getAppointments(patient.id!);
        console.log("📅 Randevular:", appointmentsData);
        setAppointments(appointmentsData);

        // Reçeteleri getir
        const prescriptionsData = await getPrescriptions(patient.id!);
        console.log("💊 Reçeteler:", prescriptionsData);
        setPrescriptions(prescriptionsData);

        // Test sonuçlarını getir
        const testResultsData = await getTestResults(patient.id!);
        console.log("🔬 Test sonuçları:", testResultsData);
        setTestResults(testResultsData);

        // Bildirimleri getir
        const notificationsData = await getNotifications(patient.id!);
        console.log("🔔 Bildirimler:", notificationsData);
        setNotifications(notificationsData);
      } else {
        console.error("❌ Hasta bilgileri bulunamadı");
        toast({
          title: "Hata",
          description: "Hasta bilgileri bulunamadı.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("❌ Veriler yüklenemedi:", error);
      console.error("🔍 Hata detayları:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      toast({
        title: "Hata",
        description: `Veriler yüklenirken hata oluştu: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentSuccess = () => {
    loadPatientData();
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      await deleteAppointment(appointmentId);
      toast({
        title: "Başarılı",
        description: "Randevu başarıyla silindi.",
      });
      loadPatientData();
    } catch (error) {
      console.error("Randevu silinemedi:", error);
      toast({
        title: "Hata",
        description: "Randevu silinirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Çıkış yapılırken hata:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "normal":
        return "bg-green-100 text-green-800";
      case "abnormal":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming":
        return "Yaklaşan";
      case "completed":
        return "Tamamlandı";
      case "cancelled":
        return "İptal Edildi";
      case "active":
        return "Aktif";
      case "normal":
        return "Normal";
      case "abnormal":
        return "Anormal";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Filtrelenmiş randevular
  const filteredAppointments = appointments.filter(appointment =>
    appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Yaklaşan randevu
  const nextAppointment = appointments
    .filter(a => a.status === "upcoming")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  // Aktif reçeteler
  const activePrescriptions = prescriptions.filter(p => p.status === "active");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <PatientNavbar currentPage={getCurrentPage()} />
      


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yaklaşan Randevu</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {nextAppointment ? (
                <>
                  <div className="text-2xl font-bold text-blue-600">
                    {new Date(nextAppointment.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} {nextAppointment.time}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {nextAppointment.doctor} ile
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-gray-400">-</div>
                  <p className="text-xs text-muted-foreground">
                    Yaklaşan randevu yok
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Reçeteler</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activePrescriptions.length}</div>
              <p className="text-xs text-muted-foreground">
                ilaç kullanımında
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Test Sonuçları</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{testResults.length}</div>
              <p className="text-xs text-muted-foreground">
                son test
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bildirimler</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{notifications.length}</div>
              <p className="text-xs text-muted-foreground">
                yeni bildirim
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="appointments">Randevular</TabsTrigger>
            <TabsTrigger value="prescriptions">Reçeteler</TabsTrigger>
            <TabsTrigger value="tests">Test Sonuçları</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Yaklaşan Randevular */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Yaklaşan Randevular
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointments.filter(a => a.status === "upcoming").map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div>
                          <p className="font-medium">{appointment.doctor}</p>
                          <p className="text-sm text-muted-foreground">{appointment.type}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{appointment.location}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{appointment.date}</p>
                          <p className="text-xs text-muted-foreground">{appointment.time}</p>
                          <Badge className={`mt-1 ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Aktif Reçeteler */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="w-5 h-5" />
                    Aktif Reçeteler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {prescriptions.filter(p => p.status === "active").map((prescription) => (
                      <div key={prescription.id} className="p-3 bg-green-50 rounded-lg">
                        <p className="font-medium">{prescription.medicine}</p>
                        <p className="text-sm text-muted-foreground">{prescription.dosage}</p>
                        <p className="text-xs text-muted-foreground mt-1">{prescription.instructions}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">Dr. {prescription.doctor}</span>
                          <Badge className={getStatusColor(prescription.status)}>
                            {getStatusText(prescription.status)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Son Test Sonuçları */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Son Test Sonuçları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {testResults.slice(0, 3).map((test) => (
                    <div key={test.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{test.testName}</p>
                        <Badge className={getStatusColor(test.status)}>
                          {getStatusText(test.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{test.date}</p>
                      <p className="text-sm text-muted-foreground">Dr. {test.doctor}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Randevularım</h2>
              <Button onClick={() => setShowNewAppointmentModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Yeni Randevu
              </Button>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Randevu ara..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtrele
              </Button>
            </div>

            <div className="space-y-4">
              {filteredAppointments.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Henüz randevunuz bulunmuyor.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{appointment.doctor}</h3>
                            <Badge className={getStatusColor(appointment.status)}>
                              {getStatusText(appointment.status)}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-2">{appointment.type}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(appointment.date).toLocaleDateString('tr-TR')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {appointment.time}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {appointment.location}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {appointment.status === "upcoming" && (
                            <>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteAppointment(appointment.id!)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm">
                            Detaylar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Reçetelerim</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prescriptions.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Henüz reçeteniz bulunmuyor.</p>
                  </CardContent>
                </Card>
              ) : (
                prescriptions.map((prescription) => (
                  <Card key={prescription.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{prescription.medicine}</CardTitle>
                        <Badge className={getStatusColor(prescription.status)}>
                          {getStatusText(prescription.status)}
                        </Badge>
                      </div>
                      <CardDescription>{prescription.dosage}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Talimatlar</Label>
                          <p className="text-sm text-muted-foreground">{prescription.instructions}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Yazan Doktor</Label>
                          <p className="text-sm text-muted-foreground">{prescription.doctor}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Tarih</Label>
                          <p className="text-sm text-muted-foreground">
                            {new Date(prescription.date).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        {prescription.quantity && (
                          <div>
                            <Label className="text-sm font-medium">Miktar</Label>
                            <p className="text-sm text-muted-foreground">{prescription.quantity}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Test Results Tab */}
          <TabsContent value="tests" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Test Sonuçlarım</h2>
            </div>

            <div className="space-y-4">
              {testResults.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Henüz test sonucunuz bulunmuyor.</p>
                  </CardContent>
                </Card>
              ) : (
                testResults.map((test) => (
                  <Card key={test.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{test.testName}</h3>
                            <Badge className={getStatusColor(test.status)}>
                              {getStatusText(test.status)}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-2">Sonuç: {test.result}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(test.date).toLocaleDateString('tr-TR')}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {test.doctor}
                            </div>
                          </div>
                          {test.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{test.notes}</p>
                          )}
                        </div>
                        <Button variant="outline">
                          Detayları Gör
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* New Appointment Modal */}
        {patientInfo && (
          <NewAppointmentModal
            isOpen={showNewAppointmentModal}
            onClose={() => setShowNewAppointmentModal(false)}
            patientId={patientInfo.id!}
            patientName={patientInfo.name || "Bilinmeyen Hasta"}
            onSuccess={handleAppointmentSuccess}
          />
        )}
      </main>
    </div>
  );
};

export default PatientDashboard; 