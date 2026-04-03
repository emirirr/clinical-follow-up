import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

/** Eski Firebase test sayfası — uygulama artık tamamen demo (yerel) veri kullanır. */
const FirebaseTest = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Demo modu</CardTitle>
          <CardDescription>
            Bu sayfa daha önce Firebase bağlantısı testi içindi. Şu an tüm paneller tarayıcıdaki örnek verilerle
            çalışır; ağ veya Firebase gerekmez.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => navigate("/")}>
            Ana sayfaya dön
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FirebaseTest;
