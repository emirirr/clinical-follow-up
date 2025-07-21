import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Phone } from "lucide-react";

interface PatientCardProps {
  name: string;
  age: number;
  phone: string;
  lastVisit: string;
  nextAppointment?: string;
  status: "active" | "waiting" | "completed";
  urgency?: "high" | "medium" | "low";
}

export function PatientCard({ 
  name, 
  age, 
  phone, 
  lastVisit, 
  nextAppointment,
  status,
  urgency = "medium"
}: PatientCardProps) {
  const statusColors = {
    active: "bg-success",
    waiting: "bg-warning", 
    completed: "bg-muted"
  };

  const urgencyColors = {
    high: "bg-destructive",
    medium: "bg-warning",
    low: "bg-success"
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-elevated">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{name}</CardTitle>
          <div className="flex gap-2">
            <Badge className={urgencyColors[urgency]}>
              {urgency === "high" ? "Acil" : urgency === "medium" ? "Normal" : "Düşük"}
            </Badge>
            <Badge className={statusColors[status]}>
              {status === "active" ? "Aktif" : status === "waiting" ? "Bekliyor" : "Tamamlandı"}
            </Badge>
          </div>
        </div>
        <CardDescription>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {age} yaş
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {phone}
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Son Ziyaret:</span>
            <span>{lastVisit}</span>
          </div>
          {nextAppointment && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Sonraki Randevu:</span>
              <span className="text-primary font-medium">{nextAppointment}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            Dosya Görüntüle
          </Button>
          <Button variant="medical" size="sm" className="flex-1">
            Randevu Oluştur
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}