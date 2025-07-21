import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Search, 
  Plus,
  Edit,
  Trash2,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getPatientInfo, 
  getAppointments, 
  updateAppointment,
  deleteAppointment,
  type Appointment
} from "@/services/patientService";
import PatientNavbar from "@/components/PatientNavbar";
import NewAppointmentModal from "@/components/NewAppointmentModal";
import EditAppointmentModal from "@/components/EditAppointmentModal";
import AppointmentDetailModal from "@/components/AppointmentDetailModal";

const PatientAppointments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Verileri yükle
  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      
      // Hasta bilgilerini getir
      const patient = await getPatientInfo(user!.uid);
      setPatientInfo(patient);

      if (patient) {
        // Randevuları getir
        const appointmentsData = await getAppointments(patient.id!);
        setAppointments(appointmentsData);
      }
    } catch (error) {
      console.error("Randevular yüklenemedi:", error);
      toast({
        title: "Hata",
        description: "Randevular yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentSuccess = () => {
    loadAppointments();
    setShowNewAppointmentModal(false);
    toast({
      title: "Başarılı",
      description: "Randevu başarıyla oluşturuldu.",
    });
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      await deleteAppointment(appointmentId);
      await loadAppointments();
      toast({
        title: "Başarılı",
        description: "Randevu başarıyla silindi.",
      });
    } catch (error) {
      console.error("Randevu silinemedi:", error);
      toast({
        title: "Hata",
        description: "Randevu silinirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleEditAppointment = (appointment: any) => {
    console.log("📝 Düzenlenecek randevu:", appointment);
    setSelectedAppointment(appointment);
    setShowEditAppointmentModal(true);
  };

  const handleEditSuccess = () => {
    loadAppointments();
    setShowEditAppointmentModal(false);
    setSelectedAppointment(null);
    toast({
      title: "Başarılı",
      description: "Randevu başarıyla güncellendi.",
    });
  };

  const handleShowDetail = (appointment: any) => {
    console.log("📋 Detayları gösterilecek randevu:", appointment);
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  const handleDetailEdit = () => {
    setShowDetailModal(false);
    setShowEditAppointmentModal(true);
  };

  const handleDetailDelete = () => {
    setShowDetailModal(false);
    if (selectedAppointment?.id) {
      handleDeleteAppointment(selectedAppointment.id);
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
      default:
        return status;
    }
  };

  // Filtrelenmiş randevular
  const filteredAppointments = appointments.filter(appointment => {
    const doctorName = appointment.doctor || appointment.doctorName || "";
    const appointmentType = appointment.type || "";
    
    const matchesSearch = doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointmentType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || (appointment.status || "upcoming") === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
      <PatientNavbar currentPage="appointments" />
      
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Randevularım
              </h1>
              <Badge variant="secondary">Hasta</Badge>
            </div>
            <Button onClick={() => setShowNewAppointmentModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Randevu
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Doktor veya randevu türü ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
            >
              Tümü
            </Button>
            <Button
              variant={filterStatus === "upcoming" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("upcoming")}
            >
              Yaklaşan
            </Button>
            <Button
              variant={filterStatus === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("completed")}
            >
              Tamamlanan
            </Button>
            <Button
              variant={filterStatus === "cancelled" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("cancelled")}
            >
              İptal Edilen
            </Button>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Randevu Bulunamadı
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterStatus !== "all" 
                    ? "Arama kriterlerinize uygun randevu bulunamadı."
                    : "Henüz randevunuz bulunmuyor."
                  }
                </p>
                <Button onClick={() => setShowNewAppointmentModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Randevunuzu Oluşturun
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredAppointments.map((appointment) => (
              <Card key={appointment.id || `appointment-${Math.random()}`} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        {appointment.type || "Genel Muayene"}
                      </CardTitle>
                      <CardDescription>
                        {appointment.date ? new Date(appointment.date).toLocaleDateString('tr-TR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : "Tarih belirtilmemiş"}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(appointment.status || "upcoming")}>
                      {getStatusText(appointment.status || "upcoming")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{appointment.doctor || appointment.doctorName || "Bilinmeyen Doktor"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{appointment.time || "Belirtilmemiş"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{appointment.location || "Belirtilmemiş"}</span>
                    </div>
                    {appointment.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{appointment.notes}</p>
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleShowDetail(appointment)}
                      >
                        Detayları Gör
                      </Button>
                      {(appointment.status || "upcoming") === "upcoming" && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditAppointment(appointment)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Düzenle
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteAppointment(appointment.id || "")}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            İptal Et
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* New Appointment Modal */}
      {showNewAppointmentModal && (
        <NewAppointmentModal
          isOpen={showNewAppointmentModal}
          onClose={() => setShowNewAppointmentModal(false)}
          onSuccess={handleAppointmentSuccess}
          patientId={patientInfo?.id || ""}
          patientName={patientInfo?.name || "Bilinmeyen Hasta"}
        />
      )}

      {/* Edit Appointment Modal */}
      {showEditAppointmentModal && selectedAppointment && (
        <EditAppointmentModal
          isOpen={showEditAppointmentModal}
          onClose={() => {
            setShowEditAppointmentModal(false);
            setSelectedAppointment(null);
          }}
          onSuccess={handleEditSuccess}
          appointment={selectedAppointment}
        />
      )}

      {/* Detail Appointment Modal */}
      {showDetailModal && selectedAppointment && (
        <AppointmentDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          onEdit={handleDetailEdit}
          onDelete={handleDetailDelete}
        />
      )}
    </div>
  );
};

export default PatientAppointments; 