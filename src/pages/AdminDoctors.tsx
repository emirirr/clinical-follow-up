import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Stethoscope, 
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
  Building,
  RefreshCw,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminNavbar from "@/components/AdminNavbar";
import { collection, getDocs, query, where, orderBy, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { saveUserProfile, type UserRole } from "@/services/userService";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  specialty: string;
  createdAt: any;
  status: "active" | "inactive";
  role: string;
  userId: string;
  appointmentCount?: number;
}

interface DoctorFormData {
  name: string;
  email: string;
  phone: string;
  department: string;
  specialty: string;
  password: string;
}

const AdminDoctors = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [showDoctorView, setShowDoctorView] = useState(false);
  const [showDoctorEdit, setShowDoctorEdit] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [doctorForm, setDoctorForm] = useState<DoctorFormData>({
    name: "",
    email: "",
    phone: "",
    department: "",
    specialty: "",
    password: ""
  });

  // Firebase'den doktor verilerini yükle
  const loadDoctors = async () => {
    try {
      setLoading(true);
      
      console.log("Firebase'den doktorlar yükleniyor...");
      
      // Firestore'dan doktor verilerini çek
      const usersRef = collection(db, "users");
      const allUsersQuery = query(usersRef);
      const allUsersSnapshot = await getDocs(allUsersQuery);
      
      console.log("Toplam kullanıcı sayısı:", allUsersSnapshot.docs.length);
      
      // Sadece doktorları filtrele
      const doctorsData: Doctor[] = allUsersSnapshot.docs
        .filter(doc => {
          const data = doc.data();
          return data.role === "doctor";
        })
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId || doc.id,
            name: data.name || "İsimsiz Doktor",
            email: data.email || "",
            phone: data.phone || "",
            department: data.department || "",
            specialty: data.specialty || "",
            status: data.status || "active",
            role: data.role || "doctor",
            createdAt: data.createdAt || new Date(),
            appointmentCount: data.appointmentCount || 0
          };
        });
      
      console.log("Filtrelenmiş doktor sayısı:", doctorsData.length);
      console.log("Doktor verileri:", doctorsData);
      
      setDoctors(doctorsData);
      
      toast({
        title: "Başarılı",
        description: `${doctorsData.length} doktor yüklendi.`,
      });
      
    } catch (error) {
      console.error("Doktorlar yüklenirken hata:", error);
      console.error("Hata detayları:", {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      toast({
        title: "Hata",
        description: "Doktor verileri yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Component mount olduğunda doktorları yükle
  useEffect(() => {
    loadDoctors();
  }, []);

  // Doktor ekleme
  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Firebase Auth ile kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        doctorForm.email,
        doctorForm.password
      );
      
      // Firestore'a doktor profilini kaydet
      const doctorData = {
        userId: userCredential.user.uid,
        name: doctorForm.name,
        email: doctorForm.email,
        phone: doctorForm.phone,
        department: doctorForm.department,
        specialty: doctorForm.specialty,
        role: "doctor" as UserRole,
        status: "active",
        createdAt: new Date(),
        appointmentCount: 0
      };
      
      await addDoc(collection(db, "users"), doctorData);
      
      toast({
        title: "Başarılı",
        description: "Doktor başarıyla eklendi.",
      });
      
      // Formu temizle ve modalı kapat
      setDoctorForm({
        name: "",
        email: "",
        phone: "",
        department: "",
        specialty: "",
        password: ""
      });
      setShowDoctorForm(false);
      
      // Doktor listesini yenile
      await loadDoctors();
      
    } catch (error) {
      console.error("Doktor ekleme hatası:", error);
      toast({
        title: "Hata",
        description: "Doktor eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Form input değişiklikleri
  const handleInputChange = (field: keyof DoctorFormData, value: string) => {
    setDoctorForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Şifre oluşturma
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    handleInputChange("password", password);
  };

  // Doktor görüntüleme
  const handleViewDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowDoctorView(true);
  };

  // Doktor düzenleme
  const handleEditDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setDoctorForm({
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      department: doctor.department,
      specialty: doctor.specialty,
      password: ""
    });
    setShowDoctorEdit(true);
  };

  // Doktor güncelleme
  const handleUpdateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDoctor) return;
    
    try {
      setLoading(true);
      
      // Firestore'da doktor bilgilerini güncelle
      await updateDoc(doc(db, "users", selectedDoctor.id), {
        name: doctorForm.name,
        email: doctorForm.email,
        phone: doctorForm.phone,
        department: doctorForm.department,
        specialty: doctorForm.specialty,
        updatedAt: new Date()
      });
      
      toast({
        title: "Başarılı",
        description: "Doktor bilgileri başarıyla güncellendi.",
      });
      
      // Formu temizle ve modalı kapat
      setDoctorForm({
        name: "",
        email: "",
        phone: "",
        department: "",
        specialty: "",
        password: ""
      });
      setShowDoctorEdit(false);
      setSelectedDoctor(null);
      
      // Doktor listesini yenile
      await loadDoctors();
      
    } catch (error) {
      console.error("Doktor güncelleme hatası:", error);
      toast({
        title: "Hata",
        description: "Doktor güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Doktor silme
  const handleDeleteDoctor = async (doctorId: string) => {
    if (!confirm("Bu doktoru silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      setLoading(true);
      
      // Firestore'dan doktor kaydını sil
      await deleteDoc(doc(db, "users", doctorId));
      
      // Doktor listesini yenile
      await loadDoctors();

      toast({
        title: "Başarılı",
        description: "Doktor başarıyla silindi.",
      });

    } catch (error) {
      console.error("Doktor silme hatası:", error);
      toast({
        title: "Hata",
        description: "Doktor silinirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Doktor durumu değiştirme
  const handleToggleStatus = async (doctor: Doctor) => {
    const newStatus = doctor.status === "active" ? "inactive" : "active";
    
    try {
      setLoading(true);
      
      // Firestore'da doktor durumunu güncelle
      await updateDoc(doc(db, "users", doctor.id), {
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Doktor listesini yenile
      await loadDoctors();

      toast({
        title: "Başarılı",
        description: `${doctor.name} durumu ${newStatus === "active" ? "aktif" : "pasif"} olarak güncellendi.`,
      });

    } catch (error) {
      console.error("Doktor durumu güncelleme hatası:", error);
      toast({
        title: "Hata",
        description: "Doktor durumu güncellenirken bir hata oluştu.",
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

  // Filtrelenmiş doktorlar
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || doctor.status === filterStatus;
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
      <AdminNavbar currentPage="doctors" />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Doktor Yönetimi</h1>
            <p className="text-gray-600">Tüm doktorları görüntüleyin ve yönetin</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={loadDoctors}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
            <Button 
              variant="outline" 
              onClick={async () => {
                // Test doktor ekle
                try {
                  console.log("Test doktor ekleniyor...");
                  const testDoctor = {
                    name: "Dr. Test " + new Date().getTime(),
                    email: "test" + new Date().getTime() + "@klinik.com",
                    phone: "+90 555-" + Math.floor(Math.random() * 10000),
                    department: "Test Bölümü",
                    specialty: "Test Uzmanı",
                    role: "doctor",
                    status: "active",
                    createdAt: new Date(),
                    userId: "test-" + new Date().getTime(),
                    appointmentCount: 0
                  };
                  
                  console.log("Test doktor verisi:", testDoctor);
                  const docRef = await addDoc(collection(db, "users"), testDoctor);
                  console.log("Test doktor eklendi, doc ID:", docRef.id);
                  
                  toast({
                    title: "Başarılı",
                    description: "Test doktor eklendi.",
                  });
                  
                  setTimeout(() => {
                    loadDoctors();
                  }, 1000);
                  
                } catch (error) {
                  console.error("Test doktor ekleme hatası:", error);
                  toast({
                    title: "Hata",
                    description: "Test doktor eklenirken hata oluştu.",
                    variant: "destructive",
                  });
                }
              }}
            >
              Test Doktor Ekle
            </Button>
                          <Dialog open={showDoctorForm} onOpenChange={setShowDoctorForm}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Doktor
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Yeni Doktor Kayıt</DialogTitle>
                    <DialogDescription>
                      Doktor bilgilerini girin ve hesap oluşturun
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleDoctorSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="doctorName">Ad Soyad</Label>
                        <Input
                          id="doctorName"
                          value={doctorForm.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Doktor adı"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="doctorEmail">E-posta</Label>
                        <Input
                          id="doctorEmail"
                          type="email"
                          value={doctorForm.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="doktor@klinik.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="doctorPhone">Telefon</Label>
                        <Input
                          id="doctorPhone"
                          type="tel"
                          value={doctorForm.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="Telefon numarası"
                        />
                      </div>
                      <div>
                        <Label htmlFor="doctorDepartment">Bölüm</Label>
                        <Select value={doctorForm.department} onValueChange={(value) => handleInputChange("department", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Bölüm seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Kardiyoloji">Kardiyoloji</SelectItem>
                            <SelectItem value="Nöroloji">Nöroloji</SelectItem>
                            <SelectItem value="Ortopedi">Ortopedi</SelectItem>
                            <SelectItem value="Dahiliye">Dahiliye</SelectItem>
                            <SelectItem value="Cerrahi">Cerrahi</SelectItem>
                            <SelectItem value="Pediatri">Pediatri</SelectItem>
                            <SelectItem value="Kadın Doğum">Kadın Doğum</SelectItem>
                            <SelectItem value="Göz">Göz</SelectItem>
                            <SelectItem value="Kulak Burun Boğaz">Kulak Burun Boğaz</SelectItem>
                            <SelectItem value="Dermatoloji">Dermatoloji</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="doctorSpecialty">Uzmanlık</Label>
                      <Input
                        id="doctorSpecialty"
                        value={doctorForm.specialty}
                        onChange={(e) => handleInputChange("specialty", e.target.value)}
                        placeholder="Uzmanlık alanı"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="doctorPassword">Şifre</Label>
                      <div className="flex gap-2">
                        <Input
                          id="doctorPassword"
                          type="password"
                          value={doctorForm.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          placeholder="Şifre"
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
                        Doktor ilk girişte şifresini değiştirecek
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" disabled={loading} className="flex-1">
                        {loading ? "Kaydediliyor..." : "Doktor Kaydet"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowDoctorForm(false)}
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
                placeholder="Doktor adı, email, bölüm veya uzmanlık ara..."
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
              <CardTitle className="text-sm font-medium">Toplam Doktor</CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{doctors.length}</div>
              <p className="text-xs text-muted-foreground">
                Kayıtlı doktor sayısı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Doktor</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {doctors.filter(d => d.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Aktif doktor sayısı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bu Ay Kayıt</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {doctors.filter(d => {
                  const createdDate = new Date(d.createdAt);
                  const now = new Date();
                  return createdDate.getMonth() === now.getMonth() && 
                         createdDate.getFullYear() === now.getFullYear();
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Bu ay kayıt olan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Randevu</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {doctors.reduce((total, doctor) => total + doctor.appointmentCount, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Bu ay toplam randevu
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Doctors List */}
        <Card>
          <CardHeader>
            <CardTitle>Doktor Listesi</CardTitle>
            <CardDescription>
              Tüm doktorların detaylı listesi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDoctors.length === 0 ? (
                <div className="text-center py-8">
                  <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Doktor Bulunamadı
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm || filterStatus !== "all" 
                      ? "Arama kriterlerinize uygun doktor bulunamadı."
                      : "Henüz doktor kaydı bulunmuyor."
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Doktor</th>
                        <th className="text-left py-3 px-4 font-medium">İletişim</th>
                        <th className="text-left py-3 px-4 font-medium">Uzmanlık</th>
                        <th className="text-left py-3 px-4 font-medium">Durum</th>
                        <th className="text-left py-3 px-4 font-medium">Randevu</th>
                        <th className="text-left py-3 px-4 font-medium">Kayıt Tarihi</th>
                        <th className="text-left py-3 px-4 font-medium">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDoctors.map((doctor) => (
                        <tr key={doctor.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{doctor.name}</div>
                              <div className="text-sm text-gray-500">ID: {doctor.id}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <span className="text-sm">{doctor.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span className="text-sm">{doctor.phone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Building className="h-3 w-3 text-gray-400" />
                                <span className="text-sm font-medium">{doctor.department}</span>
                              </div>
                              <div className="text-sm text-gray-600">
                                {doctor.specialty}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(doctor.status)}>
                              {getStatusText(doctor.status)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              <span className="font-medium">{doctor.appointmentCount}</span> randevu
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              {new Date(doctor.createdAt).toLocaleDateString('tr-TR')}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleViewDoctor(doctor)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Görüntüle
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditDoctor(doctor)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Düzenle
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteDoctor(doctor.id)}
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

        {/* Doktor Detay Modalı */}
        <Dialog open={showDoctorView} onOpenChange={setShowDoctorView}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Doktor Detayları</DialogTitle>
              <DialogDescription>
                {selectedDoctor?.name} adlı doktorun detaylı bilgileri
              </DialogDescription>
            </DialogHeader>
            {selectedDoctor && (
              <div className="space-y-6">
                {/* Temel Bilgiler */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Ad Soyad</Label>
                    <p className="text-lg font-semibold">{selectedDoctor.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Doktor ID</Label>
                    <p className="text-sm text-gray-600">{selectedDoctor.id}</p>
                  </div>
                </div>

                {/* Hızlı İstatistikler */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedDoctor.status === "active" ? "Aktif" : "Pasif"}
                        </div>
                        <p className="text-xs text-gray-500">Durum</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedDoctor.department || "N/A"}
                        </div>
                        <p className="text-xs text-gray-500">Bölüm</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedDoctor.appointmentCount || 0}
                        </div>
                        <p className="text-xs text-gray-500">Randevu</p>
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
                      <p className="text-sm">{selectedDoctor.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Telefon</Label>
                      <p className="text-sm">{selectedDoctor.phone || "Belirtilmemiş"}</p>
                    </div>
                  </div>
                </div>

                {/* Uzmanlık Bilgileri */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold border-b pb-2">Uzmanlık Bilgileri</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Bölüm</Label>
                      <p className="text-sm">{selectedDoctor.department || "Belirtilmemiş"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Uzmanlık</Label>
                      <p className="text-sm">{selectedDoctor.specialty || "Belirtilmemiş"}</p>
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
                        <Badge className={getStatusColor(selectedDoctor.status)}>
                          {getStatusText(selectedDoctor.status)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            handleToggleStatus(selectedDoctor);
                            setShowDoctorView(false);
                          }}
                        >
                          {selectedDoctor.status === "active" ? "Pasif Yap" : "Aktif Yap"}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Kayıt Tarihi</Label>
                      <p className="text-sm">
                        {selectedDoctor.createdAt 
                          ? (selectedDoctor.createdAt?.toDate?.() || new Date(selectedDoctor.createdAt)).toLocaleDateString('tr-TR')
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
                        handleEditDoctor(selectedDoctor);
                        setShowDoctorView(false);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Düzenle
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (confirm("Bu doktoru silmek istediğinizden emin misiniz?")) {
                          handleDeleteDoctor(selectedDoctor.id);
                          setShowDoctorView(false);
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
                        const doctorInfo = `
Doktor Bilgileri:
Ad Soyad: ${selectedDoctor.name}
E-posta: ${selectedDoctor.email}
Telefon: ${selectedDoctor.phone || "Belirtilmemiş"}
Bölüm: ${selectedDoctor.department || "Belirtilmemiş"}
Uzmanlık: ${selectedDoctor.specialty || "Belirtilmemiş"}
Durum: ${getStatusText(selectedDoctor.status)}
Kayıt Tarihi: ${selectedDoctor.createdAt ? (selectedDoctor.createdAt?.toDate?.() || new Date(selectedDoctor.createdAt)).toLocaleDateString('tr-TR') : "Belirtilmemiş"}
                        `;
                        navigator.clipboard.writeText(doctorInfo);
                        toast({
                          title: "Başarılı",
                          description: "Doktor bilgileri panoya kopyalandı.",
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

        {/* Doktor Düzenleme Modalı */}
        <Dialog open={showDoctorEdit} onOpenChange={setShowDoctorEdit}>
          <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                <DialogTitle>Doktor Düzenle</DialogTitle>
                <DialogDescription>
                  {selectedDoctor?.name} adlı doktorun bilgilerini güncelleyin
                </DialogDescription>
              </DialogHeader>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm text-blue-700">
                    Sadece değiştirmek istediğiniz alanları güncelleyin. Boş bırakılan alanlar mevcut değerlerini koruyacaktır.
                  </p>
                </div>
              </div>
            {selectedDoctor && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Mevcut Bilgiler</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Ad Soyad:</span>
                    <p className="font-medium">{selectedDoctor.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">E-posta:</span>
                    <p className="font-medium">{selectedDoctor.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Telefon:</span>
                    <p className="font-medium">{selectedDoctor.phone || "Belirtilmemiş"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Bölüm:</span>
                    <p className="font-medium">{selectedDoctor.department || "Belirtilmemiş"}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Uzmanlık:</span>
                    <p className="font-medium">{selectedDoctor.specialty || "Belirtilmemiş"}</p>
                  </div>
                </div>
              </div>
            )}
            <form onSubmit={handleUpdateDoctor} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editDoctorName">Ad Soyad</Label>
                  <Input
                    id="editDoctorName"
                    value={doctorForm.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Doktor adı"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editDoctorEmail">E-posta</Label>
                  <Input
                    id="editDoctorEmail"
                    type="email"
                    value={doctorForm.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="doktor@klinik.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editDoctorPhone">Telefon</Label>
                  <Input
                    id="editDoctorPhone"
                    type="tel"
                    value={doctorForm.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Telefon numarası"
                  />
                </div>
                <div>
                  <Label htmlFor="editDoctorDepartment">Bölüm</Label>
                  <Select value={doctorForm.department} onValueChange={(value) => handleInputChange("department", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Bölüm seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kardiyoloji">Kardiyoloji</SelectItem>
                      <SelectItem value="Nöroloji">Nöroloji</SelectItem>
                      <SelectItem value="Ortopedi">Ortopedi</SelectItem>
                      <SelectItem value="Dahiliye">Dahiliye</SelectItem>
                      <SelectItem value="Cerrahi">Cerrahi</SelectItem>
                      <SelectItem value="Pediatri">Pediatri</SelectItem>
                      <SelectItem value="Kadın Doğum">Kadın Doğum</SelectItem>
                      <SelectItem value="Göz">Göz</SelectItem>
                      <SelectItem value="Kulak Burun Boğaz">Kulak Burun Boğaz</SelectItem>
                      <SelectItem value="Dermatoloji">Dermatoloji</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="editDoctorSpecialty">Uzmanlık</Label>
                <Input
                  id="editDoctorSpecialty"
                  value={doctorForm.specialty}
                  onChange={(e) => handleInputChange("specialty", e.target.value)}
                  placeholder="Uzmanlık alanı"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Güncelleniyor..." : "Güncelle"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    if (selectedDoctor) {
                      setDoctorForm({
                        name: selectedDoctor.name,
                        email: selectedDoctor.email,
                        phone: selectedDoctor.phone,
                        department: selectedDoctor.department,
                        specialty: selectedDoctor.specialty,
                        password: ""
                      });
                    }
                  }}
                >
                  Sıfırla
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowDoctorEdit(false);
                    setSelectedDoctor(null);
                    setDoctorForm({
                      name: "",
                      email: "",
                      phone: "",
                      department: "",
                      specialty: "",
                      password: ""
                    });
                  }}
                >
                  İptal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminDoctors; 