
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MachineDetails from "./pages/MachineDetails";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import { MachineProvider } from "./contexts/MachineContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MachineProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/maquina/:id" element={<MachineDetails />} />
            <Route path="/historico" element={<History />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </MachineProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
