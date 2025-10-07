import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import DashboardIndex from "./pages/DashboardIndex";
import Qualificacao from "./pages/Qualificacao";
import Conversas from "./pages/Conversas";
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
            <Route path="/qualificacao" element={<ProtectedRoute><WorkspaceProvider><Qualificacao /></WorkspaceProvider></ProtectedRoute>} />
            <Route path="/conversas" element={<ProtectedRoute><WorkspaceProvider><Conversas /></WorkspaceProvider></ProtectedRoute>} />
            <Route path="/configuracoes" element={<ProtectedRoute><WorkspaceProvider><Configuracoes /></WorkspaceProvider></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
