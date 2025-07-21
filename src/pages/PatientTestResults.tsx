import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  User, 
  Calendar, 
  Search, 
  Filter,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getPatientInfo, 
  getTestResults,
  type TestResult
} from "@/services/patientService";
import PatientNavbar from "@/components/PatientNavbar";

const PatientTestResults = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Verileri yükle
  useEffect(() => {
    if (user) {
      loadTestResults();
    }
  }, [user]);

  const loadTestResults = async () => {
    try {
      setLoading(true);
      
      // Hasta bilgilerini getir
      const patient = await getPatientInfo(user!.uid);
      setPatientInfo(patient);

      if (patient) {
        // Test sonuçlarını getir
        const testResultsData = await getTestResults(patient.id!);
        setTestResults(testResultsData);
      }
    } catch (error) {
      console.error("Test sonuçları yüklenemedi:", error);
      toast({
        title: "Hata",
        description: "Test sonuçları yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-800";
      case "abnormal":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "normal":
        return "Normal";
      case "abnormal":
        return "Anormal";
      case "pending":
        return "Beklemede";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "normal":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "abnormal":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  // Filtrelenmiş test sonuçları
  const filteredTestResults = testResults.filter(testResult => {
    const matchesSearch = testResult.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testResult.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || testResult.status === filterStatus;
    return matchesSearch && matchesFilter;
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
      <PatientNavbar currentPage="test-results" />
      
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Test Sonuçlarım
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
                placeholder="Test adı veya doktor ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
            >
              Tümü
            </Button>
            <Button
              variant={filterStatus === "normal" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("normal")}
            >
              Normal
            </Button>
            <Button
              variant={filterStatus === "abnormal" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("abnormal")}
            >
              Anormal
            </Button>
            <Button
              variant={filterStatus === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("pending")}
            >
              Beklemede
            </Button>
          </div>
        </div>

        {/* Test Results List */}
        <div className="space-y-4">
          {filteredTestResults.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Test Sonucu Bulunamadı
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterStatus !== "all" 
                    ? "Arama kriterlerinize uygun test sonucu bulunamadı."
                    : "Henüz test sonucunuz bulunmuyor."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTestResults.map((testResult) => (
              <Card key={testResult.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        {testResult.testName}
                      </CardTitle>
                      <CardDescription>
                        {new Date(testResult.date).toLocaleDateString('tr-TR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(testResult.status)}
                      <Badge className={getStatusColor(testResult.status)}>
                        {getStatusText(testResult.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Dr. {testResult.doctor}</span>
                    </div>
                    {testResult.labName && (
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Laboratuvar: {testResult.labName}</span>
                      </div>
                    )}
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Sonuç:</h4>
                      <p className="text-sm text-gray-700">{testResult.result}</p>
                    </div>
                    {testResult.notes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-sm mb-2">Doktor Notları:</h4>
                        <p className="text-sm text-gray-700">{testResult.notes}</p>
                      </div>
                    )}
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

export default PatientTestResults; 