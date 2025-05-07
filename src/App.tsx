
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Auth Components
import { AuthProvider, UserRole } from "./context/AuthContext";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";

// Pages
import Dashboard from "./pages/Dashboard";
import Applicants from "./pages/Applicants";
import ApplicantForm from "./pages/ApplicantForm";
import IDCardPreviewPage from "./pages/IDCardPreviewPage";
import IDCards from "./pages/IDCards";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Applicant Routes */}
            <Route path="/applicants" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Applicants />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/applicants/new" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.DATA_ENTRY]}>
                <DashboardLayout>
                  <ApplicantForm />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/applicants/:id/edit" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.DATA_ENTRY]}>
                <DashboardLayout>
                  <ApplicantForm isEditing={true} />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* ID Card Routes */}
            <Route path="/id-cards" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <IDCards />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/id-cards/:id/preview" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <IDCardPreviewPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
