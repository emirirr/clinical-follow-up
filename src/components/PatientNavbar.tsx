import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LogOut, 
  User, 
  Calendar, 
  FileText, 
  Pill, 
  Activity, 
  Bell, 
  Settings,
  Home,
  UserCheck
} from "lucide-react";

interface PatientNavbarProps {
  currentPage?: string;
}

const PatientNavbar = ({ currentPage = "dashboard" }: PatientNavbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Çıkış yapılırken hata oluştu:", error);
    }
  };

  const navItems = [
    {
      label: "Ana Sayfa",
      icon: Home,
      href: "/patient",
      active: currentPage === "dashboard"
    },
    {
      label: "Profil",
      icon: UserCheck,
      href: "/patient/profile",
      active: currentPage === "profile"
    },
    {
      label: "Randevular",
      icon: Calendar,
      href: "/patient/appointments",
      active: currentPage === "appointments"
    },
    {
      label: "Reçeteler",
      icon: Pill,
      href: "/patient/prescriptions",
      active: currentPage === "prescriptions"
    },
    {
      label: "Test Sonuçları",
      icon: FileText,
      href: "/patient/test-results",
      active: currentPage === "test-results"
    },
    {
      label: "Bildirimler",
      icon: Bell,
      href: "/patient/notifications",
      active: currentPage === "notifications"
    }
  ];

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo ve Başlık */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">
                Klinik Takip
              </h1>
            </div>
            <Badge variant="secondary">Hasta Paneli</Badge>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  variant={item.active ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.href)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-700 hidden sm:block">
                {user?.email}
              </span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/patient/profile")}
              className="hidden sm:flex"
            >
              <Settings className="h-4 w-4 mr-2" />
              Profil
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Çıkış</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden py-2 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.href}
                    variant={item.active ? "default" : "ghost"}
                    size="sm"
                    onClick={() => navigate(item.href)}
                    className="flex items-center space-x-1 min-w-fit"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PatientNavbar; 