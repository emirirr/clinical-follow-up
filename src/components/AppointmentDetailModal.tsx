import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, User, Copy, Check, Edit, Trash2 } from "lucide-react";

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  onEdit?: () => void;
  onDelete?: () => void;
}

const AppointmentDetailModal = ({ isOpen, onClose, appointment, onEdit, onDelete }: AppointmentDetailModalProps) => {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast({
        title: "Kopyalandı",
        description: `${fieldName} panoya kopyalandı.`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Kopyalama hatası:", error);
      toast({
        title: "Hata",
        description: "Kopyalama işlemi başarısız oldu.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming":
        return "Yaklaşan";
      case "completed":
        return "Tamamlandı";
      case "cancelled":
        return "İptal Edildi";
      default:
        return status;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Randevu Detayları
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Durum Badge */}
          <div className="flex justify-between items-center">
            <Badge className={getStatusColor(appointment?.status || "upcoming")}>
              {getStatusText(appointment?.status || "upcoming")}
            </Badge>
            <div className="flex gap-2">
              {onEdit && (appointment?.status || "upcoming") === "upcoming" && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-1" />
                  Düzenle
                </Button>
              )}
              {onDelete && (appointment?.status || "upcoming") === "upcoming" && (
                <Button variant="outline" size="sm" onClick={onDelete}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  İptal Et
                </Button>
              )}
            </div>
          </div>

          {/* Randevu Bilgileri */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-gray-700">Randevu Bilgileri</h4>
            
            {/* Randevu ID */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm">Randevu ID:</span>
                <span className="font-medium text-sm">{appointment?.id || "Bilinmiyor"}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(appointment?.id || "", "Randevu ID")}
                className="h-8 w-8 p-0"
              >
                {copiedField === "Randevu ID" ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Doktor */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 text-sm">Doktor:</span>
                <span className="font-medium text-sm">{appointment?.doctor || appointment?.doctorName || "Bilinmeyen Doktor"}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(appointment?.doctor || appointment?.doctorName || "Bilinmeyen Doktor", "Doktor")}
                className="h-8 w-8 p-0"
              >
                {copiedField === "Doktor" ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Tarih */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 text-sm">Tarih:</span>
                <span className="font-medium text-sm">
                  {appointment?.date ? new Date(appointment.date).toLocaleDateString('tr-TR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : "Belirtilmemiş"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(
                  appointment?.date ? new Date(appointment.date).toLocaleDateString('tr-TR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : "Belirtilmemiş",
                  "Tarih"
                )}
                className="h-8 w-8 p-0"
              >
                {copiedField === "Tarih" ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Saat */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 text-sm">Saat:</span>
                <span className="font-medium text-sm">{appointment?.time || "Belirtilmemiş"}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(appointment?.time || "Belirtilmemiş", "Saat")}
                className="h-8 w-8 p-0"
              >
                {copiedField === "Saat" ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Randevu Türü */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm">Tür:</span>
                <span className="font-medium text-sm">{appointment?.type || "Genel Muayene"}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(appointment?.type || "Genel Muayene", "Randevu Türü")}
                className="h-8 w-8 p-0"
              >
                {copiedField === "Randevu Türü" ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Konum */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 text-sm">Konum:</span>
                <span className="font-medium text-sm">{appointment?.location || "Belirtilmemiş"}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(appointment?.location || "Belirtilmemiş", "Konum")}
                className="h-8 w-8 p-0"
              >
                {copiedField === "Konum" ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Notlar */}
          {appointment?.notes && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-700">Notlar</h4>
              <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 flex-1">{appointment.notes}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(appointment.notes, "Notlar")}
                  className="h-8 w-8 p-0 ml-2"
                >
                  {copiedField === "Notlar" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Sistem Bilgileri */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-gray-700">Sistem Bilgileri</h4>
            
            {/* Oluşturulma Tarihi */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm">Oluşturulma:</span>
                <span className="font-medium text-sm">
                  {appointment?.createdAt ? new Date(appointment.createdAt.toDate()).toLocaleDateString('tr-TR') : "Bilinmiyor"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(
                  appointment?.createdAt ? new Date(appointment.createdAt.toDate()).toLocaleDateString('tr-TR') : "Bilinmiyor",
                  "Oluşturulma Tarihi"
                )}
                className="h-8 w-8 p-0"
              >
                {copiedField === "Oluşturulma Tarihi" ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Güncelleme Tarihi */}
            {appointment?.updatedAt && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm">Güncelleme:</span>
                  <span className="font-medium text-sm">
                    {new Date(appointment.updatedAt.toDate()).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(
                    new Date(appointment.updatedAt.toDate()).toLocaleDateString('tr-TR'),
                    "Güncelleme Tarihi"
                  )}
                  className="h-8 w-8 p-0"
                >
                  {copiedField === "Güncelleme Tarihi" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Kapat Butonu */}
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Kapat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailModal; 