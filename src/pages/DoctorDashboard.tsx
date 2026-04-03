import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Stethoscope, 
  Calendar, 
  Users, 
  FileText, 
  Activity, 
  Clock,
  MapPin,
  Phone,
  Mail,
  Settings,
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import DoctorNavbar from "@/components/DoctorNavbar";
import {
  getDoctorRecordForAuthUid,
  getDoctorStats,
  getRecentAppointmentsForDoctor,
} from "@/services/doctorService";

interface DoctorStats {
  totalPatients: number;
  totalAppointments: number;
  completedAppointments: number;
  upcomingAppointments: number;
  cancelledAppointments: number;
  totalPrescriptions: number;
}

interface RecentAppointment {
  id: string;
  patientName: string;
  date: string;
  time: string;
  status: string;
  type: string;
  location: string;
}

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  const [stats, setStats] = useState<DoctorStats>({
    totalPatients: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    upcomingAppointments: 0,
    cancelledAppointments: 0,
    totalPrescriptions: 0
  });
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([]);

  // Verileri yükle
  useEffect(() => {
    if (user) {
      loadDoctorData();
    }
  }, [user]);

  const loadDoctorData = async () => {
    try {
      setLoading(true);
      const record = await getDoctorRecordForAuthUid(user!.uid);
      if (!record) {
        toast({
          title: "Hata",
          description: "Doktor bilgileri bulunamadı.",
          variant: "destructive",
        });
        return;
      }
      setDoctorInfo(record);
      const [s, recent] = await Promise.all([
        getDoctorStats(record.id),
        getRecentAppointmentsForDoctor(record.id, 5),
      ]);
      setStats(s);
      setRecentAppointments(recent);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Bilinmeyen hata";
      toast({
        title: "Hata",
        description: `Veriler yüklenirken hata oluştu: ${message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Tamamlandı";
      case "cancelled":
        return "İptal Edildi";
      case "upcoming":
        return "Yaklaşan";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DoctorNavbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Hoş Geldiniz, {doctorInfo?.name || "Doktor"}
          </h1>
          <p className="text-gray-600 mt-2">
            Bugün {new Date().toLocaleDateString('tr-TR')} - {new Date().toLocaleTimeString('tr-TR')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Hasta</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatients}</div>
              <p className="text-xs text-muted-foreground">
                Kayıtlı hasta sayısı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Randevu</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAppointments}</div>
              <p className="text-xs text-muted-foreground">
                Tüm zamanlar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Yaklaşan Randevu</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
              <p className="text-xs text-muted-foreground">
                Bu hafta
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Reçete</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPrescriptions}</div>
              <p className="text-xs text-muted-foreground">
                Yazılan reçete sayısı
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Son Randevularım
            </CardTitle>
            <CardDescription>
              Son 5 randevunuz - Toplam: {recentAppointments.length} randevu
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentAppointments.length > 0 ? (
              <div className="space-y-4">
                {recentAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          appointment.status === "completed" ? "bg-green-100" :
                          appointment.status === "cancelled" ? "bg-red-100" :
                          "bg-blue-100"
                        }`}>
                          <Users className={`h-5 w-5 ${
                            appointment.status === "completed" ? "text-green-600" :
                            appointment.status === "cancelled" ? "text-red-600" :
                            "text-blue-600"
                          }`} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{appointment.patientName}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {appointment.date}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {appointment.time}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {appointment.type}
                          </Badge>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{appointment.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(appointment.status)}>
                        {getStatusText(appointment.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {/* Daha fazla randevu varsa göster */}
                {stats.totalAppointments > 5 && (
                  <div className="text-center pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      Toplam {stats.totalAppointments} randevunuzdan son 5'i gösteriliyor
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Tümünü Gör
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz randevu yok</h3>
                <p className="text-gray-500">Yaklaşan randevularınız burada görünecek.</p>
                <div className="mt-4 space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={loadDoctorData}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Verileri Yenile
                  </Button>
                  <p className="text-xs text-gray-400">Demo verileri yeniden yüklenir</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DoctorDashboard; 