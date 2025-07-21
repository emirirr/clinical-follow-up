import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import SmartRedirect from "@/components/SmartRedirect";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PatientDashboard from "./pages/PatientDashboard";
import PatientProfile from "./pages/PatientProfile";
import PatientAppointments from "./pages/PatientAppointments";
import PatientPrescriptions from "./pages/PatientPrescriptions";
import PatientTestResults from "./pages/PatientTestResults";
import PatientNotifications from "./pages/PatientNotifications";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPatients from "./pages/AdminPatients";
import AdminDoctors from "./pages/AdminDoctors";
import AdminAppointments from "./pages/AdminAppointments";
import AdminReports from "./pages/AdminReports";
import AdminSettings from "./pages/AdminSettings";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorAppointments from "./pages/DoctorAppointments";
import DoctorPatients from "./pages/DoctorPatients";
import DoctorPrescriptions from "./pages/DoctorPrescriptions";
import DoctorProfile from "./pages/DoctorProfile";
import FirebaseTest from "./pages/FirebaseTest";
import SimpleTest from "./pages/SimpleTest";
import LoginDebug from "./pages/LoginDebug";
import ProfileDebug from "./pages/ProfileDebug";
import NotFound from "./pages/NotFound";
import "./lib/firebase"; // Firebase'i başlat

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SmartRedirect>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/firebase-test" 
                element={<FirebaseTest />} 
              />
              <Route 
                path="/simple-test" 
                element={<SimpleTest />} 
              />
              <Route 
                path="/login-debug" 
                element={<LoginDebug />} 
              />
              <Route 
                path="/profile-debug" 
                element={<ProfileDebug />} 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/patient" 
                element={
                  <ProtectedRoute>
                    <PatientDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/patient/profile" 
                element={
                  <ProtectedRoute>
                    <PatientProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/patient/appointments" 
                element={
                  <ProtectedRoute>
                    <PatientAppointments />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/patient/prescriptions" 
                element={
                  <ProtectedRoute>
                    <PatientPrescriptions />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/patient/test-results" 
                element={
                  <ProtectedRoute>
                    <PatientTestResults />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/patient/notifications" 
                element={
                  <ProtectedRoute>
                    <PatientNotifications />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/patients" 
                element={
                  <ProtectedRoute>
                    <AdminPatients />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/doctors" 
                element={
                  <ProtectedRoute>
                    <AdminDoctors />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/appointments" 
                element={
                  <ProtectedRoute>
                    <AdminAppointments />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/reports" 
                element={
                  <ProtectedRoute>
                    <AdminReports />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/settings" 
                element={
                  <ProtectedRoute>
                    <AdminSettings />
                  </ProtectedRoute>
                } 
              />
              
              {/* Doctor Routes */}
              <Route 
                path="/doctor" 
                element={
                  <ProtectedRoute>
                    <DoctorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/doctor/appointments" 
                element={
                  <ProtectedRoute>
                    <DoctorAppointments />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/doctor/patients" 
                element={
                  <ProtectedRoute>
                    <DoctorPatients />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/doctor/prescriptions" 
                element={
                  <ProtectedRoute>
                    <DoctorPrescriptions />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/doctor/profile" 
                element={
                  <ProtectedRoute>
                    <DoctorProfile />
                  </ProtectedRoute>
                } 
              />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SmartRedirect>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
