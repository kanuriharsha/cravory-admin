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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { StatusBadge } from '@/components/admin/StatusBadge';
import apiService from '@/services/api';
import { Order, DeliveryPartner } from '@/types/admin';
import { 
  Search, 
  MoreHorizontal,
  Truck,
  Clock,
  User,
  MapPin,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';

const ORDER_STATUSES = ['placed', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled'] as const;

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [availablePartners, setAvailablePartners] = useState<DeliveryPartner[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [restaurantFilter, setRestaurantFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');

  useEffect(() => {
    fetchOrders();
    fetchZones();
    fetchRestaurants();
    fetchDeliveryPartners();
  }, [statusFilter, zoneFilter, restaurantFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (zoneFilter !== 'all') params.zone = zoneFilter;
      if (restaurantFilter !== 'all') params.restaurant = restaurantFilter;
      if (searchQuery) params.search = searchQuery;
      
      console.log('Fetching orders with params:', params);
      const data = await apiService.getOrders(params);
      console.log('Orders fetched:', data);
      
      // Ensure data is an array
      const ordersArray = Array.isArray(data) ? data : [];
      setOrders(ordersArray as Order[]);
      
      if (ordersArray.length === 0) {
        console.log('No orders found in response');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders. Make sure backend is running on port 5000.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchZones = async () => {
    try {
      const data = await apiService.getZones();
      setZones(data as any[]);
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const data = await apiService.getRestaurants({});
      setRestaurants(data as any[]);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const fetchDeliveryPartners = async () => {
    try {
      const data = await apiService.getDeliveryPartners({ available: true, status: 'active' });
      setAvailablePartners(data as DeliveryPartner[]);
    } catch (error) {
      console.error('Error fetching delivery partners:', error);
    }
  };

  const handleSearch = () => {
    fetchOrders();
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredOrders = orders
    .filter((order: any) => {
      if (!searchQuery) return true; // Show all orders when no search query
      
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        order._id?.toLowerCase().includes(searchLower) ||
        order.order_id?.toLowerCase().includes(searchLower) ||
        order.userId?.toLowerCase().includes(searchLower) ||
        order.customer?.name?.toLowerCase().includes(searchLower) ||
        order.restaurantName?.toLowerCase().includes(searchLower) ||
        order.restaurant?.name?.toLowerCase().includes(searchLower);
      
      return matchesSearch;
    })
    .sort((a: any, b: any) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'createdAt':
          aValue = new Date(a.createdAt || a.created_at || 0).getTime();
          bValue = new Date(b.createdAt || b.created_at || 0).getTime();
          break;
        case 'total':
          aValue = a.total_amount || a.total || 0;
          bValue = b.total_amount || b.total || 0;
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'restaurant':
          aValue = (a.restaurant?.name || a.restaurantName || '').toLowerCase();
          bValue = (b.restaurant?.name || b.restaurantName || '').toLowerCase();
          break;
        case 'customer':
          aValue = (a.customer?.name || a.userId || '').toLowerCase();
          bValue = (b.customer?.name || b.userId || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const handleStatusChange = async () => {
    if (selectedOrder && newStatus) {
      try {
        await apiService.updateOrderStatus(selectedOrder._id, newStatus);
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders();
        setIsStatusDialogOpen(false);
        setSelectedOrder(null);
        setNewStatus('');
      } catch (error) {
        console.error('Error updating order status:', error);
        toast.error('Failed to update order status');
      }
    }
  };

  const handleAssignPartner = async () => {
    if (selectedOrder && selectedPartnerId) {
      try {
        await apiService.assignDeliveryPartner(selectedOrder._id, selectedPartnerId);
        const partner = availablePartners.find(p => p._id === selectedPartnerId);
        toast.success(`${partner?.name} assigned to order`);
        fetchOrders();
        setIsAssignDialogOpen(false);
        setSelectedOrder(null);
        setSelectedPartnerId('');
      } catch (error) {
        console.error('Error assigning delivery partner:', error);
        toast.error('Failed to assign delivery partner');
      }
    }
  };

  const openStatusDialog = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsStatusDialogOpen(true);
  };

  const openAssignDialog = (order: Order) => {
    setSelectedOrder(order);
    setSelectedPartnerId(order.delivery_partner?._id || '');
    setIsAssignDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">View and manage all orders across the platform</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon" onClick={handleSearch} className="shrink-0">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {ORDER_STATUSES.map(status => (
                <SelectItem key={status} value={status} className="capitalize">
                  {status.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={zoneFilter} onValueChange={setZoneFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Zones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Zones</SelectItem>
              {zones.map(zone => (
                <SelectItem key={zone._id} value={zone._id}>{zone.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={restaurantFilter} onValueChange={setRestaurantFilter}>
            <SelectTrigger className="col-span-2 md:col-span-1">
              <SelectValue placeholder="All Restaurants" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Restaurants</SelectItem>
              {restaurants.map(r => (
                <SelectItem key={r._id} value={r._id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No orders found</div>
        ) : (
          filteredOrders.map((order: any) => (
            <div key={order._id} className="bg-card border rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Order ID</p>
                  <p className="font-mono text-xs font-medium truncate">{order.order_id || order._id}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{order.customer?.name || order.userId || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{order.restaurant?.name || order.restaurantName || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground text-xs">
                    {order.items?.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) || 0} items
                  </span>
                </div>
                <div className="font-semibold text-base">&#8377;{order.total_amount || order.total || 0}</div>
              </div>
              {order.delivery_partner ? (
                <div className="flex items-center gap-1.5 text-sm text-green-700 bg-green-50 rounded-lg px-2 py-1">
                  <Truck className="h-3.5 w-3.5" />
                  <span>{order.delivery_partner.name}</span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No delivery partner assigned</p>
              )}
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => openStatusDialog(order)}>
                  Change Status
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => openAssignDialog(order)}>
                  <Truck className="h-3.5 w-3.5 mr-1" />
                  {order.delivery_partner ? 'Reassign' : 'Assign'}
                </Button>
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
                <TableHead>Order ID</TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" className="h-8 -ml-3 font-semibold" onClick={() => handleSort('customer')}>
                    Customer
                    {sortField === 'customer' ? (sortOrder === 'asc' ? <ArrowUp className="ml-2 h-3 w-3" /> : <ArrowDown className="ml-2 h-3 w-3" />) : <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" />}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" className="h-8 -ml-3 font-semibold" onClick={() => handleSort('restaurant')}>
                    Restaurant
                    {sortField === 'restaurant' ? (sortOrder === 'asc' ? <ArrowUp className="ml-2 h-3 w-3" /> : <ArrowDown className="ml-2 h-3 w-3" />) : <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" />}
                  </Button>
                </TableHead>
                <TableHead>Items</TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" className="h-8 -ml-3 font-semibold" onClick={() => handleSort('total')}>
                    Amount
                    {sortField === 'total' ? (sortOrder === 'asc' ? <ArrowUp className="ml-2 h-3 w-3" /> : <ArrowDown className="ml-2 h-3 w-3" />) : <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" />}
                  </Button>
                </TableHead>
                <TableHead>Delivery Partner</TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" className="h-8 -ml-3 font-semibold" onClick={() => handleSort('status')}>
                    Status
                    {sortField === 'status' ? (sortOrder === 'asc' ? <ArrowUp className="ml-2 h-3 w-3" /> : <ArrowDown className="ml-2 h-3 w-3" />) : <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" />}
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No orders found</TableCell></TableRow>
              ) : (
                filteredOrders.map((order: any) => (
                  <TableRow key={order._id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs">{order.order_id || order._id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{order.customer?.name || order.userId || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">{order.customer?.phone || 'N/A'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{order.restaurant?.name || order.restaurantName || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{order.items?.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) || 0} items</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">&#8377;{order.total_amount || order.total || 0}</TableCell>
                    <TableCell>
                      {order.delivery_partner ? (
                        <div className="flex items-center gap-1.5">
                          <Truck className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{order.delivery_partner.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell><StatusBadge status={order.status} /></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openStatusDialog(order)}>Change Status</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openAssignDialog(order)}>
                            <Truck className="mr-2 h-4 w-4" />
                            {order.delivery_partner ? 'Reassign Partner' : 'Assign Partner'}
                          </DropdownMenuItem>
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

      {/* Change Status Dialog */}
      <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Order Status</AlertDialogTitle>
            <AlertDialogDescription>
              Update the status for order {selectedOrder?.order_id}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label>New Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map(status => (
                  <SelectItem key={status} value={status} className="capitalize">
                    {status.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusChange}>
              Update Status
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Partner Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Delivery Partner</DialogTitle>
            <DialogDescription>
              Select a delivery partner for order {selectedOrder?.order_id}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Available Partners</Label>
            <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a partner" />
              </SelectTrigger>
              <SelectContent>
                {availablePartners.length > 0 ? (
                  availablePartners.map(partner => (
                    <SelectItem key={partner._id} value={partner._id}>
                      <div className="flex items-center gap-2">
                        <span>{partner.name}</span>
                        <Badge variant="outline" className="text-xs">
                          ★ {partner.rating}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {partner.current_zone}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>No partners available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignPartner} disabled={!selectedPartnerId}>
              Assign Partner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
