<<<<<<< HEAD
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { VendorSidebar } from '@/components/vendor/VendorSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useAuth } from '@/contexts/AuthContext';
import { SystemModeProvider, useSystemMode } from '@/contexts/SystemModeContext';

function LayoutContent() {
  const { mode } = useSystemMode();
=======
import { Outlet, Navigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
>>>>>>> 9eefa165519f5b993ddde62d369f864c278b0196

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
<<<<<<< HEAD
        {mode === 'vendors' ? <VendorSidebar /> : <AdminSidebar />}
=======
        <AdminSidebar />
>>>>>>> 9eefa165519f5b993ddde62d369f864c278b0196
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
<<<<<<< HEAD

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
=======
>>>>>>> 9eefa165519f5b993ddde62d369f864c278b0196
