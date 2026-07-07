import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Loader2, ShoppingBag, MoreHorizontal, Eye, ArrowRight, RefreshCw, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import vendorApiService from '@/services/vendorApi';
import type { VendorOrder, Vendor } from '@/types/vendor';

const ORDER_STATUSES = ['placed','auto_assigned','vendor_accepted','vendor_rejected','preparing','dispatched','in_transit','delivered','cancelled','returned'];

export default function VendorOrders() {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [detailOrder, setDetailOrder] = useState<VendorOrder | null>(null);
  const [reassignDialog, setReassignDialog] = useState<string | null>(null);
  const [reassignVendor, setReassignVendor] = useState('');
  const [statusDialog, setStatusDialog] = useState<{ id: string; current: string } | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingId, setTrackingId] = useState('');

  useEffect(() => { fetchOrders(); fetchVendors(); }, [statusFilter, vendorFilter]);

  const fetchOrders = async () => {
    try { setLoading(true); const params: any = {}; if (statusFilter !== 'all') params.status = statusFilter; if (vendorFilter !== 'all') params.vendor_id = vendorFilter; if (searchQuery) params.search = searchQuery; const data = await vendorApiService.getOrders(params); setOrders(data as VendorOrder[]); } catch { toast.error('Failed to load orders'); } finally { setLoading(false); }
  };
  const fetchVendors = async () => { try { const data = await vendorApiService.getVendors({}); setVendors(data as Vendor[]); } catch {} };

  const filtered = orders.filter(o => { const q = searchQuery.toLowerCase(); return o.order_id.toLowerCase().includes(q) || (o.vendor?.vendor_name || '').toLowerCase().includes(q) || (o.customer?.name || '').toLowerCase().includes(q); });

  const handleUpdateStatus = async () => {
    if (!statusDialog || !newStatus) return;
    try { const data: any = {}; if (trackingId) data.courier_tracking_id = trackingId; await vendorApiService.updateOrderStatus(statusDialog.id, newStatus, data); toast.success('Status updated'); setStatusDialog(null); setNewStatus(''); setTrackingId(''); fetchOrders(); } catch { toast.error('Failed to update status'); }
  };

  const handleReassign = async () => {
    if (!reassignDialog || !reassignVendor) return;
    try { await vendorApiService.reassignOrder(reassignDialog, reassignVendor); toast.success('Order reassigned'); setReassignDialog(null); setReassignVendor(''); fetchOrders(); } catch { toast.error('Failed to reassign'); }
  };

  const handleCancel = async (id: string) => { try { await vendorApiService.cancelOrder(id, 'Cancelled by admin'); toast.success('Order cancelled'); fetchOrders(); } catch { toast.error('Failed'); } };

  const statusColor = (s: string) => {
    const c: Record<string, string> = { placed: 'bg-blue-100 text-blue-700', auto_assigned: 'bg-purple-100 text-purple-700', vendor_accepted: 'bg-indigo-100 text-indigo-700', vendor_rejected: 'bg-red-100 text-red-700', preparing: 'bg-amber-100 text-amber-700', dispatched: 'bg-cyan-100 text-cyan-700', in_transit: 'bg-orange-100 text-orange-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700', returned: 'bg-rose-100 text-rose-700' };
    return c[s] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div><h1 className="text-xl md:text-2xl font-bold">Vendor Orders</h1><p className="text-sm text-muted-foreground">Non-instant delivery orders — 2-4 day fulfillment cycle</p></div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search orders..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyPress={e => e.key === 'Enter' && fetchOrders()} className="pl-9" /></div><Button variant="outline" onClick={fetchOrders} size="icon"><Search className="h-4 w-4" /></Button></div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="flex-1"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem>{ORDER_STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}</SelectContent></Select>
          <Select value={vendorFilter} onValueChange={setVendorFilter}><SelectTrigger className="flex-1"><SelectValue placeholder="Vendor" /></SelectTrigger><SelectContent><SelectItem value="all">All Vendors</SelectItem>{vendors.map(v => <SelectItem key={v._id} value={v._id}>{v.vendor_name}</SelectItem>)}</SelectContent></Select>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Order ID</TableHead><TableHead>Vendor</TableHead><TableHead>Customer</TableHead><TableHead>Products</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Tracking</TableHead><TableHead>ETA</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={9} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow> : filtered.length === 0 ? <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground"><ShoppingBag className="h-10 w-10 mx-auto mb-2 opacity-30" />No orders found</TableCell></TableRow> : filtered.map(o => (
              <TableRow key={o._id} className="hover:bg-muted/40">
                <TableCell className="font-mono text-sm font-medium">{o.order_id}</TableCell>
                <TableCell><div className="text-sm"><p className="font-medium">{o.vendor?.vendor_name || 'Unassigned'}</p><p className="text-xs text-muted-foreground">{o.vendor?.origin_location}</p></div></TableCell>
                <TableCell><div className="text-sm"><p className="font-medium">{o.customer?.name}</p><p className="text-xs text-muted-foreground">{o.customer?.phone}</p></div></TableCell>
                <TableCell><span className="text-sm">{(o.products || []).length} item(s)</span></TableCell>
                <TableCell className="font-semibold">₹{o.total_amount}</TableCell>
                <TableCell><Badge className={statusColor(o.status)}>{o.status.replace(/_/g, ' ')}</Badge></TableCell>
                <TableCell className="text-sm font-mono">{o.courier_tracking_id || '—'}</TableCell>
                <TableCell className="text-sm">{o.delivery_eta || '—'}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setDetailOrder(o)}><Eye className="h-4 w-4 mr-2" />View Details</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setStatusDialog({ id: o._id, current: o.status }); setNewStatus(''); }}><ArrowRight className="h-4 w-4 mr-2" />Update Status</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setReassignDialog(o._id)}><RefreshCw className="h-4 w-4 mr-2" />Reassign Vendor</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => handleCancel(o._id)}><X className="h-4 w-4 mr-2" />Cancel Order</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!detailOrder} onOpenChange={() => setDetailOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Order Details — {detailOrder?.order_id}</DialogTitle></DialogHeader>
          {detailOrder && <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-muted-foreground">Vendor</p><p className="font-medium">{detailOrder.vendor?.vendor_name}</p></div>
              <div><p className="text-muted-foreground">Status</p><Badge className={statusColor(detailOrder.status)}>{detailOrder.status.replace(/_/g, ' ')}</Badge></div>
              <div><p className="text-muted-foreground">Customer</p><p className="font-medium">{detailOrder.customer?.name}</p></div>
              <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{detailOrder.customer?.phone}</p></div>
              <div><p className="text-muted-foreground">Amount</p><p className="font-bold text-lg">₹{detailOrder.total_amount}</p></div>
              <div><p className="text-muted-foreground">Payment</p><Badge variant="outline">{detailOrder.payment_status}</Badge></div>
              <div><p className="text-muted-foreground">Tracking ID</p><p className="font-mono">{detailOrder.courier_tracking_id || '—'}</p></div>
              <div><p className="text-muted-foreground">ETA</p><p>{detailOrder.delivery_eta || '—'}</p></div>
            </div>
            <div><p className="text-muted-foreground mb-1">Products</p>{(detailOrder.products || []).map((p, i) => <div key={i} className="flex justify-between p-2 bg-muted/50 rounded mb-1"><span>{p.name} x{p.quantity}</span><span className="font-medium">₹{p.price * p.quantity}</span></div>)}</div>
            <div><p className="text-muted-foreground">Delivery Address</p><p>{detailOrder.customer?.address}</p></div>
          </div>}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={!!statusDialog} onOpenChange={() => setStatusDialog(null)}>
        <DialogContent><DialogHeader><DialogTitle>Update Order Status</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Current Status</Label><Badge className={statusColor(statusDialog?.current || '')}>{(statusDialog?.current || '').replace(/_/g, ' ')}</Badge></div>
            <div><Label>New Status</Label><Select value={newStatus} onValueChange={setNewStatus}><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent>{ORDER_STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}</SelectContent></Select></div>
            {(newStatus === 'dispatched' || newStatus === 'in_transit') && <div><Label>Courier Tracking ID</Label><Input value={trackingId} onChange={e => setTrackingId(e.target.value)} placeholder="Enter tracking ID" /></div>}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setStatusDialog(null)}>Cancel</Button><Button onClick={handleUpdateStatus} className="bg-amber-500 hover:bg-amber-600 text-white">Update Status</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reassign Dialog */}
      <Dialog open={!!reassignDialog} onOpenChange={() => setReassignDialog(null)}>
        <DialogContent><DialogHeader><DialogTitle>Reassign to Another Vendor</DialogTitle></DialogHeader>
          <div><Label>Select Vendor</Label><Select value={reassignVendor} onValueChange={setReassignVendor}><SelectTrigger><SelectValue placeholder="Choose vendor" /></SelectTrigger><SelectContent>{vendors.filter(v => v.status === 'active').map(v => <SelectItem key={v._id} value={v._id}>{v.vendor_name} — {v.origin_location}</SelectItem>)}</SelectContent></Select></div>
          <DialogFooter><Button variant="outline" onClick={() => setReassignDialog(null)}>Cancel</Button><Button onClick={handleReassign} className="bg-amber-500 hover:bg-amber-600 text-white">Reassign</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
