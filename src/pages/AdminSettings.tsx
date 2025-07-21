import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, 
  Bell, 
  Shield, 
  Database, 
  Users, 
  Calendar,
  Save,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  Key,
  Globe,
  Mail
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminNavbar from "@/components/AdminNavbar";

interface SystemSettings {
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicEmail: string;
  timezone: string;
  language: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordPolicy: string;
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: string;
    retentionDays: number;
  };
}

const AdminSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    clinicName: "Klinik Takip Sistemi",
    clinicAddress: "İstanbul, Türkiye",
    clinicPhone: "+90 212 555 0123",
    clinicEmail: "info@klinik.com",
    timezone: "Europe/Istanbul",
    language: "tr",
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordPolicy: "strong"
    },
    backup: {
      autoBackup: true,
      backupFrequency: "daily",
      retentionDays: 30
    }
  });

  useEffect(() => {
    // Simüle edilmiş veri yükleme
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simüle edilmiş kaydetme işlemi
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Başarılı",
        description: "Ayarlar başarıyla kaydedildi.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Ayarlar kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section: keyof SystemSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

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
      <AdminNavbar currentPage="settings" />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sistem Ayarları</h1>
            <p className="text-gray-600">Klinik sistem konfigürasyonu</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sıfırla
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Genel Ayarlar
              </CardTitle>
              <CardDescription>
                Klinik bilgileri ve temel ayarlar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="clinicName">Klinik Adı</Label>
                <Input
                  id="clinicName"
                  value={settings.clinicName}
                  onChange={(e) => setSettings(prev => ({ ...prev, clinicName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="clinicAddress">Adres</Label>
                <Input
                  id="clinicAddress"
                  value={settings.clinicAddress}
                  onChange={(e) => setSettings(prev => ({ ...prev, clinicAddress: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="clinicPhone">Telefon</Label>
                <Input
                  id="clinicPhone"
                  value={settings.clinicPhone}
                  onChange={(e) => setSettings(prev => ({ ...prev, clinicPhone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="clinicEmail">E-posta</Label>
                <Input
                  id="clinicEmail"
                  type="email"
                  value={settings.clinicEmail}
                  onChange={(e) => setSettings(prev => ({ ...prev, clinicEmail: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="timezone">Saat Dilimi</Label>
                <Select value={settings.timezone} onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Istanbul">İstanbul (UTC+3)</SelectItem>
                    <SelectItem value="Europe/London">Londra (UTC+0)</SelectItem>
                    <SelectItem value="America/New_York">New York (UTC-5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="language">Dil</Label>
                <Select value={settings.language} onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tr">Türkçe</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Bildirim Ayarları
              </CardTitle>
              <CardDescription>
                Sistem bildirimleri ve uyarılar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>E-posta Bildirimleri</Label>
                  <p className="text-sm text-gray-500">Önemli olaylar için e-posta gönder</p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => handleInputChange('notifications', 'email', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Bildirimleri</Label>
                  <p className="text-sm text-gray-500">Acil durumlar için SMS gönder</p>
                </div>
                <Switch
                  checked={settings.notifications.sms}
                  onCheckedChange={(checked) => handleInputChange('notifications', 'sms', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Bildirimleri</Label>
                  <p className="text-sm text-gray-500">Anlık push bildirimleri</p>
                </div>
                <Switch
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => handleInputChange('notifications', 'push', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Güvenlik Ayarları
              </CardTitle>
              <CardDescription>
                Sistem güvenliği ve erişim kontrolü
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>İki Faktörlü Doğrulama</Label>
                  <p className="text-sm text-gray-500">Ek güvenlik için 2FA</p>
                </div>
                <Switch
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => handleInputChange('security', 'twoFactorAuth', checked)}
                />
              </div>
              <div>
                <Label htmlFor="sessionTimeout">Oturum Zaman Aşımı (dakika)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="passwordPolicy">Şifre Politikası</Label>
                <Select value={settings.security.passwordPolicy} onValueChange={(value) => handleInputChange('security', 'passwordPolicy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weak">Zayıf (6 karakter)</SelectItem>
                    <SelectItem value="medium">Orta (8 karakter)</SelectItem>
                    <SelectItem value="strong">Güçlü (12 karakter)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Backup Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Yedekleme Ayarları
              </CardTitle>
              <CardDescription>
                Veri yedekleme ve geri yükleme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Otomatik Yedekleme</Label>
                  <p className="text-sm text-gray-500">Düzenli otomatik yedekleme</p>
                </div>
                <Switch
                  checked={settings.backup.autoBackup}
                  onCheckedChange={(checked) => handleInputChange('backup', 'autoBackup', checked)}
                />
              </div>
              <div>
                <Label htmlFor="backupFrequency">Yedekleme Sıklığı</Label>
                <Select value={settings.backup.backupFrequency} onValueChange={(value) => handleInputChange('backup', 'backupFrequency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Saatlik</SelectItem>
                    <SelectItem value="daily">Günlük</SelectItem>
                    <SelectItem value="weekly">Haftalık</SelectItem>
                    <SelectItem value="monthly">Aylık</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="retentionDays">Saklama Süresi (gün)</Label>
                <Input
                  id="retentionDays"
                  type="number"
                  value={settings.backup.retentionDays}
                  onChange={(e) => handleInputChange('backup', 'retentionDays', parseInt(e.target.value))}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Manuel Yedekleme
                </Button>
                <Button variant="outline" className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Geri Yükle
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Maintenance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Sistem Bakımı
              </CardTitle>
              <CardDescription>
                Sistem temizliği ve optimizasyon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Önbellek Temizle
                </Button>
                <Button variant="outline" className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sistem Yenile
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Database className="h-4 w-4 mr-2" />
                  Veritabanı Optimize Et
                </Button>
                <Button variant="outline" className="flex-1">
                  <Key className="h-4 w-4 mr-2" />
                  API Anahtarları
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Kullanıcı Yönetimi
              </CardTitle>
              <CardDescription>
                Kullanıcı izinleri ve rolleri
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Users className="h-4 w-4 mr-2" />
                  Kullanıcı Listesi
                </Button>
                <Button variant="outline" className="flex-1">
                  <Key className="h-4 w-4 mr-2" />
                  İzinler
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Aktivite Logları
                </Button>
                <Button variant="outline" className="flex-1">
                  <Shield className="h-4 w-4 mr-2" />
                  Güvenlik Logları
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings; 