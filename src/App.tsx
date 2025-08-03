
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Applicants from "./pages/Applicants";
import ApplicantForm from "./pages/ApplicantForm";
import ApplicantEdit from "./pages/ApplicantEdit";
import ApplicantDetails from "./pages/ApplicantDetails";
import IDCards from "./pages/IDCards";
import IDCardPreviewPage from "./pages/IDCardPreviewPage";
import IDCardPrintPage from "./pages/IDCardPrintPage";
import BulkPrintPage from "./pages/BulkPrintPage";
import ViewAllIDCards from "./pages/ViewAllIDCards";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/applicants" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Applicants />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/applicants/new" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ApplicantForm />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/applicants/:id/edit" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ApplicantEdit />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/applicants/:id" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ApplicantDetails />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/id-cards" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <IDCards />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/id-cards/view-all" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ViewAllIDCards />
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
              
              <Route path="/id-cards/:id/print" element={
                <ProtectedRoute>
                  <IDCardPrintPage />
                </ProtectedRoute>
              } />
              
              <Route path="/bulk-print" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <BulkPrintPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/users" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Users />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Settings />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
