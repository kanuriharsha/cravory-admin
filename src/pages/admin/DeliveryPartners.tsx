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
import { DeliveryPartner } from '@/types/admin';
import { 
  Search, 
  MoreHorizontal,
  Ban,
  Check,
  Mail,
  Phone,
  Star,
  Truck,
  MapPin,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function DeliveryPartners() {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveryPartners();
  }, []);

  const fetchDeliveryPartners = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      
      const data = await apiService.getDeliveryPartners(params);
      const partners = Array.isArray(data) ? data : [];
      setPartners(partners as DeliveryPartner[]);
      console.log('Delivery partners loaded:', partners.length);
    } catch (error) {
      console.error('Error fetching delivery partners:', error);
      toast.error('Failed to load delivery partners');
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchDeliveryPartners();
  };

  const filteredPartners = partners.filter(partner => 
    partner.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.phone?.includes(searchQuery)
  );

  const handleBlock = async (id: string) => {
    try {
      await apiService.blockUser(id);
      toast.success('Delivery partner blocked');
      fetchDeliveryPartners();
    } catch (error) {
      console.error('Error blocking delivery partner:', error);
      toast.error('Failed to block delivery partner');
    }
  };

  const handleUnblock = async (id: string) => {
    try {
      await apiService.unblockUser(id);
      toast.success('Delivery partner unblocked');
      fetchDeliveryPartners();
    } catch (error) {
      console.error('Error unblocking delivery partner:', error);
      toast.error('Failed to unblock delivery partner');
    }
  };

  const handleToggleAvailability = async (id: string, isAvailable: boolean) => {
    try {
      await apiService.togglePartnerAvailability(id, !isAvailable);
      toast.success(`Delivery partner marked as ${!isAvailable ? 'available' : 'unavailable'}`);
      fetchDeliveryPartners();
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error('Failed to update availability');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Delivery Partners</h1>
        <p className="text-sm text-muted-foreground">View and manage delivery partner accounts</p>
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
        ) : filteredPartners.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No delivery partners found</div>
        ) : (
          filteredPartners.map((partner) => (
            <div key={partner._id} className="bg-card border rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-green-400 to-emerald-500 text-white text-sm">
                      {(partner.name || 'DP').split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{partner.name || 'Unknown Partner'}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant={partner.is_available ? 'default' : 'secondary'} className="text-xs py-0">
                        {partner.is_available ? 'Online' : 'Offline'}
                      </Badge>
                      <StatusBadge status={partner.status || 'active'} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-sm">{partner.rating || 0}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate text-xs">{partner.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-xs">{partner.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Truck className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-xs">{partner.vehicle_type || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-xs truncate">{partner.current_zone || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{partner.total_deliveries || 0} deliveries</span>
                {partner.status === 'blocked' ? (
                  <Button size="sm" variant="outline" className="text-green-600 h-7 text-xs" onClick={() => handleUnblock(partner._id)}>
                    <Check className="mr-1 h-3.5 w-3.5" /> Unblock
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="text-destructive h-7 text-xs" onClick={() => handleBlock(partner._id)}>
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
                <TableHead>Partner</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="hidden lg:table-cell">Vehicle</TableHead>
                <TableHead className="hidden lg:table-cell">Zone</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="hidden lg:table-cell">Deliveries</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : filteredPartners.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No delivery partners found</TableCell></TableRow>
              ) : (
                filteredPartners.map((partner) => (
                  <TableRow key={partner._id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-gradient-to-br from-green-400 to-emerald-500 text-white text-sm">
                            {(partner.name || 'DP').split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{partner.name || 'Unknown Partner'}</p>
                          <p className="text-xs text-muted-foreground">ID: {partner._id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="text-sm flex items-center gap-1"><Mail className="h-3 w-3 text-muted-foreground" />{partner.email || 'N/A'}</p>
                        <p className="text-sm flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground" />{partner.phone || 'N/A'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1"><Truck className="h-4 w-4 text-muted-foreground" />{partner.vehicle_type || 'N/A'}</div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{partner.current_zone || 'N/A'}</span></div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{partner.rating || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell font-medium">{partner.total_deliveries || 0}</TableCell>
                    <TableCell>
                      <Badge variant={partner.is_available ? 'default' : 'secondary'}>
                        {partner.is_available ? 'Online' : 'Offline'}
                      </Badge>
                    </TableCell>
                    <TableCell><StatusBadge status={partner.status || 'active'} /></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {partner.status === 'blocked' ? (
                            <DropdownMenuItem onClick={() => handleUnblock(partner._id)} className="text-green-600">
                              <Check className="mr-2 h-4 w-4" /> Unblock
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleBlock(partner._id)} className="text-destructive">
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
