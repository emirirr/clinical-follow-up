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
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  Save, 
  X,
  Heart,
  Activity,
  FileText,
  Shield,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPatientInfo, savePatientInfo, type PatientInfo as PatientInfoType } from "@/services/patientService";

// Local interface for form data
interface PatientFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  bloodType: string;
  gender: "male" | "female" | "other";
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory: string[];
  allergies: string[];
  currentMedications: string[];
}

const PatientProfile = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientInfo, setPatientInfo] = useState<PatientInfoType | null>(null);
  const [editForm, setEditForm] = useState<PatientFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    birthDate: "",
    bloodType: "",
    gender: "male",
    emergencyContact: {
      name: "",
      phone: "",
      relationship: ""
    },
    medicalHistory: [],
    allergies: [],
    currentMedications: []
  });

  // Debug için console logları
  useEffect(() => {
    console.log("PatientProfile component mounted");
    console.log("Auth loading:", authLoading);
    console.log("User:", user);
    console.log("User profile:", userProfile);
  }, [authLoading, user, userProfile]);

  // Hasta bilgilerini yükle
  useEffect(() => {
    const loadData = async () => {
      console.log("Loading patient data...");
      
      if (authLoading) {
        console.log("Auth still loading, waiting...");
        return;
      }

      if (!user) {
        console.log("No user, setting loading to false");
        setLoading(false);
        setError("Kullanıcı giriş yapmamış");
        return;
      }

      try {
        console.log("Loading patient info for user:", user.uid);
        setLoading(true);
        setError(null);
        
        const patient = await getPatientInfo(user.uid);
        console.log("Patient info loaded:", patient);
        
        if (patient) {
          setPatientInfo(patient);
          setEditForm({
            name: patient.name,
            email: patient.email,
            phone: patient.phone,
            address: patient.address,
            birthDate: patient.birthDate,
            bloodType: patient.bloodType,
            gender: patient.gender,
            emergencyContact: patient.emergencyContact,
            medicalHistory: patient.medicalHistory,
            allergies: patient.allergies,
            currentMedications: patient.currentMedications
          });
        } else {
          console.log("No patient info found, using default values");
          setEditForm({
            name: user.displayName || "",
            email: user.email || "",
            phone: "",
            address: "",
            birthDate: "",
            bloodType: "",
            gender: "male",
            emergencyContact: {
              name: "",
              phone: "",
              relationship: ""
            },
            medicalHistory: [],
            allergies: [],
            currentMedications: []
          });
        }
      } catch (error: any) {
        console.error("Error loading patient info:", error);
        setError(`Hasta bilgileri yüklenemedi: ${error.message}`);
        
        // Hata durumunda varsayılan değerlerle devam et
        setEditForm({
          name: user.displayName || "",
          email: user.email || "",
          phone: "",
          address: "",
          birthDate: "",
          bloodType: "",
          gender: "male",
          emergencyContact: {
            name: "",
            phone: "",
            relationship: ""
          },
          medicalHistory: [],
          allergies: [],
          currentMedications: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, authLoading]);

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Hata",
        description: "Kullanıcı giriş yapmamış",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Saving patient info...");
      setLoading(true);
      
      const patientData = {
        userId: user.uid,
        ...editForm
      };
      
      const patientId = await savePatientInfo(patientData);
      console.log("Patient info saved, ID:", patientId);
      
      toast({
        title: "Başarılı",
        description: "Hasta bilgileri başarıyla güncellendi.",
      });
      
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error saving patient info:", error);
      toast({
        title: "Hata",
        description: `Hasta bilgileri kaydedilemedi: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (patientInfo) {
      setEditForm({
        name: patientInfo.name,
        email: patientInfo.email,
        phone: patientInfo.phone,
        address: patientInfo.address,
        birthDate: patientInfo.birthDate,
        bloodType: patientInfo.bloodType,
        gender: patientInfo.gender,
        emergencyContact: patientInfo.emergencyContact,
        medicalHistory: patientInfo.medicalHistory,
        allergies: patientInfo.allergies,
        currentMedications: patientInfo.currentMedications
      });
    }
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof PatientFormData, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEmergencyContactChange = (field: keyof PatientFormData['emergencyContact'], value: string) => {
    setEditForm(prev => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact, [field]: value }
    }));
  };

  // Loading durumu
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Kimlik doğrulama kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  // Kullanıcı giriş yapmamışsa
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Giriş Gerekli
            </CardTitle>
            <CardDescription>
              Profil sayfasını görüntülemek için giriş yapmanız gerekiyor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = "/login"}
              className="w-full"
            >
              Giriş Yap
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Hata
            </CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Sayfayı Yenile
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = "/login"}
                className="w-full"
              >
                Giriş Sayfasına Git
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading durumu
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Hasta bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Ana içerik
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Hasta Profili
              </h1>
              <Badge variant="secondary">Hasta</Badge>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </Button>
              ) : (
                <>
                  <Button onClick={handleSave} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Kaydet
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    İptal
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{editForm.name || "İsimsiz Hasta"}</CardTitle>
                    <CardDescription>{editForm.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{editForm.phone || "Telefon yok"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{editForm.address || "Adres yok"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{editForm.birthDate || "Doğum tarihi yok"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Kan Grubu: {editForm.bloodType || "Belirtilmemiş"}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Kişisel Bilgiler</CardTitle>
                <CardDescription>
                  Hasta bilgilerinizi güncelleyin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Ad Soyad</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      value={editForm.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Doğum Tarihi</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={editForm.birthDate}
                      onChange={(e) => handleInputChange("birthDate", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Kan Grubu</Label>
                    <Select
                      value={editForm.bloodType}
                      onValueChange={(value) => handleInputChange("bloodType", value)}
                      disabled={!isEditing}
                    >
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
                  <div className="space-y-2">
                    <Label htmlFor="gender">Cinsiyet</Label>
                    <Select
                      value={editForm.gender}
                      onValueChange={(value: "male" | "female" | "other") => handleInputChange("gender", value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Cinsiyet seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Erkek</SelectItem>
                        <SelectItem value="female">Kadın</SelectItem>
                        <SelectItem value="other">Diğer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adres</Label>
                  <Textarea
                    id="address"
                    value={editForm.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Acil Durum İletişim</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyName">Ad Soyad</Label>
                      <Input
                        id="emergencyName"
                        value={editForm.emergencyContact.name}
                        onChange={(e) => handleEmergencyContactChange("name", e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone">Telefon</Label>
                      <Input
                        id="emergencyPhone"
                        value={editForm.emergencyContact.phone}
                        onChange={(e) => handleEmergencyContactChange("phone", e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyRelationship">İlişki</Label>
                      <Input
                        id="emergencyRelationship"
                        value={editForm.emergencyContact.relationship}
                        onChange={(e) => handleEmergencyContactChange("relationship", e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile; 