import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Users, 
  Stethoscope, 
  Calendar, 
  Activity,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  FileText,
  PieChart,
  LineChart,
  RefreshCw
} from "lucide-react";
import AdminNavbar from "@/components/AdminNavbar";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db, testFirebaseConnection } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface ReportData {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  upcomingAppointments: number;
  monthlyGrowth: number;
  patientGrowth: number;
  doctorGrowth: number;
  appointmentGrowth: number;
}

interface DepartmentPerformance {
  name: string;
  performance: number;
  appointmentCount: number;
}

interface TopDoctor {
  name: string;
  appointmentCount: number;
  department: string;
}

interface MonthlyTrend {
  month: string;
  growth: number;
  appointments: number;
}

  const AdminReports = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData>({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    upcomingAppointments: 0,
    monthlyGrowth: 0,
    patientGrowth: 0,
    doctorGrowth: 0,
    appointmentGrowth: 0
  });
  const [departmentPerformance, setDepartmentPerformance] = useState<DepartmentPerformance[]>([]);
  const [topDoctors, setTopDoctors] = useState<TopDoctor[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);

  // Firebase'den rapor verilerini yükle
  const loadReportData = async () => {
    try {
      setLoading(true);
      
      console.log("Firebase'den rapor verileri yükleniyor...");
      
      // Kullanıcıları yükle (hasta ve doktor sayıları için)
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);
      
      const patients = usersSnapshot.docs.filter(doc => doc.data().role === "patient");
      const doctors = usersSnapshot.docs.filter(doc => doc.data().role === "doctor");
      
      // Randevuları yükle
      const appointmentsRef = collection(db, "appointments");
      const appointmentsSnapshot = await getDocs(appointmentsRef);
      
      const appointments = appointmentsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          date: data.date || "",
          status: data.status || "upcoming",
          doctorId: data.doctorId || "",
          patientId: data.patientId || "",
          patientName: data.patientName || "",
          doctorName: data.doctorName || "",
          type: data.type || "",
          location: data.location || "",
          notes: data.notes || "",
          createdAt: data.createdAt || new Date()
        };
      });
      
      // Bu ayki randevuları filtrele
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const thisMonthAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate.getMonth() === currentMonth && 
               appointmentDate.getFullYear() === currentYear;
      });
      
      // Geçen ayki randevuları filtrele
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      const lastMonthAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate.getMonth() === lastMonth && 
               appointmentDate.getFullYear() === lastMonthYear;
      });
      
      // Randevu durumlarını hesapla
      const completedAppointments = thisMonthAppointments.filter(a => a.status === "completed").length;
      const cancelledAppointments = thisMonthAppointments.filter(a => a.status === "cancelled").length;
      const upcomingAppointments = thisMonthAppointments.filter(a => a.status === "upcoming").length;
      
      // Büyüme hesaplamaları
      const patientGrowth = patients.length > 0 ? ((patients.length - 100) / 100) * 100 : 0;
      const doctorGrowth = doctors.length > 0 ? ((doctors.length - 8) / 8) * 100 : 0;
      const appointmentGrowth = lastMonthAppointments.length > 0 ? 
        ((thisMonthAppointments.length - lastMonthAppointments.length) / lastMonthAppointments.length) * 100 : 0;
      
      // Bölüm performansını hesapla
      const departmentStats = doctors.reduce((acc: any, doctor) => {
        const department = doctor.data().department || "Bilinmeyen";
        const doctorAppointments = thisMonthAppointments.filter(a => a.doctorId === doctor.id);
        const completedCount = doctorAppointments.filter(a => a.status === "completed").length;
        const totalCount = doctorAppointments.length;
        const performance = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
        
        if (!acc[department]) {
          acc[department] = { count: 0, completed: 0 };
        }
        acc[department].count += totalCount;
        acc[department].completed += completedCount;
        
        return acc;
      }, {});
      
      const departmentPerformanceData = Object.entries(departmentStats).map(([name, stats]: [string, any]) => ({
        name,
        performance: stats.count > 0 ? (stats.completed / stats.count) * 100 : 0,
        appointmentCount: stats.count
      }));
      
      // En aktif doktorları hesapla
      const doctorStats = doctors.map(doctor => {
        const doctorAppointments = thisMonthAppointments.filter(a => a.doctorId === doctor.id);
        return {
          name: doctor.data().name,
          appointmentCount: doctorAppointments.length,
          department: doctor.data().department || "Bilinmeyen"
        };
      }).sort((a, b) => b.appointmentCount - a.appointmentCount).slice(0, 4);
      
      // Aylık trendleri hesapla (son 4 ay)
      const monthlyTrendsData = [];
      for (let i = 3; i >= 0; i--) {
        const month = new Date(currentYear, currentMonth - i, 1);
        const monthAppointments = appointments.filter(appointment => {
          const appointmentDate = new Date(appointment.date);
          return appointmentDate.getMonth() === month.getMonth() && 
                 appointmentDate.getFullYear() === month.getFullYear();
        });
        
        const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", 
                           "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
        
        monthlyTrendsData.push({
          month: monthNames[month.getMonth()],
          appointments: monthAppointments.length,
          growth: i === 3 ? 0 : ((monthAppointments.length - 10) / 10) * 100
        });
      }
      
      // Rapor verilerini güncelle
      const newReportData: ReportData = {
        totalPatients: patients.length,
        totalDoctors: doctors.length,
        totalAppointments: thisMonthAppointments.length,
        completedAppointments,
        cancelledAppointments,
        upcomingAppointments,
        monthlyGrowth: appointmentGrowth,
        patientGrowth,
        doctorGrowth,
        appointmentGrowth
      };
      
      console.log("Rapor verileri:", newReportData);
      console.log("Bölüm performansı:", departmentPerformanceData);
      console.log("En aktif doktorlar:", doctorStats);
      console.log("Aylık trendler:", monthlyTrendsData);
      
      setReportData(newReportData);
      setDepartmentPerformance(departmentPerformanceData);
      setTopDoctors(doctorStats);
      setMonthlyTrends(monthlyTrendsData);
      
      toast({
        title: "Başarılı",
        description: "Rapor verileri başarıyla yüklendi.",
      });
      
    } catch (error) {
      console.error("Rapor verileri yüklenirken hata:", error);
      toast({
        title: "Hata",
        description: "Rapor verileri yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <AdminNavbar currentPage="reports" />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Raporlar & Analitik</h1>
            <p className="text-gray-600">Klinik performansı ve istatistikler</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={async () => {
                // Firebase bağlantı testi
                try {
                  console.log("Firebase bağlantısı test ediliyor...");
                  const result = await testFirebaseConnection();
                  
                  if (result.success) {
                    toast({
                      title: "✅ Bağlantı Başarılı",
                      description: `Kullanıcı: ${result.users}, Randevu: ${result.appointments}`,
                    });
                  } else {
                    toast({
                      title: "❌ Bağlantı Hatası",
                      description: result.message,
                      variant: "destructive",
                    });
                  }
                } catch (error) {
                  console.error("Bağlantı testi hatası:", error);
                  toast({
                    title: "❌ Test Hatası",
                    description: "Firebase bağlantısı test edilemedi.",
                    variant: "destructive",
                  });
                }
              }}
            >
              Firebase Test
            </Button>
            <Button 
              variant="outline" 
              onClick={loadReportData}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                toast({
                  title: "Bilgi",
                  description: "PDF indirme özelliği yakında eklenecek.",
                });
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              PDF İndir
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                toast({
                  title: "Bilgi",
                  description: "Excel indirme özelliği yakında eklenecek.",
                });
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Excel İndir
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Hasta</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.totalPatients.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {reportData.patientGrowth > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                {Math.abs(Math.round(reportData.patientGrowth))}% geçen aydan
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Doktor</CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.totalDoctors}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {reportData.doctorGrowth > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                {Math.abs(Math.round(reportData.doctorGrowth))}% geçen aydan
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bu Ay Randevu</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.totalAppointments}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {reportData.appointmentGrowth > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                {Math.abs(Math.round(reportData.appointmentGrowth))}% geçen aydan
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{reportData.completedAppointments}</div>
              <div className="text-xs text-muted-foreground">
                %{Math.round((reportData.completedAppointments / reportData.totalAppointments) * 100)} başarı oranı
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Appointment Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Randevu Durumu
              </CardTitle>
              <CardDescription>
                Bu ayki randevuların durum dağılımı
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Tamamlanan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{reportData.completedAppointments}</span>
                    <Badge variant="secondary">
                      %{Math.round((reportData.completedAppointments / reportData.totalAppointments) * 100)}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Yaklaşan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{reportData.upcomingAppointments}</span>
                    <Badge variant="secondary">
                      %{reportData.totalAppointments > 0 ? Math.round((reportData.upcomingAppointments / reportData.totalAppointments) * 100) : 0}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">İptal Edilen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{reportData.cancelledAppointments}</span>
                    <Badge variant="secondary">
                      %{Math.round((reportData.cancelledAppointments / reportData.totalAppointments) * 100)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Büyüme Trendi
              </CardTitle>
              <CardDescription>
                Son 6 ayın büyüme analizi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Hasta Büyümesi</span>
                  <div className="flex items-center gap-2">
                    {reportData.patientGrowth > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`font-medium ${reportData.patientGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {reportData.patientGrowth > 0 ? "+" : ""}{Math.round(reportData.patientGrowth)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Doktor Büyümesi</span>
                  <div className="flex items-center gap-2">
                    {reportData.doctorGrowth > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`font-medium ${reportData.doctorGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {reportData.doctorGrowth > 0 ? "+" : ""}{Math.round(reportData.doctorGrowth)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Randevu Büyümesi</span>
                  <div className="flex items-center gap-2">
                    {reportData.appointmentGrowth > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`font-medium ${reportData.appointmentGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {reportData.appointmentGrowth > 0 ? "+" : ""}{Math.round(reportData.appointmentGrowth)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Department Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Bölüm Performansı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {departmentPerformance.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">Henüz bölüm verisi bulunmuyor</p>
                  </div>
                ) : (
                  departmentPerformance.map((dept, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{dept.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {Math.round(dept.performance)}%
                        </Badge>
                        <span className="text-xs text-gray-500">
                          ({dept.appointmentCount} randevu)
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Doctors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                En Aktif Doktorlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topDoctors.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">Henüz doktor verisi bulunmuyor</p>
                  </div>
                ) : (
                  topDoctors.map((doctor, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{doctor.name}</span>
                        <span className="text-xs text-gray-500">{doctor.department}</span>
                      </div>
                      <Badge variant="secondary">{doctor.appointmentCount} randevu</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Aylık Trendler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {monthlyTrends.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">Henüz trend verisi bulunmuyor</p>
                  </div>
                ) : (
                  monthlyTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{trend.month}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {trend.growth > 0 ? "+" : ""}{Math.round(trend.growth)}%
                        </Badge>
                        <span className="text-xs text-gray-500">
                          ({trend.appointments} randevu)
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminReports; 