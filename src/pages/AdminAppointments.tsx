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
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminNavbar from "@/components/AdminNavbar";
import {
  listAllUsers,
  demoAddAppointment,
  demoPatchAppointment,
  demoRemoveAppointment,
} from "@/services/adminService";
import { getDemoAppointments } from "@/lib/demo-store";
import { DEMO_PATIENT_DOC_ID, DEMO_DOCTOR_DOC_ID } from "@/lib/demo-store";
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

interface AppointmentFormData {
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  location: string;
  notes: string;
}

const AdminAppointments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showAppointmentView, setShowAppointmentView] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentForm, setAppointmentForm] = useState<AppointmentFormData>({
    patientId: "",
    patientName: "",
    doctorId: "",
    doctorName: "",
    date: "",
    time: "",
    type: "",
    location: "",
    notes: ""
  });

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const rows = [...getDemoAppointments()].sort(
        (a, b) => b.createdAt.seconds - a.createdAt.seconds
      );
      const appointmentsData: Appointment[] = rows.map((row) => ({
        id: row.id,
        patientId: row.patientId || "",
        patientName: row.patientName || "İsimsiz Hasta",
        doctorId: row.doctorId || "",
        doctorName: row.doctorName || row.doctor || "İsimsiz Doktor",
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
        description: `${appointmentsData.length} randevu yüklendi (demo).`,
      });
    } catch (error: unknown) {
      console.error("Randevular yüklenirken hata:", error);
      toast({
        title: "Hata",
        description: "Randevu verileri yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPatientsAndDoctors = async () => {
    try {
      const users = listAllUsers();
      const patientsData = users
        .filter((u) => u.role === "patient")
        .map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
        }));
      const doctorsData = users
        .filter((u) => u.role === "doctor")
        .map((u) => ({
          id: u.id,
          name: u.name,
          department: u.department,
        }));
      setPatients(patientsData);
      setDoctors(doctorsData);
    } catch (error) {
      console.error("Hasta ve doktor verileri yüklenirken hata:", error);
    }
  };

  // Component mount olduğunda verileri yükle
  useEffect(() => {
    loadPatientsAndDoctors();
    loadAppointments();
  }, []);

  // Randevu ekleme
  const handleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      demoAddAppointment({
        patientId: appointmentForm.patientId,
        patientName: appointmentForm.patientName,
        doctorId: appointmentForm.doctorId,
        doctor: appointmentForm.doctorName,
        doctorName: appointmentForm.doctorName,
        date: appointmentForm.date,
        time: appointmentForm.time,
        type: appointmentForm.type,
        location: appointmentForm.location,
        notes: appointmentForm.notes,
        status: "upcoming",
      });
      
      toast({
        title: "Başarılı",
        description: "Randevu başarıyla eklendi.",
      });
      
      // Formu temizle ve modalı kapat
      setAppointmentForm({
        patientId: "",
        patientName: "",
        doctorId: "",
        doctorName: "",
        date: "",
        time: "",
        type: "",
        location: "",
        notes: ""
      });
      setShowAppointmentForm(false);
      
      // Randevu listesini yenile
      await loadAppointments();
      
    } catch (error) {
      console.error("Randevu ekleme hatası:", error);
      toast({
        title: "Hata",
        description: "Randevu eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Form input değişiklikleri
  const handleInputChange = (field: keyof AppointmentFormData, value: string) => {
    setAppointmentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Hasta seçimi
  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      handleInputChange("patientId", patientId);
      handleInputChange("patientName", patient.name);
    }
  };

  // Doktor seçimi
  const handleDoctorSelect = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) {
      handleInputChange("doctorId", doctorId);
      handleInputChange("doctorName", doctor.name);
    }
  };

  // Randevu görüntüleme
  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentView(true);
  };

  // Randevu düzenleme
  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentForm({
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctorName,
      date: appointment.date,
      time: appointment.time,
      type: appointment.type,
      location: appointment.location,
      notes: appointment.notes || ""
    });
    setShowAppointmentForm(true);
  };

  // Randevu güncelleme
  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAppointment) return;
    
    try {
      setLoading(true);
      
      demoPatchAppointment(selectedAppointment.id, {
        patientId: appointmentForm.patientId,
        patientName: appointmentForm.patientName,
        doctorId: appointmentForm.doctorId,
        doctorName: appointmentForm.doctorName,
        doctor: appointmentForm.doctorName,
        date: appointmentForm.date,
        time: appointmentForm.time,
        type: appointmentForm.type,
        location: appointmentForm.location,
        notes: appointmentForm.notes,
      });
      
      toast({
        title: "Başarılı",
        description: "Randevu bilgileri başarıyla güncellendi.",
      });
      
      // Formu temizle ve modalı kapat
      setAppointmentForm({
        patientId: "",
        patientName: "",
        doctorId: "",
        doctorName: "",
        date: "",
        time: "",
        type: "",
        location: "",
        notes: ""
      });
      setShowAppointmentForm(false);
      setSelectedAppointment(null);
      
      // Randevu listesini yenile
      await loadAppointments();
      
    } catch (error) {
      console.error("Randevu güncelleme hatası:", error);
      toast({
        title: "Hata",
        description: "Randevu güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Randevu silme
  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm("Bu randevuyu silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      setLoading(true);
      
      demoRemoveAppointment(appointmentId);
      
      // Randevu listesini yenile
      await loadAppointments();

      toast({
        title: "Başarılı",
        description: "Randevu başarıyla silindi.",
      });

    } catch (error) {
      console.error("Randevu silme hatası:", error);
      toast({
        title: "Hata",
        description: "Randevu silinirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Randevu durumu değiştirme
  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      setLoading(true);
      
      demoPatchAppointment(appointmentId, {
        status: newStatus as Appointment["status"],
      });
      
      // Randevu listesini yenile
      await loadAppointments();

      toast({
        title: "Başarılı",
        description: "Randevu durumu güncellendi.",
      });

    } catch (error) {
      console.error("Randevu durumu güncelleme hatası:", error);
      toast({
        title: "Hata",
        description: "Randevu durumu güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || appointment.status === filterStatus;
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
      <AdminNavbar currentPage="appointments" />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Randevu Yönetimi</h1>
            <p className="text-gray-600">Tüm randevuları görüntüleyin ve yönetin</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={loadAppointments}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                toast({
                  title: "Demo",
                  description: `Yerel demo: ${getDemoAppointments().length} randevu, ${listAllUsers().length} kullanıcı.`,
                });
              }}
            >
              Demo Özeti
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const id = demoAddAppointment({
                    patientId: DEMO_PATIENT_DOC_ID,
                    patientName: "Test Hasta",
                    doctorId: DEMO_DOCTOR_DOC_ID,
                    doctor: "Dr. Mehmet Kaya",
                    doctorName: "Dr. Mehmet Kaya",
                    date: new Date().toISOString().split("T")[0],
                    time: "10:00",
                    type: "Test Muayene",
                    location: "Demo bölümü",
                    notes: "Test — " + new Date().toLocaleString("tr-TR"),
                    status: "upcoming",
                  });
                  toast({
                    title: "Başarılı",
                    description: `Test randevu eklendi. ID: ${id}`,
                  });
                  setTimeout(() => loadAppointments(), 300);
                } catch (error) {
                  console.error("Test randevu ekleme hatası:", error);
                  toast({
                    title: "Hata",
                    description: "Test randevu eklenirken hata oluştu.",
                    variant: "destructive",
                  });
                }
              }}
            >
              Test Randevu Ekle
            </Button>
                          <Dialog open={showAppointmentForm} onOpenChange={setShowAppointmentForm}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Randevu
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{selectedAppointment ? "Randevu Düzenle" : "Yeni Randevu"}</DialogTitle>
                    <DialogDescription>
                      {selectedAppointment ? "Randevu bilgilerini güncelleyin" : "Yeni randevu bilgilerini girin"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={selectedAppointment ? handleUpdateAppointment : handleAppointmentSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="patientSelect">Hasta</Label>
                        <Select value={appointmentForm.patientId} onValueChange={handlePatientSelect}>
                          <SelectTrigger>
                            <SelectValue placeholder="Hasta seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {patients.map(patient => (
                              <SelectItem key={patient.id} value={patient.id}>
                                {patient.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="doctorSelect">Doktor</Label>
                        <Select value={appointmentForm.doctorId} onValueChange={handleDoctorSelect}>
                          <SelectTrigger>
                            <SelectValue placeholder="Doktor seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {doctors.map(doctor => (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                {doctor.name} - {doctor.department}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="appointmentDate">Tarih</Label>
                        <Input
                          id="appointmentDate"
                          type="date"
                          value={appointmentForm.date}
                          onChange={(e) => handleInputChange("date", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="appointmentTime">Saat</Label>
                        <Input
                          id="appointmentTime"
                          type="time"
                          value={appointmentForm.time}
                          onChange={(e) => handleInputChange("time", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="appointmentType">Tür</Label>
                        <Select value={appointmentForm.type} onValueChange={(value) => handleInputChange("type", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Randevu türü seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Muayene">Muayene</SelectItem>
                            <SelectItem value="Kontrol">Kontrol</SelectItem>
                            <SelectItem value="Tedavi">Tedavi</SelectItem>
                            <SelectItem value="Konsültasyon">Konsültasyon</SelectItem>
                            <SelectItem value="Acil">Acil</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="appointmentLocation">Lokasyon</Label>
                        <Input
                          id="appointmentLocation"
                          value={appointmentForm.location}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                          placeholder="Bölüm/Lokasyon"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="appointmentNotes">Notlar</Label>
                      <Textarea
                        id="appointmentNotes"
                        value={appointmentForm.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        placeholder="Randevu notları..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" disabled={loading} className="flex-1">
                        {loading ? "Kaydediliyor..." : (selectedAppointment ? "Randevu Güncelle" : "Randevu Kaydet")}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setShowAppointmentForm(false);
                          setSelectedAppointment(null);
                          setAppointmentForm({
                            patientId: "",
                            patientName: "",
                            doctorId: "",
                            doctorName: "",
                            date: "",
                            time: "",
                            type: "",
                            location: "",
                            notes: ""
                          });
                        }}
                      >
                        İptal
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Hasta, doktor veya randevu türü ara..."
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Randevu</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments.length}</div>
              <p className="text-xs text-muted-foreground">
                Kayıtlı randevu sayısı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yaklaşan</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {appointments.filter(a => a.status === "upcoming").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Yaklaşan randevu
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {appointments.filter(a => a.status === "completed").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Tamamlanan randevu
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">İptal Edilen</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {appointments.filter(a => a.status === "cancelled").length}
              </div>
              <p className="text-xs text-muted-foreground">
                İptal edilen randevu
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle>Randevu Listesi</CardTitle>
            <CardDescription>
              Tüm randevuların detaylı listesi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Randevu Bulunamadı
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || filterStatus !== "all" 
                      ? "Arama kriterlerinize uygun randevu bulunamadı."
                      : "Henüz randevu kaydı bulunmuyor."
                    }
                  </p>
                  {!searchTerm && filterStatus === "all" && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">
                        Toplam randevu sayısı: {appointments.length}
                      </p>
                      <p className="text-sm text-gray-500">
                        Yüklenen randevu sayısı: {appointments.length}
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          console.log("🔍 Mevcut randevular:", appointments);
                          console.log("🔍 Filtrelenmiş randevular:", filteredAppointments);
                          console.log("🔍 Arama terimi:", searchTerm);
                          console.log("🔍 Filtre durumu:", filterStatus);
                        }}
                      >
                        Debug Bilgileri
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Hasta</th>
                        <th className="text-left py-3 px-4 font-medium">Doktor</th>
                        <th className="text-left py-3 px-4 font-medium">Tarih & Saat</th>
                        <th className="text-left py-3 px-4 font-medium">Tür</th>
                        <th className="text-left py-3 px-4 font-medium">Durum</th>
                        <th className="text-left py-3 px-4 font-medium">Lokasyon</th>
                        <th className="text-left py-3 px-4 font-medium">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map((appointment) => (
                        <tr key={appointment.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{appointment.patientName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Stethoscope className="h-4 w-4 text-gray-400" />
                              <span>{appointment.doctorName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="text-sm">
                                {new Date(appointment.date).toLocaleDateString('tr-TR')}
                              </div>
                              <div className="text-sm text-gray-500">
                                {appointment.time}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm">{appointment.type}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(appointment.status)}>
                              {getStatusText(appointment.status)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">{appointment.location}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewAppointment(appointment)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Görüntüle
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditAppointment(appointment)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Düzenle
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteAppointment(appointment.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Sil
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Randevu Detay Modalı */}
        <Dialog open={showAppointmentView} onOpenChange={setShowAppointmentView}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Randevu Detayları</DialogTitle>
              <DialogDescription>
                {selectedAppointment?.patientName} - {selectedAppointment?.doctorName}
              </DialogDescription>
            </DialogHeader>
            
            {selectedAppointment && (
              <div className="space-y-6">
                {/* Temel Bilgiler */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Hasta Bilgileri</h4>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Ad Soyad</p>
                      <p className="font-medium">{selectedAppointment.patientName}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Doktor Bilgileri</h4>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Ad Soyad</p>
                      <p className="font-medium">{selectedAppointment.doctorName}</p>
                    </div>
                  </div>
                </div>

                {/* Randevu Bilgileri */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Tarih & Saat</h4>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Tarih</p>
                      <p className="font-medium">{new Date(selectedAppointment.date).toLocaleDateString('tr-TR')}</p>
                      <p className="text-sm text-gray-600 mt-1">Saat</p>
                      <p className="font-medium">{selectedAppointment.time}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Randevu Bilgileri</h4>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Tür</p>
                      <p className="font-medium">{selectedAppointment.type}</p>
                      <p className="text-sm text-gray-600 mt-1">Lokasyon</p>
                      <p className="font-medium">{selectedAppointment.location}</p>
                    </div>
                  </div>
                </div>

                {/* Durum ve Notlar */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Durum</h4>
                    <Badge className={getStatusColor(selectedAppointment.status)}>
                      {getStatusText(selectedAppointment.status)}
                    </Badge>
                  </div>
                  
                  {selectedAppointment.notes && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Notlar</h4>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm">{selectedAppointment.notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* İşlem Butonları */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleEditAppointment(selectedAppointment);
                      setShowAppointmentView(false);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Düzenle
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newStatus = selectedAppointment.status === "upcoming" ? "completed" : "upcoming";
                      handleUpdateStatus(selectedAppointment.id, newStatus);
                      setShowAppointmentView(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {selectedAppointment.status === "upcoming" ? "Tamamlandı Olarak İşaretle" : "Yaklaşan Olarak İşaretle"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleDeleteAppointment(selectedAppointment.id);
                      setShowAppointmentView(false);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Sil
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const appointmentInfo = `
Randevu Bilgileri:
Hasta: ${selectedAppointment.patientName}
Doktor: ${selectedAppointment.doctorName}
Tarih: ${new Date(selectedAppointment.date).toLocaleDateString('tr-TR')}
Saat: ${selectedAppointment.time}
Tür: ${selectedAppointment.type}
Lokasyon: ${selectedAppointment.location}
Durum: ${getStatusText(selectedAppointment.status)}
Notlar: ${selectedAppointment.notes || "Not yok"}
                      `.trim();
                      
                      navigator.clipboard.writeText(appointmentInfo);
                      toast({
                        title: "Kopyalandı",
                        description: "Randevu bilgileri panoya kopyalandı.",
                      });
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Kopyala
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminAppointments; 