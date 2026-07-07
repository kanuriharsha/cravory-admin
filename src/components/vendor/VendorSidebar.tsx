import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  ShieldCheck,
  LogOut,
  Leaf,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const vendorMenuItems = [
  { title: 'Vendor Dashboard', url: '/admin/vendors', icon: LayoutDashboard },
  { title: 'Total Vendor List', url: '/admin/vendors/list', icon: Users },
  { title: 'Vendor Products', url: '/admin/vendors/products', icon: Package },
  { title: 'Vendor Orders', url: '/admin/vendors/orders', icon: ShoppingBag },
  { title: 'Vendor Earnings', url: '/admin/vendors/earnings', icon: DollarSign },
  { title: 'Quality Control', url: '/admin/vendors/quality', icon: ShieldCheck },
];

export function VendorSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path: string) => {
    if (path === '/admin/vendors') {
      return location.pathname === '/admin/vendors';
    }
    return location.pathname.startsWith(path);
  };

  const handleMenuItemClick = () => {
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const MenuItem = ({ item }: { item: typeof vendorMenuItems[0] }) => (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink
          to={item.url}
          onClick={handleMenuItemClick}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
            isActive(item.url)
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md'
              : 'text-muted-foreground hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/30 dark:hover:text-amber-400'
          )}
        >
          <item.icon className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="font-medium">{item.title}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar className={cn('border-r bg-card', collapsed ? 'w-16' : 'w-64')}>
      <SidebarHeader className="border-b p-4">
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-3')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                Cravory
              </h1>
              <p className="text-xs text-muted-foreground">Authentic Foods</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="px-4 text-xs text-muted-foreground uppercase tracking-wider">Vendor System</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu className="px-2 space-y-1">
              {vendorMenuItems.map((item) => (
                <MenuItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <Button
          variant="ghost"
          onClick={logout}
          className={cn(
            'w-full text-muted-foreground hover:text-red-600 hover:bg-red-50',
            collapsed ? 'px-2' : 'justify-start gap-3'
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
