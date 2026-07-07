import { useAuth } from '@/contexts/AuthContext';
import { useSystemMode } from '@/contexts/SystemModeContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell, LogOut, User, Shield, Store, Leaf } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export function AdminHeader() {
  const { adminEmail, logout } = useAuth();
  const { mode, setMode } = useSystemMode();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync mode from URL on mount and navigation
  useEffect(() => {
    if (location.pathname.startsWith('/admin/vendors')) {
      setMode('vendors');
    } else if (location.pathname.startsWith('/admin') && !location.pathname.startsWith('/admin/vendors')) {
      setMode('restaurants');
    }
  }, [location.pathname, setMode]);

  const handleModeSwitch = (newMode: 'restaurants' | 'vendors') => {
    setMode(newMode);
    if (newMode === 'restaurants') {
      navigate('/admin');
    } else {
      navigate('/admin/vendors');
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      {/* System Mode Tabs */}
      <div className="border-b bg-gradient-to-r from-gray-50 to-gray-100/80 dark:from-gray-900 dark:to-gray-800/80">
        <div className="flex items-center px-4 h-11">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleModeSwitch('restaurants')}
              className={cn(
                'flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300',
                mode === 'restaurants'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-200/50 dark:shadow-orange-900/30 scale-[1.02]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/60 dark:hover:bg-white/10'
              )}
            >
              <Store className="h-4 w-4" />
              Restaurants
            </button>
            <button
              onClick={() => handleModeSwitch('vendors')}
              className={cn(
                'flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300',
                mode === 'vendors'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md shadow-amber-200/50 dark:shadow-amber-900/30 scale-[1.02]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/60 dark:hover:bg-white/10'
              )}
            >
              <Leaf className="h-4 w-4" />
              Vendors (Authentic Foods)
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger aria-label="Toggle sidebar" className="h-9 w-9 flex items-center justify-center text-lg">
            <span aria-hidden="true" className="select-none">☰</span>
          </SidebarTrigger>
          <div className="hidden md:flex items-center gap-2">
            {mode === 'restaurants' ? (
              <>
                <Shield className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-muted-foreground">Restaurant Control Panel</span>
              </>
            ) : (
              <>
                <Leaf className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-muted-foreground">Vendor Control Panel — Authentic Foods</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-[10px]">
              3
            </Badge>
          </Button>

          {/* Admin Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 h-10 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={cn(
                    "text-white text-sm font-semibold",
                    mode === 'restaurants'
                      ? "bg-gradient-to-br from-orange-500 to-red-500"
                      : "bg-gradient-to-br from-amber-500 to-yellow-500"
                  )}>
                    SA
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">Super Admin</span>
                  <span className="text-xs text-muted-foreground">{adminEmail}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2">
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="gap-2 text-red-600 focus:text-red-600">
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
