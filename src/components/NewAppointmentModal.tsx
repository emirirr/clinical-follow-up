import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { createAppointment, getDoctors } from "@/services/patientService";
import { useToast } from "@/hooks/use-toast";

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  onSuccess: () => void;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
}

const NewAppointmentModal = ({ isOpen, onClose, patientId, patientName, onSuccess }: NewAppointmentModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [formData, setFormData] = useState({
    doctorId: "",
    date: "",
    time: "",
    type: "",
    location: "",
    notes: ""
  });

  useEffect(() => {
    if (isOpen) {
      loadDoctors();
    }
  }, [isOpen]);

  const loadDoctors = async () => {
    try {
      const doctorsData = await getDoctors();
      setDoctors(doctorsData);
    } catch (error) {
      console.error("Doktorlar yüklenemedi:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("🔍 Form verilerini kontrol ediyorum...");
      console.log("📝 Form verileri:", formData);
      console.log("📅 Seçili tarih:", selectedDate);
      console.log("👨‍⚕️ Doktorlar:", doctors);
      console.log("👤 Patient ID:", patientId);
      console.log("👤 Patient Name:", patientName);
      
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

      console.log("📋 Randevu verisi hazırlanıyor...");
      const appointmentData = {
        patientId,
        patientName: patientName || "Bilinmeyen Hasta",
        doctorId: formData.doctorId,
        doctor: selectedDoctor.name,
        doctorName: selectedDoctor.name,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: formData.time,
        type: formData.type,
        location: formData.location || "",
        notes: formData.notes || "",
        status: "upcoming" as const
      };
      
      console.log("📝 Oluşturulacak randevu verisi:", appointmentData);

      console.log("💾 Firebase'e kaydediliyor...");
      await createAppointment(appointmentData);
      
      console.log("✅ Randevu başarıyla oluşturuldu");
      
      toast({
        title: "Başarılı",
        description: "Randevu başarıyla oluşturuldu.",
      });

      onSuccess();
      onClose();
      setFormData({
        doctorId: "",
        date: "",
        time: "",
        type: "",
        location: "",
        notes: ""
      });
      setSelectedDate(undefined);
    } catch (error: any) {
      console.error("❌ Randevu oluşturma hatası:", error);
      console.error("🔍 Hata detayları:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      toast({
        title: "Hata",
        description: `Randevu oluşturulurken hata oluştu: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Yeni Randevu Oluştur</DialogTitle>
          <DialogDescription>
            Yeni bir randevu oluşturmak için aşağıdaki bilgileri doldurun.
          </DialogDescription>
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Hasta:</strong> {patientName}
            </p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Test Butonu */}
          <div className="flex justify-end mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  console.log("🧪 Test randevu verisi hazırlanıyor...");
                  
                  // Test doktoru seç
                  if (doctors.length > 0) {
                    const testDoctor = doctors[0];
                    setFormData({
                      doctorId: testDoctor.id,
                      date: "",
                      time: "10:00",
                      type: "Test Muayene",
                      location: "Test Bölümü",
                      notes: "Test randevu notu - " + new Date().toLocaleString()
                    });
                    setSelectedDate(new Date());
                    
                    toast({
                      title: "Test Verisi",
                      description: "Form test verileri ile dolduruldu.",
                    });
                  } else {
                    toast({
                      title: "Hata",
                      description: "Önce doktorlar yüklenmeli.",
                      variant: "destructive",
                    });
                  }
                } catch (error) {
                  console.error("Test verisi hatası:", error);
                }
              }}
            >
              Test Verisi Doldur
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
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

            <div>
              <Label htmlFor="type">Randevu Türü</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tür seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kontrol Muayenesi">Kontrol Muayenesi</SelectItem>
                  <SelectItem value="İlk Muayene">İlk Muayene</SelectItem>
                  <SelectItem value="Kan Tahlili">Kan Tahlili</SelectItem>
                  <SelectItem value="Görüntüleme">Görüntüleme</SelectItem>
                  <SelectItem value="Konsültasyon">Konsültasyon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Tarih</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
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

            <div>
              <Label htmlFor="time">Saat</Label>
              <Select value={formData.time} onValueChange={(value) => handleInputChange("time", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Saat seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="09:00">09:00</SelectItem>
                  <SelectItem value="09:30">09:30</SelectItem>
                  <SelectItem value="10:00">10:00</SelectItem>
                  <SelectItem value="10:30">10:30</SelectItem>
                  <SelectItem value="11:00">11:00</SelectItem>
                  <SelectItem value="11:30">11:30</SelectItem>
                  <SelectItem value="14:00">14:00</SelectItem>
                  <SelectItem value="14:30">14:30</SelectItem>
                  <SelectItem value="15:00">15:00</SelectItem>
                  <SelectItem value="15:30">15:30</SelectItem>
                  <SelectItem value="16:00">16:00</SelectItem>
                  <SelectItem value="16:30">16:30</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="location">Lokasyon</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Örn: Kardiyoloji Bölümü"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notlar</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Randevu ile ilgili notlar..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Oluşturuluyor..." : "Randevu Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewAppointmentModal; 