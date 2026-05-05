import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { VendorSidebar } from '@/components/vendor/VendorSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useAuth } from '@/contexts/AuthContext';
import { SystemModeProvider, useSystemMode } from '@/contexts/SystemModeContext';

function LayoutContent() {
  const { mode } = useSystemMode();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        {mode === 'vendors' ? <VendorSidebar /> : <AdminSidebar />}
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-3 md:p-6 overflow-auto min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function AdminLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SystemModeProvider>
      <LayoutContent />
    </SystemModeProvider>
  );
}
