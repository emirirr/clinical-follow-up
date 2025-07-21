import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Pill, 
  User, 
  Calendar, 
  Clock, 
  Search, 
  Filter,
  FileText,
  AlertCircle,
  RefreshCw,
  Eye,
  Copy,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getPatientInfo, 
  getPrescriptions,
  type Prescription
} from "@/services/patientService";
import PatientNavbar from "@/components/PatientNavbar";

const PatientPrescriptions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showPrescriptionDetail, setShowPrescriptionDetail] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [copiedField, setCopiedField] = useState<string>("");

  // Verileri yükle
  useEffect(() => {
    if (user) {
      loadPrescriptions();
    }
  }, [user]);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      
      console.log("🔄 Hasta reçeteleri yükleniyor...");
      console.log("👤 Kullanıcı ID:", user!.uid);
      
      // Hasta bilgilerini getir
      const patient = await getPatientInfo(user!.uid);
      setPatientInfo(patient);

      if (patient) {
        console.log("👤 Hasta bilgileri:", patient.name);
        
        // Reçeteleri getir
        const prescriptionsData = await getPrescriptions(patient.id!);
        setPrescriptions(prescriptionsData);
        
        console.log("💊 Reçeteler yüklendi:", prescriptionsData.length);
        console.log("📋 Reçete detayları:", prescriptionsData);
        
        // Her reçetenin detaylarını göster
        prescriptionsData.forEach((prescription, index) => {
          console.log(`📝 Reçete ${index + 1}:`, {
            id: prescription.id,
            medicine: prescription.medicine,
            doctor: prescription.doctor,
            doctorId: prescription.doctorId,
            dosage: prescription.dosage,
            quantity: prescription.quantity,
            status: prescription.status,
            date: prescription.date,
            instructions: prescription.instructions
          });
          
          // Doktor bilgisi kontrolü
          if (!prescription.doctor) {
            console.warn(`⚠️ Reçete ${index + 1} için doktor bilgisi eksik!`);
          }
        });
        
        toast({
          title: "Başarılı",
          description: `${prescriptionsData.length} reçete yüklendi.`,
        });
      } else {
        console.error("❌ Hasta bilgileri bulunamadı");
        toast({
          title: "Hata",
          description: "Hasta bilgileri bulunamadı.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("❌ Reçeteler yüklenemedi:", error);
      toast({
        title: "Hata",
        description: `Reçeteler yüklenirken hata oluştu: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Aktif";
      case "completed":
        return "Tamamlandı";
      default:
        return status;
    }
  };

  const handleShowDetail = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionDetail(true);
  };

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast({
        title: "Kopyalandı",
        description: `${fieldName} panoya kopyalandı.`,
      });
      setTimeout(() => setCopiedField(""), 2000);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kopyalama başarısız.",
        variant: "destructive",
      });
    }
  };

  // Filtrelenmiş reçeteler
  const filteredPrescriptions = prescriptions.filter(prescription => {
    const medicine = prescription.medicine || "";
    const doctor = prescription.doctor || "";
    
    const matchesSearch = medicine.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || prescription.status === filterStatus;
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
      <PatientNavbar currentPage="prescriptions" />
      
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Pill className="h-6 w-6 mr-2 text-blue-600" />
                Reçetelerim
              </h1>
              <Badge variant="secondary">Hasta</Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Toplam Reçete</p>
                <p className="text-xl font-bold text-blue-600">{prescriptions.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Aktif Reçete</p>
                <p className="text-xl font-bold text-green-600">
                  {prescriptions.filter(p => p.status === "active").length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Tamamlanan</p>
                <p className="text-xl font-bold text-blue-600">
                  {prescriptions.filter(p => p.status === "completed").length}
                </p>
              </div>
            </div>
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
                placeholder="İlaç veya doktor ara..."
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
              variant={filterStatus === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("active")}
            >
              Aktif
            </Button>
            <Button
              variant={filterStatus === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("completed")}
            >
              Tamamlanan
            </Button>
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="space-y-4">
          {filteredPrescriptions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Reçete Bulunamadı
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterStatus !== "all" 
                    ? "Arama kriterlerinize uygun reçete bulunamadı."
                    : "Henüz reçeteniz bulunmuyor."
                  }
                </p>
                <Button onClick={loadPrescriptions} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Verileri Yenile
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredPrescriptions.map((prescription) => (
              <Card key={prescription.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="h-5 w-5 text-primary" />
                        {prescription.medicine || "İlaç adı belirtilmemiş"}
                      </CardTitle>
                      <CardDescription>
                        {prescription.date ? new Date(prescription.date).toLocaleDateString('tr-TR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : "Tarih belirtilmemiş"}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(prescription.status)}>
                      {getStatusText(prescription.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {prescription.doctor 
                            ? `Dr. ${prescription.doctor}`
                            : "Doktor bilgisi yok"
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Doz: {prescription.dosage || "Belirtilmemiş"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Miktar: {prescription.quantity || "Belirtilmemiş"}</span>
                      </div>
                    </div>
                    
                    {prescription.refills && prescription.refills > 0 && (
                      <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-orange-600 font-medium">
                          {prescription.refills} yenileme hakkı kaldı
                        </span>
                      </div>
                    )}
                    
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-sm mb-2 text-blue-900">Kullanım Talimatları:</h4>
                      <p className="text-sm text-gray-700">{prescription.instructions || "Talimat belirtilmemiş"}</p>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShowDetail(prescription)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Detayları Gör
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
      
      {/* Reçete Detay Modalı */}
      <Dialog open={showPrescriptionDetail} onOpenChange={setShowPrescriptionDetail}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Pill className="h-5 w-5" />
              <span>Reçete Detayları</span>
            </DialogTitle>
            <DialogDescription>
              Reçete ve doktor bilgilerini görüntüleyin
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrescription && (
            <div className="space-y-6">
              {/* Temel Bilgiler */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Temel Bilgiler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Reçete ID</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="font-mono text-sm bg-white px-2 py-1 rounded border">{selectedPrescription.id}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(selectedPrescription.id!, "Reçete ID")}
                      >
                        {copiedField === "Reçete ID" ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Durum</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getStatusColor(selectedPrescription.status)}>
                        {getStatusText(selectedPrescription.status)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(getStatusText(selectedPrescription.status), "Durum")}
                      >
                        {copiedField === "Durum" ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* İlaç Bilgileri */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center">
                  <Pill className="h-5 w-5 mr-2" />
                  İlaç Bilgileri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">İlaç Adı</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="font-medium">{selectedPrescription.medicine || "Belirtilmemiş"}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(selectedPrescription.medicine || "", "İlaç Adı")}
                      >
                        {copiedField === "İlaç Adı" ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Dozaj</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="font-medium">{selectedPrescription.dosage || "Belirtilmemiş"}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(selectedPrescription.dosage || "", "Dozaj")}
                      >
                        {copiedField === "Dozaj" ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Miktar</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="font-medium">{selectedPrescription.quantity || "Belirtilmemiş"}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(selectedPrescription.quantity || "", "Miktar")}
                      >
                        {copiedField === "Miktar" ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Yenileme Hakkı</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="font-medium">{selectedPrescription.refills || 0}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy((selectedPrescription.refills || 0).toString(), "Yenileme Hakkı")}
                      >
                        {copiedField === "Yenileme Hakkı" ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Doktor Bilgileri */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Doktor Bilgileri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Doktor Adı</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="font-medium">
                        {selectedPrescription.doctor 
                          ? `Dr. ${selectedPrescription.doctor}`
                          : "Bilinmeyen Doktor"
                        }
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(selectedPrescription.doctor || "", "Doktor Adı")}
                      >
                        {copiedField === "Doktor Adı" ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Doktor ID</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="font-mono text-sm bg-white px-2 py-1 rounded border">
                        {selectedPrescription.doctorId || "Belirtilmemiş"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(selectedPrescription.doctorId || "", "Doktor ID")}
                      >
                        {copiedField === "Doktor ID" ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tarih Bilgileri */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Tarih Bilgileri
                </h3>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Reçete Tarihi</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="font-medium">
                      {selectedPrescription.date 
                        ? new Date(selectedPrescription.date).toLocaleDateString('tr-TR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : "Belirtilmemiş"
                      }
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(
                        selectedPrescription.date 
                          ? new Date(selectedPrescription.date).toLocaleDateString('tr-TR')
                          : "", 
                        "Reçete Tarihi"
                      )}
                    >
                      {copiedField === "Reçete Tarihi" ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Kullanım Talimatları */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Kullanım Talimatları
                </h3>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Talimatlar</Label>
                  <div className="flex items-start space-x-2 mt-1">
                    <p className="text-sm text-gray-700 flex-1">
                      {selectedPrescription.instructions || "Talimat belirtilmemiş"}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(selectedPrescription.instructions || "", "Talimatlar")}
                    >
                      {copiedField === "Talimatlar" ? (
                        <Check className="h-4 w-4 text-green-600" />
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
    </div>
  );
};

export default PatientPrescriptions; 