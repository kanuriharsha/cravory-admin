import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AdminLogin from "@/pages/AdminLogin";
import AdminLayout from "@/layouts/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import Restaurants from "@/pages/admin/Restaurants";
import RestaurantDetail from "@/pages/admin/RestaurantDetail";
import Orders from "@/pages/admin/Orders";
import Zones from "@/pages/admin/Zones";
import Customers from "@/pages/admin/Customers";
import DeliveryPartners from "@/pages/admin/DeliveryPartners";
import Complaints from "@/pages/admin/Complaints";
import Settings from "@/pages/admin/Settings";
import MenuItems from "@/pages/admin/MenuItems";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Public login route */}
      <Route path="/login" element={
        <PublicRoute>
          <AdminLogin />
        </PublicRoute>
      } />
      
      {/* Protected admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="restaurants" element={<Restaurants />} />
        <Route path="restaurants/:id" element={<RestaurantDetail />} />
        <Route path="menu-items" element={<MenuItems />} />
        <Route path="orders" element={<Orders />} />
        <Route path="zones" element={<Zones />} />
        <Route path="customers" element={<Customers />} />
        <Route path="delivery-partners" element={<DeliveryPartners />} />
        <Route path="complaints" element={<Complaints />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
