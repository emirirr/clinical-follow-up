import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Search, 
  Filter,
  User,
  Calendar,
  Pill,
  Eye,
  Plus,
  RefreshCw,
  Copy,
  Activity,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DoctorNavbar from "@/components/DoctorNavbar";
import {
  getDoctorRecordForAuthUid,
  getPrescriptionsForDoctor,
  getDoctorPatientsList,
  addPrescriptionForDoctor,
} from "@/services/doctorService";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  medications: string[];
  dosage: string;
  instructions: string;
  status: "active" | "completed" | "cancelled";
  notes?: string;
  createdAt: any;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

const DoctorPrescriptions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showPrescriptionDetail, setShowPrescriptionDetail] = useState(false);
  const [showNewPrescription, setShowNewPrescription] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [newPrescriptionForm, setNewPrescriptionForm] = useState({
    patientId: "",
    patientName: "",
    medications: "",
    dosage: "",
    instructions: "",
    notes: ""
  });

  // Verileri yükle
  useEffect(() => {
    if (user) {
      loadPrescriptions();
      loadPatients();
    }
  }, [user]);

  const loadPrescriptions = async () => {
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
      const raw = await getPrescriptionsForDoctor(record.id);
      const prescriptionsData: Prescription[] = raw.map((data) => ({
        id: data.id,
        patientId: data.patientId || "",
        patientName: data.patientName || "Bilinmeyen Hasta",
        doctorId: data.doctorId || "",
        doctorName: data.doctorName || data.doctor || "Bilinmeyen Doktor",
        date: data.date || "",
        medications: data.medicine ? [data.medicine] : Array.isArray(data.medications) ? data.medications : [],
        dosage: data.dosage || "",
        instructions: data.instructions || "",
        status: data.status === "completed" ? "completed" : "active",
        notes: data.notes || "",
        createdAt: data.createdAt || new Date(),
      }));
      setPrescriptions(prescriptionsData);
      toast({
        title: "Başarılı",
        description: `${prescriptionsData.length} reçete yüklendi.`,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Bilinmeyen hata";
      toast({
        title: "Hata",
        description: `Reçeteler yüklenirken hata oluştu: ${message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const record = await getDoctorRecordForAuthUid(user!.uid);
      if (!record) return;
      const rows = await getDoctorPatientsList(record.id);
      const patientsData: Patient[] = rows.map((r) => ({
        id: r.patientId,
        name: r.patientName,
        email: r.email,
        phone: r.phone,
      }));
      setPatients(patientsData);
    } catch {
      /* sessiz — hasta listesi yardımcı */
    }
  };

  const handleCreatePrescription = async () => {
    try {
      // Validasyon
      if (!newPrescriptionForm.patientId) {
        toast({
          title: "Hata",
          description: "Lütfen bir hasta seçin.",
          variant: "destructive",
        });
        return;
      }

      if (!newPrescriptionForm.medications.trim()) {
        toast({
          title: "Hata",
          description: "Lütfen en az bir ilaç girin.",
          variant: "destructive",
        });
        return;
      }

      if (!newPrescriptionForm.dosage.trim()) {
        toast({
          title: "Hata",
          description: "Lütfen dozaj bilgisi girin.",
          variant: "destructive",
        });
        return;
      }

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
      const medList = newPrescriptionForm.medications
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);
      await addPrescriptionForDoctor({
        patientId: newPrescriptionForm.patientId,
        patientName: newPrescriptionForm.patientName,
        medicine: medList.join(", ") || newPrescriptionForm.medications.trim(),
        dosage: newPrescriptionForm.dosage,
        instructions: newPrescriptionForm.instructions,
        quantity: medList.length ? `${medList.length} kalem` : "1",
        doctorName: record.name,
        doctorId: record.id,
        date: new Date().toISOString().split("T")[0],
        status: "active",
      });
      toast({
        title: "Başarılı",
        description: `${newPrescriptionForm.patientName} için reçete (demo) kaydedildi.`,
      });
      setShowNewPrescription(false);
      setNewPrescriptionForm({
        patientId: "",
        patientName: "",
        medications: "",
        dosage: "",
        instructions: "",
        notes: "",
      });
      await loadPrescriptions();
    } catch (error: any) {
      console.error("❌ Reçete oluşturulamadı:", error);
      toast({
        title: "Hata",
        description: `Reçete oluşturulurken hata oluştu: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetail = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionDetail(true);
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
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
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
      case "cancelled":
        return "İptal Edildi";
      default:
        return status;
    }
  };

  // Filtreleme
  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.medications.some(med => med.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === "all" || prescription.status === filterStatus;
    
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
                <FileText className="h-8 w-8 mr-3 text-blue-600" />
                Reçetelerim
              </h1>
              <p className="text-gray-600 mt-2">
                Tüm reçetelerinizi buradan yönetebilirsiniz
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Toplam Reçete</p>
                <p className="text-2xl font-bold text-blue-600">{prescriptions.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Aktif Reçete</p>
                <p className="text-2xl font-bold text-green-600">
                  {prescriptions.filter(p => p.status === "active").length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Toplam İlaç</p>
                <p className="text-2xl font-bold text-purple-600">
                  {prescriptions.reduce((sum, p) => sum + p.medications.length, 0)}
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
                placeholder="Hasta adı veya ilaç ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Durum filtresi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="completed">Tamamlanan</SelectItem>
              <SelectItem value="cancelled">İptal Edilen</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={loadPrescriptions} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>

          <Dialog open={showNewPrescription} onOpenChange={setShowNewPrescription}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Reçete
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Yeni Reçete Oluştur</span>
                </DialogTitle>
                <DialogDescription>
                  Hasta için yeni reçete oluşturun
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="patientSelect">Hasta Seçimi</Label>
                  <Select 
                    value={newPrescriptionForm.patientId} 
                    onValueChange={(value) => {
                      const selectedPatient = patients.find(p => p.id === value);
                      setNewPrescriptionForm(prev => ({ 
                        ...prev, 
                        patientId: value,
                        patientName: selectedPatient?.name || ""
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Hasta seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.length > 0 ? (
                        patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{patient.name}</span>
                              <span className="text-xs text-gray-500">{patient.email}</span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          Kayıtlı hasta bulunamadı
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {patients.length === 0 && (
                    <p className="text-sm text-red-500 mt-1">
                      Henüz kayıtlı hastanız bulunmuyor. Önce randevu oluşturun.
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="medications">İlaçlar</Label>
                  <Input
                    id="medications"
                    value={newPrescriptionForm.medications}
                    onChange={(e) => setNewPrescriptionForm(prev => ({ ...prev, medications: e.target.value }))}
                    placeholder="İlaç adları (virgülle ayırın)"
                  />
                </div>
                
                <div>
                  <Label htmlFor="dosage">Dozaj</Label>
                  <Input
                    id="dosage"
                    value={newPrescriptionForm.dosage}
                    onChange={(e) => setNewPrescriptionForm(prev => ({ ...prev, dosage: e.target.value }))}
                    placeholder="Örn: 1 tablet, günde 2 kez"
                  />
                </div>
                
                <div>
                  <Label htmlFor="instructions">Kullanım Talimatları</Label>
                  <Textarea
                    id="instructions"
                    value={newPrescriptionForm.instructions}
                    onChange={(e) => setNewPrescriptionForm(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="İlaç kullanım talimatları"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">Notlar</Label>
                  <Textarea
                    id="notes"
                    value={newPrescriptionForm.notes}
                    onChange={(e) => setNewPrescriptionForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Ek notlar"
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-6">
                <Button
                  variant="outline"
                  disabled={!newPrescriptionForm.patientId}
                  onClick={() => {
                    const selectedPatient = patients.find(p => p.id === newPrescriptionForm.patientId);
                    setNewPrescriptionForm(prev => ({
                      ...prev,
                      medications: "Parol, Aspirin, Vitamin D",
                      dosage: "1 tablet, günde 3 kez",
                      instructions: "Yemeklerden sonra alınacak. Bol su ile içilecek.",
                      notes: `${selectedPatient?.name || 'Test Hasta'} için test reçetesi - gerçek hasta için değildir.`
                    }));
                  }}
                >
                  Test Verisi Doldur
                </Button>
                
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setShowNewPrescription(false)}>
                    İptal
                  </Button>
                  <Button 
                    onClick={handleCreatePrescription}
                    disabled={!newPrescriptionForm.patientId}
                  >
                    Reçete Oluştur
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Prescriptions List */}
        <div className="grid gap-4">
          {filteredPrescriptions.length > 0 ? (
            filteredPrescriptions.map((prescription) => (
              <Card key={prescription.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Pill className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{prescription.patientName}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(prescription.patientName, "Hasta Adı")}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium">{prescription.date}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(prescription.date, "Tarih")}
                              className="h-6 w-6 p-0 ml-1"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center">
                            <Pill className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium">{prescription.medications.length} ilaç</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Activity className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium">{prescription.dosage}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(prescription.dosage, "Dozaj")}
                              className="h-6 w-6 p-0 ml-1"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-gray-600">
                              <strong>İlaçlar:</strong> {prescription.medications.join(", ")}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(prescription.medications.join(", "), "İlaçlar")}
                              className="h-6 w-6 p-0 mt-1"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          {prescription.instructions && (
                            <div>
                              <p className="text-sm text-gray-600">
                                <strong>Talimatlar:</strong> {prescription.instructions}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(prescription.instructions, "Talimatlar")}
                                className="h-6 w-6 p-0 mt-1"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(prescription.status)}>
                        {getStatusText(prescription.status)}
                      </Badge>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShowDetail(prescription)}
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
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Reçete bulunamadı</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterStatus !== "all" 
                    ? "Arama kriterlerinize uygun reçete bulunamadı." 
                    : "Henüz reçeteniz bulunmuyor."}
                </p>
                <Button onClick={loadPrescriptions} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Verileri Yenile
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Prescription Detail Modal */}
        <Dialog open={showPrescriptionDetail} onOpenChange={setShowPrescriptionDetail}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Reçete Detayları</span>
              </DialogTitle>
              <DialogDescription>
                Reçete bilgilerini görüntüleyin ve kopyalayın
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
                          onClick={() => handleCopy(selectedPrescription.id, "Reçete ID")}
                        >
                          {copiedField === "Reçete ID" ? (
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
                        <Badge className={getStatusColor(selectedPrescription.status)}>
                          {getStatusText(selectedPrescription.status)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(getStatusText(selectedPrescription.status), "Durum")}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Hasta Adı</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="font-medium">{selectedPrescription.patientName}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(selectedPrescription.patientName, "Hasta Adı")}
                        >
                          {copiedField === "Hasta Adı" ? (
                            <Copy className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Tarih</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="font-medium">{selectedPrescription.date}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(selectedPrescription.date, "Tarih")}
                        >
                          {copiedField === "Tarih" ? (
                            <Copy className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* İlaç Bilgileri */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center">
                    <Pill className="h-5 w-5 mr-2" />
                    İlaç Bilgileri
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">İlaçlar</Label>
                      <div className="flex items-start space-x-2 mt-1">
                        <div className="flex flex-wrap gap-1">
                          {selectedPrescription.medications.map((medication, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {medication}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(selectedPrescription.medications.join(", "), "İlaçlar")}
                        >
                          {copiedField === "İlaçlar" ? (
                            <Copy className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Dozaj</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="font-medium">{selectedPrescription.dosage}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(selectedPrescription.dosage, "Dozaj")}
                        >
                          {copiedField === "Dozaj" ? (
                            <Copy className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Kullanım Talimatları</Label>
                      <div className="flex items-start space-x-2 mt-1">
                        <p className="text-sm text-gray-600 flex-1">{selectedPrescription.instructions}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(selectedPrescription.instructions, "Kullanım Talimatları")}
                        >
                          {copiedField === "Kullanım Talimatları" ? (
                            <Copy className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Notlar */}
                {selectedPrescription.notes && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Notlar
                    </h3>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Reçete Notları</Label>
                      <div className="flex items-start space-x-2 mt-1">
                        <p className="text-sm text-gray-600 flex-1">{selectedPrescription.notes}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(selectedPrescription.notes!, "Notlar")}
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
                        {selectedPrescription.createdAt?.toDate?.()?.toLocaleString('tr-TR') || 
                         new Date(selectedPrescription.createdAt).toLocaleString('tr-TR')}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(
                          selectedPrescription.createdAt?.toDate?.()?.toLocaleString('tr-TR') || 
                          new Date(selectedPrescription.createdAt).toLocaleString('tr-TR'), 
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
                
                {/* Tüm Bilgileri Kopyala */}
                <div className="bg-purple-50 p-4 rounded-lg">
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
Reçete Bilgileri:
ID: ${selectedPrescription.id}
Hasta: ${selectedPrescription.patientName}
Tarih: ${selectedPrescription.date}
Durum: ${getStatusText(selectedPrescription.status)}

İlaç Bilgileri:
İlaçlar: ${selectedPrescription.medications.join(", ")}
Dozaj: ${selectedPrescription.dosage}
Kullanım Talimatları: ${selectedPrescription.instructions}

${selectedPrescription.notes ? `Notlar: ${selectedPrescription.notes}` : ''}
                        `.trim();
                        handleCopy(allInfo, "Tüm Bilgiler");
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Tüm Bilgileri Kopyala
                    </Button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      Reçete bilgilerinin tamamını tek seferde kopyalar
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

export default DoctorPrescriptions; 