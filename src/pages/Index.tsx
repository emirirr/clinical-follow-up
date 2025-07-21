import { useState } from "react";
import { RoleCard } from "@/components/RoleCard";
import { PatientCard } from "@/components/PatientCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, Stethoscope, Shield, Calendar, Users, Activity, Bell, FileText } from "lucide-react";
import medicalHero from "@/assets/medical-hero.jpg";

type UserRole = "admin" | "doctor" | "patient" | null;

const Index = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  if (selectedRole === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{ backgroundImage: `url(${medicalHero})` }}
          />
          <div className="relative container mx-auto px-4 py-24">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold mb-6 bg-gradient-medical bg-clip-text text-transparent">
                Klinik Takip Sistemi
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Modern sağlık hizmetleri için kapsamlı hasta ve randevu yönetim sistemi. 
                Doktorlar, hastalar ve yöneticiler için özel olarak tasarlanmış paneller.
              </p>
            </div>

            {/* Features Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Randevu Yönetimi</h3>
                <p className="text-sm text-muted-foreground">Akıllı randevu planlama ve takip</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Hasta Takibi</h3>
                <p className="text-sm text-muted-foreground">Detaylı hasta kayıtları ve geçmiş</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-success" />
                </div>
                <h3 className="font-semibold mb-2">Raporlama</h3>
                <p className="text-sm text-muted-foreground">Kapsamlı analiz ve raporlar</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-warning" />
                </div>
                <h3 className="font-semibold mb-2">Bildirimler</h3>
                <p className="text-sm text-muted-foreground">Otomatik hatırlatmalar</p>
              </div>
            </div>

            {/* Role Selection */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold mb-4">Giriş Yapın</h2>
              <p className="text-muted-foreground">Rolünüze uygun panele erişim sağlayın</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <RoleCard
                title="Admin"
                description="Sistem yönetimi ve genel kontrolör"
                icon={Shield}
                features={[
                  "Kullanıcı yönetimi",
                  "Sistem ayarları",
                  "Raporlar ve istatistikler",
                  "Klinik konfigürasyonu"
                ]}
                onSelect={() => setSelectedRole("admin")}
                gradient="bg-gradient-to-br from-primary to-primary-hover"
              />
              
              <RoleCard
                title="Doktor"
                description="Hasta muayenesi ve tedavi yönetimi"
                icon={Stethoscope}
                features={[
                  "Hasta kayıtları",
                  "Randevu yönetimi",
                  "Reçete yazma",
                  "Tedavi planları"
                ]}
                onSelect={() => setSelectedRole("doctor")}
                gradient="bg-gradient-to-br from-accent to-accent-hover"
              />
              
              <RoleCard
                title="Hasta"
                description="Kişisel sağlık takibi ve randevular"
                icon={UserCheck}
                features={[
                  "Randevu alma",
                  "Reçete görüntüleme",
                  "Test sonuçları",
                  "Doktor notları"
                ]}
                onSelect={() => setSelectedRole("patient")}
                gradient="bg-gradient-to-br from-success to-success/80"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard for selected role
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-primary">Klinik Sistemi</h1>
            <span className="text-muted-foreground">|</span>
            <span className="capitalize font-medium">
              {selectedRole === "admin" ? "Admin" : 
               selectedRole === "doctor" ? "Doktor" : "Hasta"} Paneli
            </span>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setSelectedRole(null)}
          >
            Çıkış Yap
          </Button>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 py-8">
        {selectedRole === "admin" && <AdminDashboard />}
        {selectedRole === "doctor" && <DoctorDashboard />}
        {selectedRole === "patient" && <PatientDashboard />}
      </main>
    </div>
  );
};

// Admin Dashboard Component
function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Hasta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">1,247</div>
            <p className="text-xs text-muted-foreground">
              +20.1% geçen aydan
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aktif Doktor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">12</div>
            <p className="text-xs text-muted-foreground">
              +2 yeni doktor
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bu Ay Randevu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">573</div>
            <p className="text-xs text-muted-foreground">
              +12% artış
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gelir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">₺45,231</div>
            <p className="text-xs text-muted-foreground">
              +7% geçen aydan
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Son Kayıt Olan Hastalar
            </CardTitle>
            <CardDescription>Bu hafta sisteme katılan yeni hastalar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Ayşe Yılmaz", date: "2 saat önce", phone: "0532-123-4567" },
                { name: "Mehmet Kaya", date: "5 saat önce", phone: "0533-987-6543" },
                { name: "Fatma Öz", date: "1 gün önce", phone: "0534-555-1234" }
              ].map((patient, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-sm text-muted-foreground">{patient.phone}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{patient.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Sistem Aktivitesi
            </CardTitle>
            <CardDescription>Son kullanıcı aktiviteleri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Dr. Özkan randevu oluşturdu", time: "10 dk önce" },
                { action: "Yeni hasta kaydı", time: "25 dk önce" },
                { action: "Reçete oluşturuldu", time: "1 saat önce" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <p className="text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Doctor Dashboard Component
function DoctorDashboard() {
  const patients = [
    {
      name: "Ayşe Yılmaz",
      age: 34,
      phone: "0532-123-4567",
      lastVisit: "15 Aralık 2024",
      nextAppointment: "22 Aralık 2024 14:30",
      status: "active" as const,
      urgency: "medium" as const
    },
    {
      name: "Mehmet Kaya", 
      age: 56,
      phone: "0533-987-6543",
      lastVisit: "10 Aralık 2024",
      nextAppointment: "20 Aralık 2024 10:00",
      status: "waiting" as const,
      urgency: "high" as const
    },
    {
      name: "Fatma Öz",
      age: 42,
      phone: "0534-555-1234", 
      lastVisit: "18 Aralık 2024",
      status: "completed" as const,
      urgency: "low" as const
    }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bugün Randevular</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">8</div>
            <p className="text-xs text-muted-foreground">3 hasta bekliyor</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bu Hafta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">32</div>
            <p className="text-xs text-muted-foreground">randevu tamamlandı</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Raporlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">5</div>
            <p className="text-xs text-muted-foreground">rapor onay bekliyor</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            Hastalarım
          </CardTitle>
          <CardDescription>Aktif hasta takip listesi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {patients.map((patient, index) => (
              <PatientCard key={index} {...patient} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Patient Dashboard Component  
function PatientDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sonraki Randevu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-primary">25 Ara 14:30</div>
            <p className="text-xs text-muted-foreground">Dr. Özkan ile</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aktif Reçete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-accent">2</div>
            <p className="text-xs text-muted-foreground">ilaç kullanımında</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Test Sonuçları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-success">Normal</div>
            <p className="text-xs text-muted-foreground">son tahlil</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Yaklaşan Randevular
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { doctor: "Dr. Özkan", date: "25 Aralık 2024", time: "14:30", type: "Kontrol" },
                { doctor: "Dr. Yıldız", date: "2 Ocak 2025", time: "10:00", type: "Tahlil" }
              ].map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{appointment.doctor}</p>
                    <p className="text-sm text-muted-foreground">{appointment.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{appointment.date}</p>
                    <p className="text-xs text-muted-foreground">{appointment.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Son Reçeteler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { medicine: "Aspirin 100mg", dosage: "Günde 1 defa", doctor: "Dr. Özkan" },
                { medicine: "Vitamin D3", dosage: "Haftada 1 defa", doctor: "Dr. Özkan" }
              ].map((prescription, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{prescription.medicine}</p>
                  <p className="text-sm text-muted-foreground">{prescription.dosage}</p>
                  <p className="text-xs text-muted-foreground">Yazan: {prescription.doctor}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Index;
