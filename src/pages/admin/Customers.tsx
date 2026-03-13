import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/admin/StatusBadge';
import apiService from '@/services/api';
import { User } from '@/types/admin';
import { 
  Search, 
  MoreHorizontal,
  Ban,
  Check,
  Mail,
  Phone,
  ShoppingBag,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Customers() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // Try without type filter first to get all users, then filter on frontend
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      
      const data = await apiService.getUsers(params);
      const customers = Array.isArray(data) ? data : [];
      // Filter for customers only (users with role='user' or without delivery partner fields)
      const filteredCustomers = customers.filter((u: any) => 
        u.role === 'user' || (!u.vehicle_type && !u.current_zone)
      );
      setUsers(filteredCustomers as User[]);
      console.log('Customers loaded:', filteredCustomers.length, filteredCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchCustomers();
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.includes(searchQuery)
  );

  const handleBlock = async (id: string) => {
    try {
      await apiService.blockUser(id);
      toast.success('Customer blocked');
      fetchCustomers();
    } catch (error) {
      console.error('Error blocking customer:', error);
      toast.error('Failed to block customer');
    }
  };

  const handleUnblock = async (id: string) => {
    try {
      await apiService.unblockUser(id);
      toast.success('Customer unblocked');
      fetchCustomers();
    } catch (error) {
      console.error('Error unblocking customer:', error);
      toast.error('Failed to unblock customer');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground">View and manage customer accounts</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="pl-10"
        />
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No customers found</div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user._id} className="bg-card border rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-400 text-white text-sm">
                      {(user.name || 'U').split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{user.name || 'Unknown User'}</p>
                    <p className="text-xs text-muted-foreground">Orders: {user.total_orders || 0}</p>
                  </div>
                </div>
                <StatusBadge status={user.status || 'active'} />
              </div>
              <div className="grid grid-cols-1 gap-1 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{user.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span>{user.phone || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Joined: {user.createdAt || user.created_at ? format(new Date((user.createdAt || user.created_at) as string), 'MMM d, yyyy') : 'N/A'}
                </span>
                {user.status === 'blocked' ? (
                  <Button size="sm" variant="outline" className="text-green-600 h-7 text-xs" onClick={() => handleUnblock(user._id)}>
                    <Check className="mr-1 h-3.5 w-3.5" /> Unblock
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="text-destructive h-7 text-xs" onClick={() => handleBlock(user._id)}>
                    <Ban className="mr-1 h-3.5 w-3.5" /> Block
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Total Orders</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No customers found</TableCell></TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user._id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-400 text-white text-sm">
                            {(user.name || 'U').split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.name || 'Unknown User'}</p>
                          <p className="text-xs text-muted-foreground">ID: {user._id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="text-sm flex items-center gap-1"><Mail className="h-3 w-3 text-muted-foreground" />{user.email || 'N/A'}</p>
                        <p className="text-sm flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground" />{user.phone || 'N/A'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{user.total_orders || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge status={user.status || 'active'} /></TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {user.createdAt || user.created_at ? format(new Date((user.createdAt || user.created_at) as string), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.status === 'blocked' ? (
                            <DropdownMenuItem onClick={() => handleUnblock(user._id)} className="text-green-600">
                              <Check className="mr-2 h-4 w-4" /> Unblock
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleBlock(user._id)} className="text-destructive">
                              <Ban className="mr-2 h-4 w-4" /> Block
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
