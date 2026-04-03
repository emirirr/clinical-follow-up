import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Stethoscope, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  Save, 
  X,
  Activity,
  FileText,
  Shield,
  Building,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DoctorNavbar from "@/components/DoctorNavbar";
import { getDoctorRecordForAuthUid, updateDoctorProfile } from "@/services/doctorService";

interface DoctorProfile {
  id: string;
  userId: string;
  email: string;
  name: string;
  phone: string;
  department: string;
  specialty: string;
  status: "active" | "inactive";
  createdAt: any;
  updatedAt: any;
}

const DoctorProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    department: "",
    specialty: ""
  });

  // Verileri yükle
  useEffect(() => {
    if (user) {
      loadDoctorProfile();
    }
  }, [user]);

  const loadDoctorProfile = async () => {
    try {
      setLoading(true);
      const record = await getDoctorRecordForAuthUid(user!.uid);
      if (!record) {
        toast({
          title: "Hata",
          description: "Doktor profili bulunamadı.",
          variant: "destructive",
        });
        return;
      }
      const profile: DoctorProfile = {
        id: record.id,
        userId: record.userId,
        email: record.email,
        name: record.name,
        phone: record.phone || "",
        department: record.department || "",
        specialty: record.specialty || "",
        status: record.status || "active",
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      };
      setDoctorProfile(profile);
      setEditForm({
        name: profile.name,
        phone: profile.phone,
        department: profile.department,
        specialty: profile.specialty,
      });
      toast({
        title: "Başarılı",
        description: "Profil bilgileri yüklendi.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Bilinmeyen hata";
      toast({
        title: "Hata",
        description: `Profil yüklenirken hata oluştu: ${message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (!doctorProfile) {
        toast({
          title: "Hata",
          description: "Profil bilgileri bulunamadı.",
          variant: "destructive",
        });
        return;
      }
      await updateDoctorProfile(doctorProfile.id, {
        name: editForm.name,
        phone: editForm.phone,
        department: editForm.department,
        specialty: editForm.specialty,
      });
      await loadDoctorProfile();
      setIsEditing(false);
      toast({
        title: "Başarılı",
        description: "Profil (demo) güncellendi.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Bilinmeyen hata";
      toast({
        title: "Hata",
        description: `Profil güncellenirken hata oluştu: ${message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (doctorProfile) {
      setEditForm({
        name: doctorProfile.name,
        phone: doctorProfile.phone,
        department: doctorProfile.department,
        specialty: doctorProfile.specialty
      });
    }
    setIsEditing(false);
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
      
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profilim</h1>
          <p className="text-gray-600 mt-2">
            Profil bilgilerinizi görüntüleyin ve düzenleyin
          </p>
        </div>

        {doctorProfile && (
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Doktor Bilgileri
                </CardTitle>
                <CardDescription>
                  Kişisel ve mesleki bilgileriniz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar and Basic Info */}
                <div className="flex items-center space-x-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-lg">
                      {doctorProfile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">{doctorProfile.name}</h2>
                        <p className="text-gray-600">{doctorProfile.email}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={doctorProfile.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {doctorProfile.status === "active" ? "Aktif" : "Pasif"}
                        </Badge>
                        
                        {!isEditing && (
                          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Düzenle
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Ad Soyad</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{doctorProfile.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <p className="mt-1 text-gray-900">{doctorProfile.email}</p>
                    <p className="text-sm text-gray-500">Email adresi değiştirilemez</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="mt-1"
                        placeholder="+90 555 123 4567"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{doctorProfile.phone || "Belirtilmemiş"}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="department">Departman</Label>
                    {isEditing ? (
                      <Input
                        id="department"
                        value={editForm.department}
                        onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                        className="mt-1"
                        placeholder="Kardiyoloji"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{doctorProfile.department || "Belirtilmemiş"}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="specialty">Uzmanlık</Label>
                    {isEditing ? (
                      <Input
                        id="specialty"
                        value={editForm.specialty}
                        onChange={(e) => setEditForm(prev => ({ ...prev, specialty: e.target.value }))}
                        className="mt-1"
                        placeholder="Kardiyoloji Uzmanı"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{doctorProfile.specialty || "Belirtilmemiş"}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label>Kayıt Tarihi</Label>
                    <p className="mt-1 text-gray-900">
                      {doctorProfile.createdAt?.toDate?.()?.toLocaleDateString('tr-TR') || 
                       new Date(doctorProfile.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      İptal
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? "Kaydediliyor..." : "Kaydet"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  İstatistikler
                </CardTitle>
                <CardDescription>
                  Mesleki performansınız
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-600">Toplam Hasta</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-600">Toplam Randevu</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">0</div>
                    <div className="text-sm text-gray-600">Toplam Reçete</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorProfile; 