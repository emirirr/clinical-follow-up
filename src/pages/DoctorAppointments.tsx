import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  Search, 
  Filter,
  User,
  Clock,
  MapPin,
  Eye,
  Edit,
  Trash2,
  Plus,
  Stethoscope,
  RefreshCw,
  Copy,
  FileText,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DoctorNavbar from "@/components/DoctorNavbar";
import {
  getDoctorRecordForAuthUid,
  getAppointmentsForDoctor,
  updateAppointmentFields,
} from "@/services/doctorService";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  status: "upcoming" | "completed" | "cancelled";
  location: string;
  notes?: string;
  createdAt: any;
}

const DoctorAppointments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAppointmentDetail, setShowAppointmentDetail] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Verileri yükle
  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
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
      const rows = await getAppointmentsForDoctor(record.id);
      const appointmentsData: Appointment[] = rows.map((row) => ({
        id: row.id!,
        patientId: row.patientId || "",
        patientName: row.patientName || "Bilinmeyen Hasta",
        doctorId: row.doctorId || "",
        doctorName: row.doctorName || row.doctor || "Bilinmeyen Doktor",
        date: row.date || "",
        time: row.time || "",
        type: row.type || "",
        status: row.status || "upcoming",
        location: row.location || "",
        notes: row.notes || "",
        createdAt: row.createdAt || new Date(),
      }));
      setAppointments(appointmentsData);
      toast({
        title: "Başarılı",
        description: `${appointmentsData.length} randevu yüklendi.`,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Bilinmeyen hata";
      toast({
        title: "Hata",
        description: `Randevular yüklenirken hata oluştu: ${message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      await updateAppointmentFields(appointmentId, {
        status: newStatus as Appointment["status"],
      });
      await loadAppointments();
      toast({
        title: "Başarılı",
        description: `Randevu durumu "${getStatusText(newStatus)}" olarak güncellendi.`,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Bilinmeyen hata";
      toast({
        title: "Hata",
        description: `Randevu durumu güncellenirken hata oluştu: ${message}`,
        variant: "destructive",
      });
    }
  };

  const handleShowDetail = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetail(true);
  };

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      
      toast({
        title: "Kopyalandı",
        description: `${field} panoya kopyalandı.`,
      });
      
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kopyalama işlemi başarısız.",
        variant: "destructive",
      });
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

  // Filtreleme
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || appointment.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Calendar className="h-8 w-8 mr-3 text-blue-600" />
                Randevularım
              </h1>
              <p className="text-gray-600 mt-2">
                Tüm randevularınızı buradan yönetebilirsiniz
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Toplam Randevu</p>
                <p className="text-2xl font-bold text-blue-600">{appointments.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Yaklaşan</p>
                <p className="text-2xl font-bold text-green-600">
                  {appointments.filter(a => a.status === "upcoming").length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Tamamlanan</p>
                <p className="text-2xl font-bold text-blue-600">
                  {appointments.filter(a => a.status === "completed").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Hasta adı, randevu türü veya konum ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3 w-full lg:w-auto">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Durum filtresi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü ({appointments.length})</SelectItem>
                  <SelectItem value="upcoming">Yaklaşan ({appointments.filter(a => a.status === "upcoming").length})</SelectItem>
                  <SelectItem value="completed">Tamamlanan ({appointments.filter(a => a.status === "completed").length})</SelectItem>
                  <SelectItem value="cancelled">İptal Edilen ({appointments.filter(a => a.status === "cancelled").length})</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={loadAppointments} variant="outline" className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Yenile</span>
              </Button>
            </div>
          </div>
          
          {/* Aktif Filtreler */}
          {(searchTerm || filterStatus !== "all") && (
            <div className="mt-3 flex items-center space-x-2">
              <span className="text-sm text-gray-500">Aktif filtreler:</span>
              {searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  Arama: "{searchTerm}"
                </Badge>
              )}
              {filterStatus !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  Durum: {getStatusText(filterStatus)}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Filtreleri Temizle
              </Button>
            </div>
          )}
        </div>

        {/* Appointments List */}
        <div className="grid gap-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{appointment.patientName}</h3>
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusText(appointment.status)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium">{appointment.date}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium">{appointment.time}</span>
                          </div>
                          <div className="flex items-center">
                            <Stethoscope className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium">{appointment.type}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium">{appointment.location}</span>
                          </div>
                        </div>
                        
                        {appointment.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Notlar:</span> {appointment.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShowDetail(appointment)}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">Detay</span>
                      </Button>
                      
                      {appointment.status === "upcoming" && (
                        <Select
                          value={appointment.status}
                          onValueChange={(value) => handleStatusChange(appointment.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="completed">Tamamla</SelectItem>
                            <SelectItem value="cancelled">İptal Et</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Randevu bulunamadı</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterStatus !== "all" 
                    ? "Arama kriterlerinize uygun randevu bulunamadı." 
                    : "Henüz randevunuz bulunmuyor."}
                </p>
                <Button onClick={loadAppointments} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Verileri Yenile
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Appointment Detail Modal */}
        <Dialog open={showAppointmentDetail} onOpenChange={setShowAppointmentDetail}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Randevu Detayları</span>
              </DialogTitle>
              <DialogDescription>
                Randevu bilgilerini görüntüleyin ve kopyalayın
              </DialogDescription>
            </DialogHeader>
            
            {selectedAppointment && (
              <div className="space-y-6">
                {/* Temel Bilgiler */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Temel Bilgiler</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Randevu ID</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="font-mono text-sm bg-white px-2 py-1 rounded border">{selectedAppointment.id}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(selectedAppointment.id, "Randevu ID")}
                        >
                          {copiedField === "Randevu ID" ? (
                            <Copy className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Durum</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getStatusColor(selectedAppointment.status)}>
                          {getStatusText(selectedAppointment.status)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(getStatusText(selectedAppointment.status), "Durum")}
                        >
                          {copiedField === "Durum" ? (
                            <Copy className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Hasta Bilgileri */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Hasta Bilgileri
                  </h3>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Hasta Adı</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="font-medium">{selectedAppointment.patientName}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(selectedAppointment.patientName, "Hasta Adı")}
                      >
                        {copiedField === "Hasta Adı" ? (
                          <Copy className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Randevu Detayları */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Randevu Detayları
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Tarih</Label>
                      <p className="mt-1 font-medium">{selectedAppointment.date}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Saat</Label>
                      <p className="mt-1 font-medium">{selectedAppointment.time}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Randevu Türü</Label>
                      <p className="mt-1 font-medium">{selectedAppointment.type}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Konum</Label>
                      <p className="mt-1 font-medium">{selectedAppointment.location}</p>
                    </div>
                  </div>
                </div>
                
                {/* Notlar */}
                {selectedAppointment.notes && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Notlar
                    </h3>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Randevu Notları</Label>
                      <div className="flex items-start space-x-2 mt-1">
                        <p className="text-sm text-gray-600 flex-1">{selectedAppointment.notes}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(selectedAppointment.notes!, "Notlar")}
                        >
                          {copiedField === "Notlar" ? (
                            <Copy className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Sistem Bilgileri */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Sistem Bilgileri
                  </h3>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Oluşturulma Tarihi</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-sm text-gray-600">
                        {selectedAppointment.createdAt?.toDate?.()?.toLocaleString('tr-TR') || 
                         new Date(selectedAppointment.createdAt).toLocaleString('tr-TR')}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(
                          selectedAppointment.createdAt?.toDate?.()?.toLocaleString('tr-TR') || 
                          new Date(selectedAppointment.createdAt).toLocaleString('tr-TR'), 
                          "Oluşturulma Tarihi"
                        )}
                      >
                        {copiedField === "Oluşturulma Tarihi" ? (
                          <Copy className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default DoctorAppointments; 