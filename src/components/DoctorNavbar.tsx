import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Stethoscope, 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Activity,
  Bell
} from "lucide-react";

const DoctorNavbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Çıkış hatası:", error);
    }
  };

  const isActive = (path: string) => {
    return window.location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Stethoscope className="h-8 w-8 text-blue-600 mr-3" />
              <span className="text-xl font-bold text-gray-900">Klinik Takip</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant={isActive("/doctor") ? "default" : "ghost"}
              onClick={() => navigate("/doctor")}
              className="flex items-center space-x-2"
            >
              <Activity className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>

            <Button
              variant={isActive("/doctor/appointments") ? "default" : "ghost"}
              onClick={() => navigate("/doctor/appointments")}
              className="flex items-center space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span>Randevularım</span>
            </Button>

            <Button
              variant={isActive("/doctor/patients") ? "default" : "ghost"}
              onClick={() => navigate("/doctor/patients")}
              className="flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Hastalarım</span>
            </Button>

            <Button
              variant={isActive("/doctor/prescriptions") ? "default" : "ghost"}
              onClick={() => navigate("/doctor/prescriptions")}
              className="flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Reçetelerim</span>
            </Button>

            <Button
              variant={isActive("/doctor/profile") ? "default" : "ghost"}
              onClick={() => navigate("/doctor/profile")}
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Profilim</span>
            </Button>

            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              <span>Çıkış</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DoctorNavbar; 