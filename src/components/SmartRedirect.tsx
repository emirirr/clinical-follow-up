import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { getRedirectUrlByRole } from "@/services/userService";

interface SmartRedirectProps {
  children: React.ReactNode;
}

const SmartRedirect = ({ children }: SmartRedirectProps) => {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // Kullanıcının mevcut sayfasını kontrol et
      const currentPath = window.location.pathname;
      
      // Login ve register sayfalarında giriş yapmış kullanıcıyı yönlendirme
      if (currentPath === "/login" || currentPath === "/register") {
        if (userProfile) {
          const redirectUrl = getRedirectUrlByRole(userProfile.role);
          navigate(redirectUrl);
        }
        return;
      }
      
      // Kullanıcı giriş yapmış ama profili yoksa kayıt sayfasına yönlendir
      if (!userProfile) {
        navigate("/register");
        return;
      }

      // Eğer ana sayfa veya dashboard'daysa, rolüne göre yönlendir
      if (currentPath === "/" || currentPath === "/dashboard") {
        const redirectUrl = getRedirectUrlByRole(userProfile.role);
        navigate(redirectUrl);
        return;
      }

      // Kullanıcının rolüne uygun olmayan sayfalarda olup olmadığını kontrol et
      const userRole = userProfile.role;
      const isOnCorrectPage = (
        (userRole === "patient" && currentPath.startsWith("/patient")) ||
        (userRole === "doctor" && currentPath.startsWith("/doctor")) ||
        (userRole === "admin" && currentPath.startsWith("/admin"))
      );

      // Eğer yanlış sayfadaysa, doğru sayfaya yönlendir
      if (!isOnCorrectPage) {
        const redirectUrl = getRedirectUrlByRole(userRole);
        navigate(redirectUrl);
      }
    }
  }, [user, userProfile, loading, navigate]);

  // Loading durumunda spinner göster
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SmartRedirect; 