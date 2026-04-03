import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  Filter,
  User,
  Calendar,
  Phone,
  Mail,
  Eye,
  Edit,
  Trash2,
  Plus,
  UserPlus,
  RefreshCw,
  Activity,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminNavbar from "@/components/AdminNavbar";
import {
  listAllUsers,
  demoUpdateUserDoc,
  demoDeleteUserDoc,
  demoCreateUser,
} from "@/services/adminService";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate?: string;
  gender?: string;
  bloodType?: string;
  createdAt: any;
  status: "active" | "inactive";
  role: string;
  userId: string;
}

interface PatientFormData {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  bloodType: string;
  password: string;
}

const AdminPatients = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showPatientView, setShowPatientView] = useState(false);
  const [showPatientEdit, setShowPatientEdit] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientForm, setPatientForm] = useState<PatientFormData>({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "",
    bloodType: "",
    password: ""
  });

  const loadPatients = async () => {
    try {
      setLoading(true);
      const all = listAllUsers();
      const patientsData: Patient[] = all
        .filter((u) => u.role === "patient")
        .map((u) => ({
          id: u.id,
          userId: u.userId,
          name: u.name || "İsimsiz Hasta",
          email: u.email || "",
          phone: u.phone || "",
          birthDate: u.birthDate || "",
          gender: u.gender || "",
          bloodType: u.bloodType || "",
          status: u.status || "active",
          role: "patient",
          createdAt: u.createdAt || new Date(),
        }));
      setPatients(patientsData);
      toast({
        title: "Başarılı",
        description: `${patientsData.length} hasta yüklendi (demo veri).`,
      });
    } catch (error: unknown) {
      console.error("Hastalar yüklenirken hata:", error);
      toast({
        title: "Hata",
        description: "Hasta verileri yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Component mount olduğunda hastaları yükle
  useEffect(() => {
    loadPatients();
  }, []);

  // Hasta durumu değiştirme
  const handleToggleStatus = async (patient: Patient) => {
    const newStatus = patient.status === "active" ? "inactive" : "active";
    
    try {
      setLoading(true);
      
      demoUpdateUserDoc(patient.id, { status: newStatus });
      
      // Hasta listesini yenile
      await loadPatients();

      toast({
        title: "Başarılı",
        description: `${patient.name} durumu ${newStatus === "active" ? "aktif" : "pasif"} olarak güncellendi.`,
      });

    } catch (error) {
      console.error("Hasta durumu güncelleme hatası:", error);
      toast({
        title: "Hata",
        description: "Hasta durumu güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validasyonu
    if (!patientForm.name.trim()) {
      toast({
        title: "Hata",
        description: "Hasta adı gereklidir.",
        variant: "destructive",
      });
      return;
    }
    
    if (!patientForm.email.trim()) {
      toast({
        title: "Hata",
        description: "Email adresi gereklidir.",
        variant: "destructive",
      });
      return;
    }
    
    if (patientForm.password.length < 6) {
      toast({
        title: "Hata",
        description: "Şifre en az 6 karakter olmalıdır.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      demoCreateUser({
        email: patientForm.email,
        name: patientForm.name,
        phone: patientForm.phone,
        role: "patient",
        birthDate: patientForm.birthDate,
        gender: patientForm.gender,
        bloodType: patientForm.bloodType,
      });

      toast({
        title: "Başarılı",
        description: `${patientForm.name} demo hasta kaydı oluşturuldu. Email: ${patientForm.email}`,
      });

      await loadPatients();

      setPatientForm({
        name: "",
        email: "",
        phone: "",
        birthDate: "",
        gender: "",
        bloodType: "",
        password: "",
      });
      setShowPatientForm(false);
    } catch (error: unknown) {
      console.error("Hasta kayıt hatası:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Hasta kaydı oluşturulurken hata oluştu.";
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PatientFormData, value: string) => {
    setPatientForm(prev => ({ ...prev, [field]: value }));
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    handleInputChange("password", password);
  };

  // Hasta görüntüleme
  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientView(true);
  };

  // Hasta düzenleme
  const handleEditPatient = (patient: Patient) => {
    console.log("✏️ Hasta düzenleme başlatılıyor:", patient);
    
    // Seçili hastayı ayarla
    setSelectedPatient(patient);
    
    // Form verilerini hasta bilgileri ile doldur
    setPatientForm({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      birthDate: patient.birthDate || "",
      gender: patient.gender || "",
      bloodType: patient.bloodType || "",
      password: "" // Şifre düzenlenemez
    });
    
    // Düzenleme modalını aç
    setShowPatientEdit(true);
  };

  // Hasta güncelleme
  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      toast({
        title: "Hata",
        description: "Düzenlenecek hasta seçilmedi.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const savedName = patientForm.name;
      demoUpdateUserDoc(selectedPatient.id, {
        name: patientForm.name,
        email: patientForm.email,
        phone: patientForm.phone,
        birthDate: patientForm.birthDate,
        gender: patientForm.gender,
        bloodType: patientForm.bloodType,
      });

      setPatientForm({
        name: "",
        email: "",
        phone: "",
        birthDate: "",
        gender: "",
        bloodType: "",
        password: "",
      });

      setShowPatientEdit(false);
      setSelectedPatient(null);

      await loadPatients();

      toast({
        title: "Başarılı",
        description: `${savedName} hasta bilgileri güncellendi (demo).`,
      });
      
    } catch (error) {
      console.error("❌ Hasta güncelleme hatası:", error);
      toast({
        title: "Hata",
        description: "Hasta güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Hasta silme
  const handleDeletePatient = async (patientId: string) => {
    if (!confirm("Bu hastayı silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      setLoading(true);
      
      demoDeleteUserDoc(patientId);
      await loadPatients();

      toast({
        title: "Başarılı",
        description: "Hasta başarıyla silindi.",
      });

    } catch (error) {
      console.error("Hasta silme hatası:", error);
      toast({
        title: "Hata",
        description: "Hasta silinirken bir hata oluştu.",
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
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Aktif";
      case "inactive":
        return "Pasif";
      default:
        return status;
    }
  };

  // Filtrelenmiş hastalar
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm) ||
                         patient.bloodType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.gender?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || patient.status === filterStatus;
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
      <AdminNavbar currentPage="patients" />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hasta Yönetimi</h1>
            <p className="text-gray-600">Tüm hastaları görüntüleyin ve yönetin</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={loadPatients}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const n = listAllUsers().length;
                toast({
                  title: "Bilgi",
                  description: `Demo kullanıcı sayısı: ${n}`,
                });
              }}
            >
              Kullanıcı Sayısı
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                demoCreateUser({
                  name: "Test Hasta " + Date.now(),
                  email: `test${Date.now()}@demo.local`,
                  phone: "555-0000",
                  role: "patient",
                  birthDate: "1990-01-01",
                  gender: "Erkek",
                  bloodType: "A+",
                });
                toast({ title: "Başarılı", description: "Test hasta demo listesine eklendi." });
                await loadPatients();
              }}
            >
              Test Hasta Ekle
            </Button>
          </div>
          <Dialog open={showPatientForm} onOpenChange={setShowPatientForm}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Yeni Hasta Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Yeni Hasta Kayıt</DialogTitle>
                <DialogDescription>
                  Hasta bilgilerini girin ve hesap oluşturun
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handlePatientSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patientName">Ad Soyad</Label>
                    <Input
                      id="patientName"
                      value={patientForm.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Hasta adı"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientEmail">E-posta</Label>
                    <Input
                      id="patientEmail"
                      type="email"
                      value={patientForm.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="hasta@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patientPhone">Telefon</Label>
                    <Input
                      id="patientPhone"
                      type="tel"
                      value={patientForm.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Telefon numarası"
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientBirthDate">Doğum Tarihi</Label>
                    <Input
                      id="patientBirthDate"
                      type="date"
                      value={patientForm.birthDate}
                      onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patientGender">Cinsiyet</Label>
                    <Select value={patientForm.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Cinsiyet seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Erkek">Erkek</SelectItem>
                        <SelectItem value="Kadın">Kadın</SelectItem>
                        <SelectItem value="Diğer">Diğer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="patientBloodType">Kan Grubu</Label>
                    <Select value={patientForm.bloodType} onValueChange={(value) => handleInputChange("bloodType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Kan grubu seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="patientPassword">Geçici Şifre</Label>
                  <div className="flex gap-2">
                    <Input
                      id="patientPassword"
                      type="password"
                      value={patientForm.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="En az 6 karakter"
                      minLength={6}
                      required
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={generatePassword}
                      className="whitespace-nowrap"
                    >
                      Otomatik Oluştur
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Hasta ilk girişte şifresini değiştirecek
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Kaydediliyor..." : "Hasta Kaydet"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowPatientForm(false)}
                  >
                    İptal
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Hasta Detay Modalı */}
        <Dialog open={showPatientView} onOpenChange={setShowPatientView}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Hasta Detayları</DialogTitle>
              <DialogDescription>
                {selectedPatient?.name} adlı hastanın detaylı bilgileri
              </DialogDescription>
            </DialogHeader>
            {selectedPatient && (
              <div className="space-y-6">
                {/* Temel Bilgiler */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Ad Soyad</Label>
                    <p className="text-lg font-semibold">{selectedPatient.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Hasta ID</Label>
                    <p className="text-sm text-gray-600">{selectedPatient.id}</p>
                  </div>
                </div>

                {/* Hızlı İstatistikler */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedPatient.status === "active" ? "Aktif" : "Pasif"}
                        </div>
                        <p className="text-xs text-gray-500">Durum</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedPatient.bloodType || "N/A"}
                        </div>
                        <p className="text-xs text-gray-500">Kan Grubu</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedPatient.gender || "N/A"}
                        </div>
                        <p className="text-xs text-gray-500">Cinsiyet</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* İletişim Bilgileri */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold border-b pb-2">İletişim Bilgileri</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">E-posta</Label>
                      <p className="text-sm">{selectedPatient.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Telefon</Label>
                      <p className="text-sm">{selectedPatient.phone || "Belirtilmemiş"}</p>
                    </div>
                  </div>
                </div>

                {/* Kişisel Bilgiler */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold border-b pb-2">Kişisel Bilgiler</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Doğum Tarihi</Label>
                      <p className="text-sm">
                        {selectedPatient.birthDate 
                          ? new Date(selectedPatient.birthDate).toLocaleDateString('tr-TR')
                          : "Belirtilmemiş"
                        }
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Cinsiyet</Label>
                      <p className="text-sm">{selectedPatient.gender || "Belirtilmemiş"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Kan Grubu</Label>
                      <p className="text-sm">{selectedPatient.bloodType || "Belirtilmemiş"}</p>
                    </div>
                  </div>
                </div>

                {/* Hesap Bilgileri */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold border-b pb-2">Hesap Bilgileri</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Durum</Label>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(selectedPatient.status)}>
                          {getStatusText(selectedPatient.status)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            handleToggleStatus(selectedPatient);
                            setShowPatientView(false);
                          }}
                        >
                          {selectedPatient.status === "active" ? "Pasif Yap" : "Aktif Yap"}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Kayıt Tarihi</Label>
                      <p className="text-sm">
                        {selectedPatient.createdAt 
                          ? (selectedPatient.createdAt?.toDate?.() || new Date(selectedPatient.createdAt)).toLocaleDateString('tr-TR')
                          : "Belirtilmemiş"
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* İşlemler */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold border-b pb-2">İşlemler</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleEditPatient(selectedPatient);
                        setShowPatientView(false);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Düzenle
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (confirm("Bu hastayı silmek istediğinizden emin misiniz?")) {
                          handleDeletePatient(selectedPatient.id);
                          setShowPatientView(false);
                        }
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Sil
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Kopyala butonu
                        const patientInfo = `
Hasta Bilgileri:
Ad Soyad: ${selectedPatient.name}
E-posta: ${selectedPatient.email}
Telefon: ${selectedPatient.phone || "Belirtilmemiş"}
Doğum Tarihi: ${selectedPatient.birthDate ? new Date(selectedPatient.birthDate).toLocaleDateString('tr-TR') : "Belirtilmemiş"}
Cinsiyet: ${selectedPatient.gender || "Belirtilmemiş"}
Kan Grubu: ${selectedPatient.bloodType || "Belirtilmemiş"}
Durum: ${getStatusText(selectedPatient.status)}
Kayıt Tarihi: ${selectedPatient.createdAt ? (selectedPatient.createdAt?.toDate?.() || new Date(selectedPatient.createdAt)).toLocaleDateString('tr-TR') : "Belirtilmemiş"}
                        `;
                        navigator.clipboard.writeText(patientInfo);
                        toast({
                          title: "Başarılı",
                          description: "Hasta bilgileri panoya kopyalandı.",
                        });
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Kopyala
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Hasta Düzenleme Modalı */}
        <Dialog open={showPatientEdit} onOpenChange={setShowPatientEdit}>
          <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Hasta Düzenle</DialogTitle>
              <DialogDescription>
                {selectedPatient?.name} hasta bilgilerini düzenleyin
              </DialogDescription>
            </DialogHeader>
            
            {selectedPatient && (
              <form onSubmit={handleUpdatePatient} className="space-y-4">
                {/* Mevcut Bilgiler */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Mevcut Bilgiler</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><strong>ID:</strong> {selectedPatient.id}</p>
                    <p><strong>Durum:</strong> {getStatusText(selectedPatient.status)}</p>
                    <p><strong>Kayıt Tarihi:</strong> {selectedPatient.createdAt ? (selectedPatient.createdAt?.toDate?.() || new Date(selectedPatient.createdAt)).toLocaleDateString('tr-TR') : "Belirtilmemiş"}</p>
                  </div>
                </div>

                {/* Uyarı */}
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Dikkat:</strong> Şifre güvenlik nedeniyle düzenlenemez. Şifre değişikliği için hasta ile iletişime geçin.
                  </p>
                </div>

                {/* Form Alanları */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Ad Soyad *</Label>
                    <Input
                      id="edit-name"
                      value={patientForm.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">E-posta *</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={patientForm.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-phone">Telefon *</Label>
                    <Input
                      id="edit-phone"
                      value={patientForm.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-birthDate">Doğum Tarihi</Label>
                    <Input
                      id="edit-birthDate"
                      type="date"
                      value={patientForm.birthDate}
                      onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-gender">Cinsiyet</Label>
                    <Select value={patientForm.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Cinsiyet seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Erkek">Erkek</SelectItem>
                        <SelectItem value="Kadın">Kadın</SelectItem>
                        <SelectItem value="Diğer">Diğer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-bloodType">Kan Grubu</Label>
                    <Select value={patientForm.bloodType} onValueChange={(value) => handleInputChange("bloodType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Kan grubu seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="0+">0+</SelectItem>
                        <SelectItem value="0-">0-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Butonlar */}
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowPatientEdit(false);
                      setSelectedPatient(null);
                      setPatientForm({
                        name: "",
                        email: "",
                        phone: "",
                        birthDate: "",
                        gender: "",
                        bloodType: "",
                        password: ""
                      });
                    }}
                    className="flex-1"
                  >
                    İptal
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (selectedPatient) {
                        setPatientForm({
                          name: selectedPatient.name,
                          email: selectedPatient.email,
                          phone: selectedPatient.phone,
                          birthDate: selectedPatient.birthDate || "",
                          gender: selectedPatient.gender || "",
                          bloodType: selectedPatient.bloodType || "",
                          password: ""
                        });
                      }
                    }}
                    className="flex-1"
                  >
                    Sıfırla
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? "Güncelleniyor..." : "Güncelle"}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Hasta adı, email veya telefon ara..."
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
              variant={filterStatus === "inactive" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("inactive")}
            >
              Pasif
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Hasta</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{patients.length}</div>
              <p className="text-xs text-muted-foreground">
                Kayıtlı hasta sayısı
              </p>
              {loading && (
                <div className="mt-2">
                  <div className="animate-pulse bg-gray-200 h-2 rounded"></div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Hasta</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {patients.filter(p => p.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Aktif hasta sayısı
              </p>
              {loading && (
                <div className="mt-2">
                  <div className="animate-pulse bg-gray-200 h-2 rounded"></div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bu Ay Kayıt</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {patients.filter(p => {
                  try {
                    const createdDate = p.createdAt?.toDate?.() || new Date(p.createdAt);
                    const now = new Date();
                    return createdDate.getMonth() === now.getMonth() && 
                           createdDate.getFullYear() === now.getFullYear();
                  } catch (error) {
                    console.error("Tarih işleme hatası:", error);
                    return false;
                  }
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Bu ay kayıt olan
              </p>
              {loading && (
                <div className="mt-2">
                  <div className="animate-pulse bg-gray-200 h-2 rounded"></div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pasif Hasta</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {patients.filter(p => p.status === "inactive").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Pasif hasta sayısı
              </p>
              {loading && (
                <div className="mt-2">
                  <div className="animate-pulse bg-gray-200 h-2 rounded"></div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Patients List */}
        <Card>
          <CardHeader>
            <CardTitle>Hasta Listesi</CardTitle>
            <CardDescription>
              Tüm hastaların detaylı listesi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Hastalar Yükleniyor...
                  </h3>
                  <p className="text-gray-500">
                    Demo hasta verileri yükleniyor
                  </p>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Hasta Bulunamadı
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm || filterStatus !== "all" 
                      ? "Arama kriterlerinize uygun hasta bulunamadı."
                      : "Henüz hasta kaydı bulunmuyor."
                    }
                  </p>
                  {!searchTerm && filterStatus === "all" && (
                    <div className="mt-4">
                      <Button
                        onClick={async () => {
                          try {
                            demoCreateUser({
                              name: "Örnek Hasta",
                              email: `ornek${Date.now()}@demo.local`,
                              phone: "555-0000",
                              birthDate: "1990-01-01",
                              gender: "Kadın",
                              bloodType: "B+",
                              role: "patient",
                            });
                            toast({
                              title: "Başarılı",
                              description: "Örnek hasta eklendi.",
                            });
                            await loadPatients();
                          } catch (error) {
                            console.error("Örnek hasta ekleme hatası:", error);
                            toast({
                              title: "Hata",
                              description: "Örnek hasta eklenirken hata oluştu.",
                              variant: "destructive",
                            });
                          }
                        }}
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Örnek Hasta Ekle
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
                        <th className="text-left py-3 px-4 font-medium">İletişim</th>
                        <th className="text-left py-3 px-4 font-medium">Bilgiler</th>
                        <th className="text-left py-3 px-4 font-medium">Durum</th>
                        <th className="text-left py-3 px-4 font-medium">Kayıt Tarihi</th>
                        <th className="text-left py-3 px-4 font-medium">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.map((patient) => (
                        <tr key={patient.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{patient.name}</div>
                              <div className="text-sm text-gray-500">ID: {patient.id}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <span className="text-sm">{patient.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span className="text-sm">{patient.phone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="text-sm">
                                <span className="font-medium">Doğum:</span> {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('tr-TR') : "Belirtilmemiş"}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">Cinsiyet:</span> {patient.gender || "Belirtilmemiş"}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">Kan Grubu:</span> {patient.bloodType || "Belirtilmemiş"}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(patient.status)}>
                                {getStatusText(patient.status)}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(patient)}
                                className="h-6 px-2 text-xs"
                              >
                                {patient.status === "active" ? "Pasif Yap" : "Aktif Yap"}
                              </Button>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              {patient.createdAt 
                                ? (patient.createdAt instanceof Date 
                                    ? patient.createdAt.toLocaleDateString('tr-TR')
                                    : new Date(patient.createdAt.seconds * 1000).toLocaleDateString('tr-TR')
                                  )
                                : "Tarih yok"
                              }
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleViewPatient(patient)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Görüntüle
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditPatient(patient)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Düzenle
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeletePatient(patient.id)}
                                className="text-red-600 hover:text-red-700"
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
      </main>
    </div>
  );
};

export default AdminPatients; 