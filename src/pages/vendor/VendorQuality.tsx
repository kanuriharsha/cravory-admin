import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShieldCheck, AlertTriangle, Star, TrendingDown, Ban, Bell, Eye, ArrowUpRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import vendorApiService from '@/services/vendorApi';
import type { Vendor } from '@/types/vendor';

export default function VendorQuality() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [flaggedVendors, setFlaggedVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [warnDialog, setWarnDialog] = useState<string | null>(null);
  const [warnMessage, setWarnMessage] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await vendorApiService.getVendors({}) as Vendor[];
      setVendors(data);
      // Flag vendors with poor performance
      setFlaggedVendors(data.filter(v => {
        const p = v.performance || {} as any;
        return (p.acceptance_rate || 1) < 0.7 || (p.return_rate || 0) > 0.1 || (p.rating || 5) < 3 || (p.dispatch_delays || 0) > 5;
      }));
    } catch { toast.error('Failed to load data'); } finally { setLoading(false); }
  };

  const handleWarn = async () => {
    if (!warnDialog || !warnMessage.trim()) { toast.error('Enter a warning message'); return; }
    try { await vendorApiService.warnVendor(warnDialog, warnMessage); toast.success('Warning sent'); setWarnDialog(null); setWarnMessage(''); } catch { toast.error('Failed to send warning'); }
  };

  const handleSuspend = async (id: string) => {
    try { await vendorApiService.suspendVendor(id, 'Performance below threshold'); toast.success('Vendor suspended'); fetchData(); } catch { toast.error('Failed'); }
  };

  const handleBlock = async (id: string) => {
    try { await vendorApiService.blockVendor(id); toast.success('Vendor blocked'); fetchData(); } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;

  // Calculate overall quality metrics
  const totalVendors = vendors.length;
  const avgAcceptRate = totalVendors > 0 ? vendors.reduce((s, v) => s + (v.performance?.acceptance_rate || 0), 0) / totalVendors : 0;
  const avgRating = totalVendors > 0 ? vendors.reduce((s, v) => s + (v.performance?.rating || 0), 0) / totalVendors : 0;
  const avgReturnRate = totalVendors > 0 ? vendors.reduce((s, v) => s + (v.performance?.return_rate || 0), 0) / totalVendors : 0;

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl md:text-2xl font-bold">Quality Control</h1><p className="text-sm text-muted-foreground">Monitor vendor performance, flag issues, and enforce quality standards</p></div>

      {/* Overall Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Vendors', value: totalVendors, icon: ShieldCheck, color: 'text-amber-600 bg-amber-100', border: 'border-l-amber-500' },
          { label: 'Avg Accept Rate', value: `${(avgAcceptRate * 100).toFixed(1)}%`, icon: TrendingDown, color: 'text-green-600 bg-green-100', border: 'border-l-green-500' },
          { label: 'Avg Rating', value: avgRating.toFixed(1), icon: Star, color: 'text-yellow-600 bg-yellow-100', border: 'border-l-yellow-500' },
          { label: 'Flagged Vendors', value: flaggedVendors.length, icon: AlertTriangle, color: 'text-red-600 bg-red-100', border: 'border-l-red-500' },
        ].map(({ label, value, icon: I, color, border }) => (
          <Card key={label} className={`border-l-4 ${border}`}><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-bold mt-1">{value}</p></div><div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center`}><I className="h-6 w-6" /></div></div></CardContent></Card>
        ))}
      </div>

      {/* Quality Thresholds */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Quality Thresholds</CardTitle><CardDescription>Vendors are automatically flagged when metrics fall below these values</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-muted/50"><p className="text-muted-foreground">Min Acceptance Rate</p><p className="text-lg font-bold text-green-600">70%</p></div>
            <div className="p-3 rounded-lg bg-muted/50"><p className="text-muted-foreground">Max Return Rate</p><p className="text-lg font-bold text-red-600">10%</p></div>
            <div className="p-3 rounded-lg bg-muted/50"><p className="text-muted-foreground">Min Rating</p><p className="text-lg font-bold text-amber-600">3.0</p></div>
            <div className="p-3 rounded-lg bg-muted/50"><p className="text-muted-foreground">Max Dispatch Delays</p><p className="text-lg font-bold text-orange-600">5</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Flagged Vendors */}
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-500" />Flagged Vendors ({flaggedVendors.length})</CardTitle></CardHeader>
        <CardContent>
          {flaggedVendors.length === 0 ? (
            <div className="text-center py-8"><ShieldCheck className="h-12 w-12 mx-auto mb-3 text-green-500" /><p className="text-sm text-muted-foreground">All vendors meet quality standards!</p></div>
          ) : (
            <div className="space-y-3">
              {flaggedVendors.map(v => {
                const p = v.performance || {} as any;
                const issues: string[] = [];
                if ((p.acceptance_rate || 1) < 0.7) issues.push(`Low acceptance: ${((p.acceptance_rate || 0) * 100).toFixed(0)}%`);
                if ((p.return_rate || 0) > 0.1) issues.push(`High returns: ${((p.return_rate || 0) * 100).toFixed(0)}%`);
                if ((p.rating || 5) < 3) issues.push(`Low rating: ${p.rating || 0}`);
                if ((p.dispatch_delays || 0) > 5) issues.push(`Dispatch delays: ${p.dispatch_delays}`);

                return (
                  <div key={v._id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center text-white font-bold">{v.vendor_name.charAt(0)}</div>
                        <div><p className="font-semibold">{v.vendor_name}</p><p className="text-xs text-muted-foreground">{v.origin_location}</p></div>
                      </div>
                      <Badge className="bg-red-100 text-red-700">{v.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">{issues.map(issue => <Badge key={issue} variant="outline" className="text-xs text-red-600 border-red-200">{issue}</Badge>)}</div>
                    <div className="grid grid-cols-4 gap-3 text-sm mb-3">
                      <div><p className="text-muted-foreground text-xs">Orders</p><p className="font-bold">{p.total_orders || 0}</p></div>
                      <div><p className="text-muted-foreground text-xs">Accept Rate</p><p className="font-bold">{((p.acceptance_rate || 0) * 100).toFixed(0)}%</p></div>
                      <div><p className="text-muted-foreground text-xs">Rating</p><p className="font-bold flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{p.rating || 0}</p></div>
                      <div><p className="text-muted-foreground text-xs">Revenue</p><p className="font-bold">₹{(p.total_revenue || 0).toLocaleString()}</p></div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/admin/vendors/${v._id}`)}><Eye className="h-3.5 w-3.5 mr-1" />View</Button>
                      <Button size="sm" variant="outline" className="text-amber-600" onClick={() => { setWarnDialog(v._id); setWarnMessage(''); }}><Bell className="h-3.5 w-3.5 mr-1" />Warn</Button>
                      <Button size="sm" variant="outline" className="text-orange-600" onClick={() => handleSuspend(v._id)}><AlertTriangle className="h-3.5 w-3.5 mr-1" />Suspend</Button>
                      <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleBlock(v._id)}><Ban className="h-3.5 w-3.5 mr-1" />Block</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warn Dialog */}
      <Dialog open={!!warnDialog} onOpenChange={() => setWarnDialog(null)}><DialogContent><DialogHeader><DialogTitle>Send Warning to Vendor</DialogTitle></DialogHeader><div className="space-y-3"><Label>Warning Message</Label><Textarea value={warnMessage} onChange={e => setWarnMessage(e.target.value)} placeholder="Describe the quality issue and expected improvement..." rows={4} /></div><DialogFooter><Button variant="outline" onClick={() => setWarnDialog(null)}>Cancel</Button><Button onClick={handleWarn} className="bg-amber-500 hover:bg-amber-600 text-white">Send Warning</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
