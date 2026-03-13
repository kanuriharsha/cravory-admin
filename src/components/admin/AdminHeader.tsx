import { useAuth } from '@/contexts/AuthContext';
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
import { Bell, LogOut, User, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function AdminHeader() {
  const { adminEmail, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 h-16 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger aria-label="Toggle sidebar" className="h-9 w-9 flex items-center justify-center text-lg">
            <span aria-hidden="true" className="select-none">☰</span>
          </SidebarTrigger>
          <div className="hidden md:flex items-center gap-2">
            <Shield className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-muted-foreground">Admin Control Panel</span>
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
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-sm font-semibold">
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
