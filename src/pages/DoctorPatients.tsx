import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Search, 
  Filter,
  User,
  Calendar,
  Phone,
  Mail,
  Eye,
  FileText,
  Activity,
  RefreshCw,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DoctorNavbar from "@/components/DoctorNavbar";
import { getDoctorRecordForAuthUid, getDoctorPatientsList } from "@/services/doctorService";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate?: string;
  gender?: string;
  bloodType?: string;
  lastAppointment?: string;
  totalAppointments: number;
  completedAppointments: number;
  upcomingAppointments: number;
}

const DoctorPatients = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPatientDetail, setShowPatientDetail] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Verileri yükle
  useEffect(() => {
    if (user) {
      loadPatients();
    }
  }, [user]);

  const loadPatients = async () => {
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
      const rows = await getDoctorPatientsList(record.id);
      const patientsData: Patient[] = rows.map((r) => ({
        id: r.patientId,
        name: r.patientName,
        email: r.email,
        phone: r.phone,
        birthDate: r.birthDate,
        gender: r.gender,
        bloodType: r.bloodType,
        lastAppointment: r.lastVisit,
        totalAppointments: r.totalAppointments,
        completedAppointments: r.completedAppointments,
        upcomingAppointments: r.upcomingAppointments,
      }));
      setPatients(patientsData);
      toast({
        title: "Başarılı",
        description: `${patientsData.length} hasta yüklendi.`,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Bilinmeyen hata";
      toast({
        title: "Hata",
        description: `Hastalar yüklenirken hata oluştu: ${message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetail = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientDetail(true);
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

  // Filtreleme
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
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
                <Users className="h-8 w-8 mr-3 text-blue-600" />
                Hastalarım
              </h1>
              <p className="text-gray-600 mt-2">
                Tüm hastalarınızı buradan görüntüleyebilirsiniz
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Toplam Hasta</p>
                <p className="text-2xl font-bold text-blue-600">{patients.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Aktif Hastalar</p>
                <p className="text-2xl font-bold text-green-600">
                  {patients.filter(p => p.upcomingAppointments > 0).length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Toplam Randevu</p>
                <p className="text-2xl font-bold text-purple-600">
                  {patients.reduce((sum, p) => sum + p.totalAppointments, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Hasta adı, email veya telefon ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button onClick={loadPatients} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
        </div>

        {/* Patients List */}
        <div className="grid gap-4">
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-md transition-shadow">
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
                          <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(patient.name, "Hasta Adı")}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium">{patient.email}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(patient.email, "Email")}
                              className="h-6 w-6 p-0 ml-1"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          {patient.phone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="font-medium">{patient.phone}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(patient.phone!, "Telefon")}
                                className="h-6 w-6 p-0 ml-1"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          
                          {patient.birthDate && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="font-medium">{patient.birthDate}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(patient.birthDate!, "Doğum Tarihi")}
                                className="h-6 w-6 p-0 ml-1"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline" className="text-xs">
                            Toplam: {patient.totalAppointments}
                          </Badge>
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Tamamlanan: {patient.completedAppointments}
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            Yaklaşan: {patient.upcomingAppointments}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShowDetail(patient)}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">Detay</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Hasta bulunamadı</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm 
                    ? "Arama kriterlerinize uygun hasta bulunamadı." 
                    : "Henüz hastanız bulunmuyor."}
                </p>
                <Button onClick={loadPatients} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Verileri Yenile
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Patient Detail Modal */}
        <Dialog open={showPatientDetail} onOpenChange={setShowPatientDetail}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Hasta Detayları</span>
              </DialogTitle>
              <DialogDescription>
                Hasta bilgilerini görüntüleyin ve kopyalayın
              </DialogDescription>
            </DialogHeader>
            
            {selectedPatient && (
              <div className="space-y-6">
                {/* Temel Bilgiler */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Temel Bilgiler</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Hasta ID</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="font-mono text-sm bg-white px-2 py-1 rounded border">{selectedPatient.id}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(selectedPatient.id, "Hasta ID")}
                        >
                          {copiedField === "Hasta ID" ? (
                            <Copy className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Toplam Randevu</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className="bg-blue-100 text-blue-800">
                          {selectedPatient.totalAppointments}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(selectedPatient.totalAppointments.toString(), "Toplam Randevu")}
                        >
                          {copiedField === "Toplam Randevu" ? (
                            <Copy className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Kişisel Bilgiler */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Kişisel Bilgiler
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Ad Soyad</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="font-medium">{selectedPatient.name}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(selectedPatient.name, "Ad Soyad")}
                        >
                          {copiedField === "Ad Soyad" ? (
                            <Copy className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Email</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="font-medium">{selectedPatient.email}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(selectedPatient.email, "Email")}
                        >
                          {copiedField === "Email" ? (
                            <Copy className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Telefon</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="font-medium">{selectedPatient.phone || "Belirtilmemiş"}</p>
                        {selectedPatient.phone && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(selectedPatient.phone!, "Telefon")}
                          >
                            {copiedField === "Telefon" ? (
                              <Copy className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Doğum Tarihi</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="font-medium">{selectedPatient.birthDate || "Belirtilmemiş"}</p>
                        {selectedPatient.birthDate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(selectedPatient.birthDate!, "Doğum Tarihi")}
                          >
                            {copiedField === "Doğum Tarihi" ? (
                              <Copy className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Cinsiyet</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="font-medium">{selectedPatient.gender || "Belirtilmemiş"}</p>
                        {selectedPatient.gender && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(selectedPatient.gender!, "Cinsiyet")}
                          >
                            {copiedField === "Cinsiyet" ? (
                              <Copy className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Kan Grubu</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="font-medium">{selectedPatient.bloodType || "Belirtilmemiş"}</p>
                        {selectedPatient.bloodType && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(selectedPatient.bloodType!, "Kan Grubu")}
                          >
                            {copiedField === "Kan Grubu" ? (
                              <Copy className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Randevu İstatistikleri */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Randevu İstatistikleri
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Tamamlanan Randevu</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className="bg-green-100 text-green-800">
                          {selectedPatient.completedAppointments}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(selectedPatient.completedAppointments.toString(), "Tamamlanan Randevu")}
                        >
                          {copiedField === "Tamamlanan Randevu" ? (
                            <Copy className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Yaklaşan Randevu</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className="bg-blue-100 text-blue-800">
                          {selectedPatient.upcomingAppointments}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(selectedPatient.upcomingAppointments.toString(), "Yaklaşan Randevu")}
                        >
                          {copiedField === "Yaklaşan Randevu" ? (
                            <Copy className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Son Randevu</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="font-medium">{selectedPatient.lastAppointment || "Henüz randevu yok"}</p>
                        {selectedPatient.lastAppointment && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(selectedPatient.lastAppointment!, "Son Randevu")}
                          >
                            {copiedField === "Son Randevu" ? (
                              <Copy className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Tüm Bilgileri Kopyala */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center">
                    <Copy className="h-5 w-5 mr-2" />
                    Toplu Kopyalama
                  </h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const allInfo = `
Hasta Bilgileri:
ID: ${selectedPatient.id}
Ad Soyad: ${selectedPatient.name}
Email: ${selectedPatient.email}
Telefon: ${selectedPatient.phone || "Belirtilmemiş"}
Doğum Tarihi: ${selectedPatient.birthDate || "Belirtilmemiş"}
Cinsiyet: ${selectedPatient.gender || "Belirtilmemiş"}
Kan Grubu: ${selectedPatient.bloodType || "Belirtilmemiş"}

Randevu İstatistikleri:
Toplam Randevu: ${selectedPatient.totalAppointments}
Tamamlanan: ${selectedPatient.completedAppointments}
Yaklaşan: ${selectedPatient.upcomingAppointments}
Son Randevu: ${selectedPatient.lastAppointment || "Henüz randevu yok"}
                        `.trim();
                        handleCopy(allInfo, "Tüm Bilgiler");
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Tüm Bilgileri Kopyala
                    </Button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      Hasta bilgilerinin tamamını tek seferde kopyalar
                    </p>
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

export default DoctorPatients; 