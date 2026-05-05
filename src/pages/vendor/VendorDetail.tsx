import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, MapPin, Phone, Mail, Star, Package, ShoppingBag, TrendingUp, Shield, Clock, AlertTriangle, Check, Ban, Pause, Bell, FileText, User, Activity } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import vendorApiService from '@/services/vendorApi';
import type { Vendor } from '@/types/vendor';

export default function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [suspendDialog, setSuspendDialog] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [warnDialog, setWarnDialog] = useState(false);
  const [warnMessage, setWarnMessage] = useState('');

  useEffect(() => { if (id) fetchVendor(); }, [id]);

  const fetchVendor = async () => {
    try { setLoading(true); const data = await vendorApiService.getVendor(id!) as Vendor; setVendor(data); }
    catch { toast.error('Failed to load vendor'); }
    finally { setLoading(false); }
  };

  const handleApprove = async () => { try { await vendorApiService.approveVendor(id!); toast.success('Vendor approved'); fetchVendor(); } catch { toast.error('Failed'); } };
  const handleBlock = async () => { try { await vendorApiService.blockVendor(id!); toast.success('Vendor blocked'); fetchVendor(); } catch { toast.error('Failed'); } };
  const handleUnblock = async () => { try { await vendorApiService.unblockVendor(id!); toast.success('Vendor unblocked'); fetchVendor(); } catch { toast.error('Failed'); } };
  const handleSuspend = async () => { try { await vendorApiService.suspendVendor(id!, suspendReason); toast.success('Vendor suspended'); setSuspendDialog(false); setSuspendReason(''); fetchVendor(); } catch { toast.error('Failed'); } };
  const handleWarn = async () => { try { await vendorApiService.warnVendor(id!, warnMessage); toast.success('Warning sent'); setWarnDialog(false); setWarnMessage(''); } catch { toast.error('Failed'); } };

  const statusBadge = (s: string) => {
    const c: Record<string,string> = { active:'bg-green-100 text-green-700', pending:'bg-amber-100 text-amber-700', blocked:'bg-red-100 text-red-700', suspended:'bg-orange-100 text-orange-700' };
    return <Badge className={`${c[s]||'bg-gray-100 text-gray-700'} text-sm px-3 py-1`}>{s.toUpperCase()}</Badge>;
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;
  if (!vendor) return <div className="text-center py-12"><p>Vendor not found</p><Button onClick={()=>navigate('/admin/vendors/list')} className="mt-4">Back to List</Button></div>;

  const perf = vendor.performance || { total_orders:0, accepted_orders:0, rejected_orders:0, acceptance_rate:0, dispatch_delays:0, return_rate:0, damage_rate:0, rating:0, total_reviews:0, total_revenue:0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={()=>navigate('/admin/vendors/list')}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1"><h1 className="text-2xl font-bold">{vendor.vendor_name}</h1><p className="text-sm text-muted-foreground">{vendor.origin_location} • {vendor.category}</p></div>
        {statusBadge(vendor.status)}
      </div>

      {/* Action Bar */}
      <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {vendor.status==='pending'&&<Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleApprove}><Check className="h-4 w-4 mr-1" />Approve</Button>}
            {vendor.status==='active'&&<Button size="sm" variant="outline" className="text-orange-600 border-orange-300" onClick={handleBlock}><Ban className="h-4 w-4 mr-1" />Block</Button>}
            {(vendor.status==='blocked'||vendor.status==='suspended')&&<Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleUnblock}><Check className="h-4 w-4 mr-1" />Unblock</Button>}
            {vendor.status==='active'&&<Button size="sm" variant="outline" className="text-amber-600 border-amber-300" onClick={()=>setSuspendDialog(true)}><Pause className="h-4 w-4 mr-1" />Suspend</Button>}
            <Button size="sm" variant="outline" onClick={()=>setWarnDialog(true)}><Bell className="h-4 w-4 mr-1" />Send Warning</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="identity" className="space-y-4">
        <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="identity" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"><User className="h-4 w-4 mr-1" />Identity</TabsTrigger>
          <TabsTrigger value="products" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"><Package className="h-4 w-4 mr-1" />Products</TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"><TrendingUp className="h-4 w-4 mr-1" />Performance</TabsTrigger>
          <TabsTrigger value="login" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"><Shield className="h-4 w-4 mr-1" />Login & Activity</TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"><FileText className="h-4 w-4 mr-1" />Documents</TabsTrigger>
          <TabsTrigger value="logistics" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"><Activity className="h-4 w-4 mr-1" />Logistics</TabsTrigger>
        </TabsList>

        <TabsContent value="identity" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader><CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Vendor Name</p><p className="font-medium">{vendor.vendor_name}</p></div>
                <div><p className="text-muted-foreground">Owner Name</p><p className="font-medium">{vendor.owner_name}</p></div>
                <div><p className="text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />Phone</p><p className="font-medium">{vendor.phone}</p></div>
                <div><p className="text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />Email</p><p className="font-medium">{vendor.email||'N/A'}</p></div>
              </div>
            </CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Location & Origin</CardTitle></CardHeader><CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div><p className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />Full Address</p><p className="font-medium">{vendor.address?.full_address||'N/A'}</p></div>
                <div><p className="text-muted-foreground">City / State / Pin</p><p className="font-medium">{vendor.address?.city}, {vendor.address?.state} - {vendor.address?.pincode}</p></div>
                <div><p className="text-muted-foreground">Origin</p><p className="font-medium">{vendor.origin_location}</p></div>
              </div>
            </CardContent></Card>
            <Card className="md:col-span-2"><CardHeader><CardTitle className="text-base">Origin Story & Specialty</CardTitle></CardHeader><CardContent>
              <p className="text-sm mb-3">{vendor.origin_story||'No origin story provided.'}</p>
              <div className="flex flex-wrap gap-2">{(vendor.specialty_items||[]).map(s=><Badge key={s} className="bg-amber-100 text-amber-700">{s}</Badge>)}</div>
              <div className="flex gap-4 mt-3 text-sm">
                <span>KYC: {vendor.kyc_verified?<Badge className="bg-green-100 text-green-700">Verified</Badge>:<Badge className="bg-red-100 text-red-700">Unverified</Badge>}</span>
                <span>Badge: {vendor.authenticity_badge?<Badge className="bg-amber-100 text-amber-700">Authentic</Badge>:<Badge variant="outline">None</Badge>}</span>
              </div>
            </CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card><CardHeader><CardTitle className="text-base">Assigned Products (Read-Only)</CardTitle></CardHeader><CardContent>
            {(vendor.assigned_products||[]).length>0 ? <div className="space-y-2">{vendor.assigned_products.map((p,i)=><div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><span className="font-medium text-sm">{p}</span><Badge variant="outline">Assigned</Badge></div>)}</div> : <p className="text-sm text-muted-foreground text-center py-4">No products assigned yet</p>}
          </CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Capacity Details</CardTitle></CardHeader><CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><p className="text-muted-foreground">Max Orders/Day</p><p className="font-bold text-lg">{vendor.capacity?.max_orders_per_day||0}</p></div>
              <div><p className="text-muted-foreground">Prep Time</p><p className="font-bold text-lg">{vendor.capacity?.preparation_time||'N/A'}</p></div>
              <div><p className="text-muted-foreground">Packaging</p><p className="font-bold text-lg">{vendor.capacity?.packaging_type||'N/A'}</p></div>
              <div><p className="text-muted-foreground">Shelf-Life Aware</p><p className="font-bold text-lg">{vendor.capacity?.shelf_life_awareness?'Yes':'No'}</p></div>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {label:'Total Orders',value:perf.total_orders,icon:ShoppingBag,color:'text-blue-600 bg-blue-100'},
              {label:'Accepted',value:perf.accepted_orders,icon:Check,color:'text-green-600 bg-green-100'},
              {label:'Rejected',value:perf.rejected_orders,icon:AlertTriangle,color:'text-red-600 bg-red-100'},
              {label:'Revenue',value:`₹${perf.total_revenue.toLocaleString()}`,icon:TrendingUp,color:'text-emerald-600 bg-emerald-100'},
            ].map(({label,value,icon:I,color})=>(
              <Card key={label}><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-bold mt-1">{value}</p></div><div className={`h-10 w-10 rounded-lg ${color} flex items-center justify-center`}><I className="h-5 w-5" /></div></div></CardContent></Card>
            ))}
          </div>
          <Card><CardHeader><CardTitle className="text-base">Performance Metrics</CardTitle></CardHeader><CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div><p className="text-muted-foreground">Acceptance Rate</p><p className="text-2xl font-bold text-green-600">{(perf.acceptance_rate*100).toFixed(1)}%</p></div>
              <div><p className="text-muted-foreground">Return Rate</p><p className="text-2xl font-bold text-red-600">{(perf.return_rate*100).toFixed(1)}%</p></div>
              <div><p className="text-muted-foreground">Rating</p><p className="text-2xl font-bold text-amber-600 flex items-center gap-1"><Star className="h-5 w-5 fill-amber-400 text-amber-400" />{perf.rating}</p></div>
              <div><p className="text-muted-foreground">Reviews</p><p className="text-2xl font-bold">{perf.total_reviews}</p></div>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="login" className="space-y-4">
          <Card><CardHeader><CardTitle className="text-base">Login Details</CardTitle></CardHeader><CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-muted-foreground">Login ID</p><p className="font-mono font-medium">{vendor.login?.login_id||'N/A'}</p></div>
              <div><p className="text-muted-foreground">Last Login</p><p className="font-medium">{vendor.login?.last_login?new Date(vendor.login.last_login).toLocaleString():'Never'}</p></div>
            </div>
          </CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Activity Logs</CardTitle></CardHeader><CardContent>
            {(vendor.activity_logs||[]).length>0 ? <div className="space-y-2">{vendor.activity_logs.slice(0,10).map((l,i)=><div key={i} className="flex items-center justify-between p-2 rounded bg-muted/50 text-sm"><span>{l.action}</span><span className="text-xs text-muted-foreground">{new Date(l.timestamp).toLocaleString()}</span></div>)}</div> : <p className="text-sm text-muted-foreground text-center py-4">No activity logs yet</p>}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card><CardHeader><CardTitle className="text-base">KYC & Verification Documents</CardTitle></CardHeader><CardContent>
            {(vendor.documents||[]).length>0 ? <div className="space-y-2">{vendor.documents.map((d,i)=><div key={i} className="flex items-center justify-between p-3 rounded-lg border"><div className="flex items-center gap-3"><FileText className="h-5 w-5 text-amber-600" /><div><p className="font-medium text-sm">{d.name}</p><p className="text-xs text-muted-foreground">{d.type} • Uploaded {new Date(d.uploaded_at).toLocaleDateString()}</p></div></div></div>)}</div> : <p className="text-sm text-muted-foreground text-center py-8">No documents uploaded yet</p>}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="logistics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle className="text-base">Shipping Details</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
              <div><p className="text-muted-foreground">Coverage</p><Badge className="bg-amber-100 text-amber-700">{vendor.delivery_coverage==='pan_india'?'Pan India':'Regional'}</Badge></div>
              <div><p className="text-muted-foreground">Shipping Regions</p><div className="flex flex-wrap gap-1 mt-1">{(vendor.logistics?.shipping_regions||[]).map(r=><Badge key={r} variant="outline" className="text-xs">{r}</Badge>)}</div></div>
              <div><p className="text-muted-foreground">Dispatch SLA</p><p className="font-medium">{vendor.logistics?.dispatch_sla||'N/A'}</p></div>
            </CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Courier Compatibility</CardTitle></CardHeader><CardContent>
              <div className="flex flex-wrap gap-2">{(vendor.logistics?.courier_compatibility||[]).map(c=><Badge key={c} className="bg-blue-100 text-blue-700">{c}</Badge>)}</div>
              {(vendor.logistics?.courier_compatibility||[]).length===0 && <p className="text-sm text-muted-foreground">No couriers configured</p>}
            </CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Suspend Dialog */}
      <Dialog open={suspendDialog} onOpenChange={setSuspendDialog}><DialogContent><DialogHeader><DialogTitle>Suspend Vendor</DialogTitle></DialogHeader><div className="space-y-3"><Label>Reason for Suspension</Label><Textarea value={suspendReason} onChange={e=>setSuspendReason(e.target.value)} placeholder="Enter reason..." rows={3} /></div><DialogFooter><Button variant="outline" onClick={()=>setSuspendDialog(false)}>Cancel</Button><Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleSuspend}>Suspend</Button></DialogFooter></DialogContent></Dialog>
      {/* Warn Dialog */}
      <Dialog open={warnDialog} onOpenChange={setWarnDialog}><DialogContent><DialogHeader><DialogTitle>Send Warning</DialogTitle></DialogHeader><div className="space-y-3"><Label>Warning Message</Label><Textarea value={warnMessage} onChange={e=>setWarnMessage(e.target.value)} placeholder="Enter warning..." rows={3} /></div><DialogFooter><Button variant="outline" onClick={()=>setWarnDialog(false)}>Cancel</Button><Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={handleWarn}>Send Warning</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
