import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, DollarSign, TrendingUp, CreditCard, Clock, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import vendorApiService from '@/services/vendorApi';
import type { VendorEarning } from '@/types/vendor';

export default function VendorEarnings() {
  const [earnings, setEarnings] = useState<VendorEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [payoutFilter, setPayoutFilter] = useState('all');
  const [totals, setTotals] = useState({ revenue: 0, commission: 0, shipping: 0, net: 0 });

  useEffect(() => { fetchEarnings(); }, [payoutFilter]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (payoutFilter !== 'all') params.payout_status = payoutFilter;
      const data = await vendorApiService.getEarnings(params) as VendorEarning[];
      setEarnings(data);
      setTotals({
        revenue: data.reduce((s, e) => s + (e.total_revenue || 0), 0),
        commission: data.reduce((s, e) => s + (e.commission_amount || 0), 0),
        shipping: data.reduce((s, e) => s + (e.shipping_cost || 0), 0),
        net: data.reduce((s, e) => s + (e.net_earnings || 0), 0),
      });
    } catch { toast.error('Failed to load earnings'); setEarnings([]); } finally { setLoading(false); }
  };

  const handlePayout = async (id: string, status: string) => {
    try { await vendorApiService.updatePayoutStatus(id, status); toast.success(`Payout marked as ${status}`); fetchEarnings(); } catch { toast.error('Failed to update payout'); }
  };

  const payoutBadge = (s: string) => {
    const c: Record<string, string> = { pending: 'bg-amber-100 text-amber-700', processing: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700' };
    return <Badge className={c[s] || 'bg-gray-100 text-gray-700'}>{s}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl md:text-2xl font-bold">Vendor Earnings & Settlements</h1><p className="text-sm text-muted-foreground">Commission breakdowns, payouts, and revenue reports</p></div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Revenue', value: `₹${totals.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-100' },
          { label: 'Commission Earned', value: `₹${totals.commission.toLocaleString()}`, icon: DollarSign, color: 'text-amber-600 bg-amber-100' },
          { label: 'Shipping Costs', value: `₹${totals.shipping.toLocaleString()}`, icon: CreditCard, color: 'text-blue-600 bg-blue-100' },
          { label: 'Net to Vendors', value: `₹${totals.net.toLocaleString()}`, icon: Clock, color: 'text-purple-600 bg-purple-100' },
        ].map(({ label, value, icon: I, color }) => (
          <Card key={label}><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="text-2xl font-bold mt-1">{value}</p></div><div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center`}><I className="h-6 w-6" /></div></div></CardContent></Card>
        ))}
      </div>

      <div className="flex gap-2">
        <Select value={payoutFilter} onValueChange={setPayoutFilter}><SelectTrigger className="w-48"><SelectValue placeholder="Payout Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Payouts</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="processing">Processing</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent></Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Vendor</TableHead><TableHead>Period</TableHead><TableHead>Revenue</TableHead><TableHead>Commission</TableHead><TableHead>Shipping</TableHead><TableHead>Net Earnings</TableHead><TableHead>Orders</TableHead><TableHead>Payout</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={9} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow> : earnings.length === 0 ? <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground"><DollarSign className="h-10 w-10 mx-auto mb-2 opacity-30" />No earnings data</TableCell></TableRow> : earnings.map(e => (
              <TableRow key={e._id} className="hover:bg-muted/40">
                <TableCell className="font-medium">{e.vendor_name}</TableCell>
                <TableCell className="text-sm">{e.period}</TableCell>
                <TableCell className="font-medium">₹{(e.total_revenue || 0).toLocaleString()}</TableCell>
                <TableCell className="text-amber-600">₹{(e.commission_amount || 0).toLocaleString()}</TableCell>
                <TableCell>₹{(e.shipping_cost || 0).toLocaleString()}</TableCell>
                <TableCell className="font-bold text-emerald-600">₹{(e.net_earnings || 0).toLocaleString()}</TableCell>
                <TableCell>{e.orders_count}</TableCell>
                <TableCell>{payoutBadge(e.payout_status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {e.payout_status === 'pending' && <DropdownMenuItem onClick={() => handlePayout(e._id, 'processing')}>Mark Processing</DropdownMenuItem>}
                      {e.payout_status === 'processing' && <DropdownMenuItem onClick={() => handlePayout(e._id, 'completed')}>Mark Completed</DropdownMenuItem>}
                      {e.payout_status === 'completed' && <DropdownMenuItem disabled>Already Completed</DropdownMenuItem>}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
