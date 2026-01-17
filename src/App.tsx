import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ClientApp from "./pages/ClientApp";
import DriverApp from "./pages/DriverApp";
import AdminDashboard from "./pages/AdminDashboard";
import TripHistory from "./pages/TripHistory";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionCancelled from "./pages/SubscriptionCancelled";
import DriverDetails from "./pages/DriverDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/client" 
              element={
                <ProtectedRoute allowedUserTypes={["client"]}>
                  <ClientApp />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/driver" 
              element={
                <ProtectedRoute allowedUserTypes={["driver"]}>
                  <DriverApp />
                </ProtectedRoute>
              } 
            />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/driver/:driverId" element={<DriverDetails />} />
            <Route 
              path="/history" 
              element={
                <ProtectedRoute allowedUserTypes={["client", "driver"]}>
                  <TripHistory />
                </ProtectedRoute>
              } 
            />
            <Route path="/about" element={<About />} />
            <Route 
              path="/subscription-success" 
              element={
                <ProtectedRoute allowedUserTypes={["driver"]}>
                  <SubscriptionSuccess />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/subscription-cancelled" 
              element={
                <ProtectedRoute allowedUserTypes={["driver"]}>
                  <SubscriptionCancelled />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
