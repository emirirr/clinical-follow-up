import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Bell, 
  Calendar, 
  Search, 
  Filter,
  AlertCircle,
  CheckCircle,
  Info,
  Clock,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getPatientInfo, 
  getNotifications
} from "@/services/patientService";
import PatientNavbar from "@/components/PatientNavbar";

interface Notification {
  id: string;
  patientId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  isRead: boolean;
  createdAt: any;
}

const PatientNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterRead, setFilterRead] = useState<string>("all");

  // Verileri yükle
  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // Hasta bilgilerini getir
      const patient = await getPatientInfo(user!.uid);
      setPatientInfo(patient);

      if (patient) {
        // Bildirimleri getir
        const notificationsData = await getNotifications(patient.id!);
        setNotifications(notificationsData);
      }
    } catch (error) {
      console.error("Bildirimler yüklenemedi:", error);
      toast({
        title: "Hata",
        description: "Bildirimler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-100 text-blue-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "info":
        return "Bilgi";
      case "warning":
        return "Uyarı";
      case "success":
        return "Başarılı";
      case "error":
        return "Hata";
      default:
        return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="h-4 w-4 text-blue-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  // Filtrelenmiş bildirimler
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || notification.type === filterType;
    const matchesRead = filterRead === "all" || 
                       (filterRead === "read" && notification.isRead) ||
                       (filterRead === "unread" && !notification.isRead);
    return matchesSearch && matchesType && matchesRead;
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
      <PatientNavbar currentPage="notifications" />
      
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Bildirimlerim
              </h1>
              <Badge variant="secondary">Hasta</Badge>
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
                placeholder="Bildirim başlığı veya mesaj ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
            >
              Tümü
            </Button>
            <Button
              variant={filterType === "info" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("info")}
            >
              Bilgi
            </Button>
            <Button
              variant={filterType === "warning" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("warning")}
            >
              Uyarı
            </Button>
            <Button
              variant={filterType === "success" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("success")}
            >
              Başarılı
            </Button>
            <Button
              variant={filterType === "error" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("error")}
            >
              Hata
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterRead === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterRead("all")}
            >
              Tümü
            </Button>
            <Button
              variant={filterRead === "unread" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterRead("unread")}
            >
              Okunmamış
            </Button>
            <Button
              variant={filterRead === "read" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterRead("read")}
            >
              Okunmuş
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Bildirim Bulunamadı
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterType !== "all" || filterRead !== "all"
                    ? "Arama kriterlerinize uygun bildirim bulunamadı."
                    : "Henüz bildiriminiz bulunmuyor."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`hover:shadow-md transition-shadow ${
                  !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(notification.type)}
                      <CardTitle className="text-lg">
                        {notification.title}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Yeni
                        </Badge>
                      )}
                      <Badge className={getTypeColor(notification.type)}>
                        {getTypeText(notification.type)}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {new Date(notification.createdAt?.toDate?.() || notification.createdAt).toLocaleDateString('tr-TR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-gray-700">{notification.message}</p>
                    <div className="flex justify-end gap-2 pt-2">
                      {!notification.isRead && (
                        <Button variant="outline" size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Okundu Olarak İşaretle
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Sil
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default PatientNotifications; 