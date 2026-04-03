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
import {
  getSystemSettings,
  saveSystemSettings,
  loadUsersForAdmin,
  loadActivityLogsForAdmin,
  loadSecurityLogsForAdmin,
  exportCollectionDemo,
} from "@/services/adminService";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

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
    clinicName: "Klinik Takip",
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
  const [showUserList, setShowUserList] = useState(false);
  const [showActivityLogs, setShowActivityLogs] = useState(false);
  const [showSecurityLogs, setShowSecurityLogs] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);

  // Firebase'den ayarları yükle
  const loadSettings = async () => {
    try {
      setLoading(true);
      
      const stored = await getSystemSettings();
      setSettings({
        clinicName: stored.clinicName || "Klinik Takip",
        clinicAddress: stored.clinicAddress || "İstanbul, Türkiye",
        clinicPhone: stored.clinicPhone || "+90 212 555 0123",
        clinicEmail: stored.clinicEmail || "info@klinik.com",
        timezone: stored.timezone || "Europe/Istanbul",
        language: stored.language || "tr",
        notifications: {
          email: stored.notifications?.email ?? true,
          sms: stored.notifications?.sms ?? false,
          push: stored.notifications?.push ?? true,
        },
        security: {
          twoFactorAuth: stored.security?.twoFactorAuth ?? false,
          sessionTimeout: stored.security?.sessionTimeout ?? 30,
          passwordPolicy: stored.security?.passwordPolicy ?? "strong",
        },
        backup: {
          autoBackup: stored.backup?.autoBackup ?? true,
          backupFrequency: stored.backup?.backupFrequency ?? "daily",
          retentionDays: stored.backup?.retentionDays ?? 30,
        },
      });
      
      toast({
        title: "Başarılı",
        description: "Ayarlar başarıyla yüklendi.",
      });
      
    } catch (error) {
      console.error("❌ Ayarlar yüklenirken hata:", error);
      toast({
        title: "Hata",
        description: "Ayarlar yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı listesini yükle
  const loadUsers = async () => {
    try {
      const usersData = await loadUsersForAdmin();
      setUsers(usersData);
      console.log("👥 Kullanıcı listesi yüklendi:", usersData.length);
      
    } catch (error) {
      console.error("❌ Kullanıcı listesi yüklenirken hata:", error);
    }
  };

  // Aktivite loglarını yükle
  const loadActivityLogs = async () => {
    try {
      const logsData = await loadActivityLogsForAdmin();
      setActivityLogs(logsData);
      console.log("📊 Aktivite logları yüklendi:", logsData.length);
      
    } catch (error) {
      console.error("❌ Aktivite logları yüklenirken hata:", error);
    }
  };

  // Güvenlik loglarını yükle
  const loadSecurityLogs = async () => {
    try {
      const logsData = await loadSecurityLogsForAdmin();
      setSecurityLogs(logsData);
      console.log("🔒 Güvenlik logları yüklendi:", logsData.length);
      
    } catch (error) {
      console.error("❌ Güvenlik logları yüklenirken hata:", error);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log("💾 Ayarlar kaydediliyor...");
      console.log("📝 Kaydedilecek ayarlar:", settings);
      
      await saveSystemSettings(settings, user?.email || "admin");
      
      console.log("✅ Ayarlar başarıyla kaydedildi");
      
      toast({
        title: "Başarılı",
        description: "Ayarlar başarıyla kaydedildi.",
      });
    } catch (error) {
      console.error("❌ Ayarlar kaydedilirken hata:", error);
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
            <Button 
              variant="outline" 
              onClick={loadSettings}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                if (confirm("Ayarları varsayılan değerlere sıfırlamak istediğinizden emin misiniz?")) {
                  setSettings({
                    clinicName: "Klinik Takip",
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
                  toast({
                    title: "Sıfırlandı",
                    description: "Ayarlar varsayılan değerlere sıfırlandı.",
                  });
                }
              }}
            >
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
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={async () => {
                    try {
                      console.log("📦 Manuel yedekleme başlatılıyor...");
                      
                      const backupData: Record<string, unknown> = {};
                      for (const collectionName of ["users", "appointments", "prescriptions", "testResults"] as const) {
                        backupData[collectionName] = await exportCollectionDemo(collectionName);
                      }
                      backupData.settings = await getSystemSettings();
                      
                      // Yedekleme verilerini localStorage'a kaydet
                      localStorage.setItem("clinicBackup", JSON.stringify({
                        timestamp: new Date().toISOString(),
                        data: backupData
                      }));
                      
                      console.log("✅ Yedekleme tamamlandı:", backupData);
                      
                      toast({
                        title: "Başarılı",
                        description: "Manuel yedekleme tamamlandı.",
                      });
                      
                    } catch (error) {
                      console.error("❌ Yedekleme hatası:", error);
                      toast({
                        title: "Hata",
                        description: "Yedekleme sırasında hata oluştu.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Manuel Yedekleme
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={async () => {
                    try {
                      console.log("📥 Geri yükleme başlatılıyor...");
                      
                      const backupData = localStorage.getItem("clinicBackup");
                      if (!backupData) {
                        toast({
                          title: "Hata",
                          description: "Yedekleme verisi bulunamadı.",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      const backup = JSON.parse(backupData);
                      console.log("📦 Yedekleme verisi:", backup);
                      
                      toast({
                        title: "Bilgi",
                        description: "Geri yükleme özelliği yakında eklenecek.",
                      });
                      
                    } catch (error) {
                      console.error("❌ Geri yükleme hatası:", error);
                      toast({
                        title: "Hata",
                        description: "Geri yükleme sırasında hata oluştu.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
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
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    // localStorage'ı temizle
                    localStorage.clear();
                    sessionStorage.clear();
                    
                    toast({
                      title: "Başarılı",
                      description: "Önbellek temizlendi.",
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Önbellek Temizle
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    window.location.reload();
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sistem Yenile
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={async () => {
                    try {
                      console.log("🔧 Veritabanı optimizasyonu başlatılıyor...");
                      
                      let totalDocs = 0;
                      for (const name of ["users", "appointments", "prescriptions", "testResults"] as const) {
                        totalDocs += (await exportCollectionDemo(name)).length;
                      }
                      toast({
                        title: "Başarılı",
                        description: `Demo veri özeti: toplam ${totalDocs} kayıt.`,
                      });
                      
                    } catch (error) {
                      console.error("❌ Optimizasyon hatası:", error);
                      toast({
                        title: "Hata",
                        description: "Veritabanı optimizasyonu sırasında hata oluştu.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Veritabanı Optimize Et
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowApiKeys(true)}
                >
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
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={async () => {
                    await loadUsers();
                    setShowUserList(true);
                  }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Kullanıcı Listesi
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    toast({
                      title: "Bilgi",
                      description: "İzinler yönetimi yakında eklenecek.",
                    });
                  }}
                >
                  <Key className="h-4 w-4 mr-2" />
                  İzinler
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={async () => {
                    await loadActivityLogs();
                    setShowActivityLogs(true);
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Aktivite Logları
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={async () => {
                    await loadSecurityLogs();
                    setShowSecurityLogs(true);
                  }}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Güvenlik Logları
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kullanıcı Listesi Modalı */}
        <Dialog open={showUserList} onOpenChange={setShowUserList}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Kullanıcı Listesi</DialogTitle>
              <DialogDescription>
                Sistemdeki tüm kullanıcılar
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Henüz kullanıcı bulunmuyor</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {user.name?.charAt(0) || "U"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name || "İsimsiz Kullanıcı"}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role || "user"}
                        </Badge>
                        <Badge variant={user.status === "active" ? "default" : "destructive"}>
                          {user.status || "inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Aktivite Logları Modalı */}
        <Dialog open={showActivityLogs} onOpenChange={setShowActivityLogs}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Aktivite Logları</DialogTitle>
              <DialogDescription>
                Sistem aktivite kayıtları
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {activityLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Henüz aktivite logu bulunmuyor</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityLogs.map((log, index) => (
                    <div key={log.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{log.action || "Bilinmeyen İşlem"}</p>
                        <span className="text-sm text-gray-500">
                          {new Date(log.timestamp?.toDate()).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{log.description || "Açıklama yok"}</p>
                      <p className="text-xs text-gray-500 mt-1">Kullanıcı: {log.user || "Bilinmeyen"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Güvenlik Logları Modalı */}
        <Dialog open={showSecurityLogs} onOpenChange={setShowSecurityLogs}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Güvenlik Logları</DialogTitle>
              <DialogDescription>
                Sistem güvenlik kayıtları
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {securityLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Henüz güvenlik logu bulunmuyor</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {securityLogs.map((log, index) => (
                    <div key={log.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{log.event || "Bilinmeyen Olay"}</p>
                        <Badge variant={log.severity === "high" ? "destructive" : "secondary"}>
                          {log.severity || "medium"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{log.description || "Açıklama yok"}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(log.timestamp?.toDate()).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* API Anahtarları Modalı */}
        <Dialog open={showApiKeys} onOpenChange={setShowApiKeys}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>API Anahtarları</DialogTitle>
              <DialogDescription>
                Sistem API anahtarları ve konfigürasyonu
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Demo modu</h4>
                <p className="text-sm text-gray-600">
                  Bu önizleme sürümünde veriler tarayıcı belleğinde tutulur; harici API veya Firebase bağlantısı yoktur.
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">API Anahtarları</h4>
                <p className="text-sm text-gray-600">
                  API anahtarları güvenlik nedeniyle gizli tutulmaktadır.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminSettings; 