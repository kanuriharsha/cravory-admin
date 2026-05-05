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
  Store,
  ShoppingBag,
  Users,
  Truck,
  MapPin,
  MessageSquareWarning,
  Settings,
  UtensilsCrossed,
  LogOut,
  ChefHat,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const mainMenuItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Restaurants', url: '/admin/restaurants', icon: Store },
  { title: 'Menu Items', url: '/admin/menu-items', icon: ChefHat },
  { title: 'Orders', url: '/admin/orders', icon: ShoppingBag },
  { title: 'Zones', url: '/admin/zones', icon: MapPin },
];

const managementItems = [
  { title: 'Customers', url: '/admin/customers', icon: Users },
  { title: 'Delivery Partners', url: '/admin/delivery-partners', icon: Truck },
  { title: 'Complaints', url: '/admin/complaints', icon: MessageSquareWarning },
];

const systemItems = [
  { title: 'Settings', url: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const handleMenuItemClick = () => {
    // Close sidebar on mobile when navigating
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const MenuItem = ({ item }: { item: typeof mainMenuItems[0] }) => (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink
          to={item.url}
          onClick={handleMenuItemClick}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
            isActive(item.url)
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
          <img 
            src="/cravory-logo.jpeg" 
            alt="Cravory Logo" 
            className="w-10 h-10 rounded-xl object-cover shadow-md"
          />
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Cravory
              </h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="px-4 text-xs text-muted-foreground uppercase tracking-wider">Main</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu className="px-2 space-y-1">
              {mainMenuItems.map((item) => (
                <MenuItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          {!collapsed && <SidebarGroupLabel className="px-4 text-xs text-muted-foreground uppercase tracking-wider">Management</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu className="px-2 space-y-1">
              {managementItems.map((item) => (
                <MenuItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          {!collapsed && <SidebarGroupLabel className="px-4 text-xs text-muted-foreground uppercase tracking-wider">System</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu className="px-2 space-y-1">
              {systemItems.map((item) => (
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
