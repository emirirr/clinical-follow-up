import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Clock, Copy, Check } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getDoctors, updateAppointment } from "@/services/patientService";

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointment: any;
}

const EditAppointmentModal = ({ isOpen, onClose, onSuccess, appointment }: EditAppointmentModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    appointment?.date ? new Date(appointment.date) : undefined
  );

  const [formData, setFormData] = useState({
    doctorId: appointment?.doctorId || "",
    time: appointment?.time || "",
    type: appointment?.type || "",
    location: appointment?.location || "",
    notes: appointment?.notes || "",
    status: appointment?.status || "upcoming"
  });

  useEffect(() => {
    if (isOpen) {
      loadDoctors();
      // Form verilerini mevcut randevu ile doldur
      setFormData({
        doctorId: appointment?.doctorId || "",
        time: appointment?.time || "",
        type: appointment?.type || "",
        location: appointment?.location || "",
        notes: appointment?.notes || "",
        status: appointment?.status || "upcoming"
      });
      setSelectedDate(appointment?.date ? new Date(appointment.date) : undefined);
    }
  }, [isOpen, appointment]);

  const loadDoctors = async () => {
    try {
      console.log("👨‍⚕️ Doktorlar yükleniyor...");
      const doctorsData = await getDoctors();
      console.log("✅ Doktorlar yüklendi:", doctorsData.length);
      setDoctors(doctorsData);
    } catch (error) {
      console.error("❌ Doktorlar yüklenemedi:", error);
      toast({
        title: "Hata",
        description: "Doktorlar yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("🔍 Form verilerini kontrol ediyorum...");
      console.log("📝 Form verileri:", formData);
      console.log("📅 Seçili tarih:", selectedDate);
      console.log("👨‍⚕️ Doktorlar:", doctors);
      console.log("📋 Mevcut randevu:", appointment);
      
      const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
      console.log("✅ Seçili doktor:", selectedDoctor);
      
      if (!selectedDoctor) {
        console.error("❌ Doktor seçilmedi");
        toast({
          title: "Hata",
          description: "Lütfen bir doktor seçin.",
          variant: "destructive",
        });
        return;
      }
      
      if (!selectedDate) {
        console.error("❌ Tarih seçilmedi");
        toast({
          title: "Hata",
          description: "Lütfen bir tarih seçin.",
          variant: "destructive",
        });
        return;
      }
      
      if (!formData.time) {
        console.error("❌ Saat seçilmedi");
        toast({
          title: "Hata",
          description: "Lütfen bir saat seçin.",
          variant: "destructive",
        });
        return;
      }
      
      if (!formData.type) {
        console.error("❌ Randevu türü seçilmedi");
        toast({
          title: "Hata",
          description: "Lütfen bir randevu türü seçin.",
          variant: "destructive",
        });
        return;
      }

      console.log("📋 Randevu güncelleme verisi hazırlanıyor...");
      const updateData = {
        doctorId: formData.doctorId,
        doctor: selectedDoctor.name,
        doctorName: selectedDoctor.name,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: formData.time,
        type: formData.type,
        location: formData.location || "",
        notes: formData.notes || "",
        status: formData.status as "upcoming" | "completed" | "cancelled"
      };
      
      console.log("📝 Güncellenecek randevu verisi:", updateData);

      console.log("💾 Firebase'e güncelleniyor...");
      await updateAppointment(appointment.id, updateData);
      
      console.log("✅ Randevu başarıyla güncellendi");
      
      toast({
        title: "Başarılı",
        description: "Randevu başarıyla güncellendi.",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("❌ Randevu güncelleme hatası:", error);
      console.error("🔍 Hata detayları:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      toast({
        title: "Hata",
        description: `Randevu güncellenirken hata oluştu: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      doctorId: appointment?.doctorId || "",
      time: appointment?.time || "",
      type: appointment?.type || "",
      location: appointment?.location || "",
      notes: appointment?.notes || "",
      status: appointment?.status || "upcoming"
    });
    setSelectedDate(appointment?.date ? new Date(appointment.date) : undefined);
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Randevu Düzenle</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mevcut Bilgiler */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Mevcut Bilgiler</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-600 text-sm">Randevu ID:</span>
                  <p className="font-medium">{appointment?.id || "Bilinmiyor"}</p>
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
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-600 text-sm">Durum:</span>
                  <p className="font-medium">{appointment?.status || "upcoming"}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(appointment?.status || "upcoming", "Durum")}
                  className="h-8 w-8 p-0"
                >
                  {copiedField === "Durum" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-600 text-sm">Oluşturulma:</span>
                  <p className="font-medium">
                    {appointment?.createdAt ? new Date(appointment.createdAt.toDate()).toLocaleDateString('tr-TR') : "Bilinmiyor"}
                  </p>
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
            </div>
          </div>

          {/* Doktor Seçimi */}
          <div className="space-y-2">
            <Label htmlFor="doctor">Doktor</Label>
            <Select value={formData.doctorId} onValueChange={(value) => handleInputChange("doctorId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Doktor seçin" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tarih Seçimi */}
          <div className="space-y-2">
            <Label>Tarih</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: tr }) : "Tarih seçin"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Saat Seçimi */}
          <div className="space-y-2">
            <Label htmlFor="time">Saat</Label>
            <Select value={formData.time} onValueChange={(value) => handleInputChange("time", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Saat seçin" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                  const hour = i + 8; // 08:00 - 19:00
                  return (
                    <SelectItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                      {hour.toString().padStart(2, '0')}:00
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Randevu Türü */}
          <div className="space-y-2">
            <Label htmlFor="type">Randevu Türü</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Randevu türü seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Genel Muayene">Genel Muayene</SelectItem>
                <SelectItem value="Kontrol Muayenesi">Kontrol Muayenesi</SelectItem>
                <SelectItem value="Acil Muayene">Acil Muayene</SelectItem>
                <SelectItem value="Konsültasyon">Konsültasyon</SelectItem>
                <SelectItem value="Test">Test</SelectItem>
                <SelectItem value="Tedavi">Tedavi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Konum */}
          <div className="space-y-2">
            <Label htmlFor="location">Konum</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Muayenehane konumu"
            />
          </div>

          {/* Notlar */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notlar</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Randevu notları..."
              rows={3}
            />
          </div>

          {/* Durum */}
          <div className="space-y-2">
            <Label htmlFor="status">Durum</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Yaklaşan</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
                <SelectItem value="cancelled">İptal Edildi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Butonlar */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleReset}>
              Sıfırla
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Güncelleniyor..." : "Güncelle"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAppointmentModal; 