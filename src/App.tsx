import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import { NoAccess } from "@/components/workspace/NoAccess";
import DashboardIndex from "./pages/DashboardIndex";
import Trafego from "./pages/Trafego";
import Qualificacao from "./pages/Qualificacao";
import Analise from "./pages/Analise";
import Configuracoes from "./pages/Configuracoes";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><WorkspaceProvider><DashboardIndex /></WorkspaceProvider></ProtectedRoute>} />
            <Route path="/trafego" element={<ProtectedRoute><WorkspaceProvider><Trafego /></WorkspaceProvider></ProtectedRoute>} />
            <Route path="/qualificacao" element={<ProtectedRoute><WorkspaceProvider><Qualificacao /></WorkspaceProvider></ProtectedRoute>} />
            <Route path="/analise" element={<ProtectedRoute><WorkspaceProvider><RoleProtectedRoute allowedRoles={['owner', 'admin']}><Analise /></RoleProtectedRoute></WorkspaceProvider></ProtectedRoute>} />
            <Route path="/configuracoes" element={<ProtectedRoute><WorkspaceProvider><RoleProtectedRoute allowedRoles={['owner', 'admin']}><Configuracoes /></RoleProtectedRoute></WorkspaceProvider></ProtectedRoute>} />
            <Route path="/no-access" element={<ProtectedRoute><WorkspaceProvider><NoAccess /></WorkspaceProvider></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
