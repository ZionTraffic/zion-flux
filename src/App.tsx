import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { DatabaseProvider } from "@/contexts/DatabaseContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import { AutoRedirect } from "@/components/auth/AutoRedirect";
import { NoAccess } from "@/components/workspace/NoAccess";
import DashboardIndex from "./pages/DashboardIndex";
import Leads from "./pages/Leads";
import Trafego from "./pages/Trafego";
import Qualificacao from "./pages/Qualificacao";
import Analise from "./pages/Analise";
import Configuracoes from "./pages/Configuracoes";
import Auth from "./pages/Auth";
import CompleteSignup from "./pages/CompleteSignup";
import AcceptInvite from "./pages/AcceptInvite";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DatabaseProvider>
            <Routes>
              {/* Public Routes - No WorkspaceProvider needed */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/complete-signup" element={<CompleteSignup />} />
              <Route path="/accept-invite" element={<AcceptInvite />} />
              
              {/* Protected Routes - Single WorkspaceProvider for all */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <TenantProvider>
                    <AutoRedirect />
                    <Routes>
                      <Route path="/" element={<DashboardIndex />} />
                      <Route path="/leads" element={<Leads />} />
                      <Route path="/trafego" element={<Trafego />} />
                      <Route path="/qualificacao" element={<Qualificacao />} />
                      <Route path="/analise" element={<RoleProtectedRoute allowedRoles={['owner', 'admin']}><Analise /></RoleProtectedRoute>} />
                      <Route path="/configuracoes" element={<RoleProtectedRoute allowedRoles={['owner', 'admin']}><Configuracoes /></RoleProtectedRoute>} />
                      <Route path="/no-access" element={<NoAccess />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </TenantProvider>
                </ProtectedRoute>
              } />
            </Routes>
          </DatabaseProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
