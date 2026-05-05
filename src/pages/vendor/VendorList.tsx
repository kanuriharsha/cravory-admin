import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Star, MapPin, MoreHorizontal, Check, X, Ban, Eye, Loader2, Trash2, Leaf, Users, Shield, Copy } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import vendorApiService from '@/services/vendorApi';
import type { Vendor } from '@/types/vendor';
import { INDIAN_REGIONS } from '@/types/vendor';

export default function VendorList() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generatedCreds, setGeneratedCreds] = useState<{id:string,pass:string}|null>(null);
  const [formData, setFormData] = useState({
    vendor_name: '', owner_name: '', phone: '', email: '',
    full_address: '', city: '', state: '', pincode: '',
    origin_location: '', origin_story: '', specialty_items: '',
    category: 'Traditional', delivery_coverage: 'regional' as 'regional'|'pan_india',
    max_orders_per_day: '10', preparation_time: '24 hours',
    packaging_type: 'Standard', shipping_regions: '',
    dispatch_sla: '2-4 days', courier_compatibility: '',
  });

  useEffect(() => { fetchVendors(); }, [statusFilter, regionFilter]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (regionFilter !== 'all') params.region = regionFilter;
      if (searchQuery) params.search = searchQuery;
      const data = await vendorApiService.getVendors(params);
      setVendors(data as Vendor[]);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors');
    } finally { setLoading(false); }
  };

  const filtered = vendors.filter(v => {
    const q = searchQuery.toLowerCase();
    return v.vendor_name.toLowerCase().includes(q) || v.origin_location.toLowerCase().includes(q) || (v.specialty_items||[]).join(' ').toLowerCase().includes(q);
  });

  const handleApprove = async (id: string) => { try { await vendorApiService.approveVendor(id); toast.success('Vendor approved'); fetchVendors(); } catch { toast.error('Failed to approve vendor'); } };
  const handleBlock = async (id: string) => { try { await vendorApiService.blockVendor(id); toast.success('Vendor blocked'); fetchVendors(); } catch { toast.error('Failed to block vendor'); } };
  const handleUnblock = async (id: string) => { try { await vendorApiService.unblockVendor(id); toast.success('Vendor unblocked'); fetchVendors(); } catch { toast.error('Failed to unblock vendor'); } };

  const handleSaveVendor = async () => {
    if (!formData.vendor_name.trim() || !formData.owner_name.trim() || !formData.phone.trim()) {
      toast.error('Please fill all required fields'); return;
    }
    try {
      const vendorData = {
        vendor_name: formData.vendor_name, owner_name: formData.owner_name,
        phone: formData.phone, email: formData.email,
        address: { full_address: formData.full_address, city: formData.city, state: formData.state, pincode: formData.pincode },
        origin_location: formData.origin_location, origin_story: formData.origin_story,
        specialty_items: formData.specialty_items.split(',').map(s=>s.trim()).filter(Boolean),
        category: formData.category, delivery_coverage: formData.delivery_coverage,
        capacity: { max_orders_per_day: parseInt(formData.max_orders_per_day)||10, preparation_time: formData.preparation_time, packaging_type: formData.packaging_type, shelf_life_awareness: true },
        logistics: { shipping_regions: formData.shipping_regions.split(',').map(s=>s.trim()).filter(Boolean), dispatch_sla: formData.dispatch_sla, courier_compatibility: formData.courier_compatibility.split(',').map(s=>s.trim()).filter(Boolean) },
      };
      const result = await vendorApiService.createVendor(vendorData) as any;
      setGeneratedCreds({ id: result.login?.login_id || result.vendor_name, pass: result.login?.password || 'generated' });
      toast.success('Vendor created successfully');
      fetchVendors();
    } catch { toast.error('Failed to create vendor'); }
  };

  const resetForm = () => { setFormData({ vendor_name:'', owner_name:'', phone:'', email:'', full_address:'', city:'', state:'', pincode:'', origin_location:'', origin_story:'', specialty_items:'', category:'Traditional', delivery_coverage:'regional', max_orders_per_day:'10', preparation_time:'24 hours', packaging_type:'Standard', shipping_regions:'', dispatch_sla:'2-4 days', courier_compatibility:'' }); setGeneratedCreds(null); };

  const statusBadge = (s: string) => {
    const c: Record<string,string> = { active:'bg-green-100 text-green-700', pending:'bg-amber-100 text-amber-700', blocked:'bg-red-100 text-red-700', suspended:'bg-orange-100 text-orange-700' };
    return <Badge className={c[s]||'bg-gray-100 text-gray-700'}>{s}</Badge>;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-xl md:text-2xl font-bold tracking-tight">Total Vendor List</h1><p className="text-sm text-muted-foreground">Manage all authentic food vendors</p></div>
        <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }} className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"><Plus className="h-4 w-4 mr-1" />Add Vendor</Button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search vendors..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} onKeyPress={e=>e.key==='Enter'&&fetchVendors()} className="pl-9" /></div><Button variant="outline" onClick={fetchVendors} size="icon"><Search className="h-4 w-4" /></Button></div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="flex-1"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="blocked">Blocked</SelectItem><SelectItem value="suspended">Suspended</SelectItem></SelectContent></Select>
          <Select value={regionFilter} onValueChange={setRegionFilter}><SelectTrigger className="flex-1"><SelectValue placeholder="Region" /></SelectTrigger><SelectContent><SelectItem value="all">All Regions</SelectItem>{INDIAN_REGIONS.map(r=><SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div> : filtered.length === 0 ? <div className="text-center py-12 text-muted-foreground"><Leaf className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>No vendors found</p></div> : filtered.map(v => (
          <div key={v._id} className="bg-card border rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between"><div><p className="font-semibold">{v.vendor_name}</p><p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{v.origin_location}</p></div>{statusBadge(v.status)}</div>
            <div className="flex flex-wrap gap-1">{(v.specialty_items||[]).slice(0,3).map(s=><Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}</div>
            <div className="flex items-center justify-between text-sm text-muted-foreground"><span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{v.performance?.rating||0}</span><span>{v.performance?.total_orders||0} orders</span><span>{((v.performance?.acceptance_rate||0)*100).toFixed(0)}% accept</span></div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={()=>navigate(`/admin/vendors/${v._id}`)}><Eye className="h-3.5 w-3.5 mr-1" />View</Button>
              {v.status==='pending'&&<Button size="sm" className="flex-1 text-xs bg-amber-500 hover:bg-amber-600 text-white" onClick={()=>handleApprove(v._id)}><Check className="h-3.5 w-3.5 mr-1" />Approve</Button>}
              {v.status==='active'&&<Button variant="outline" size="sm" className="flex-1 text-xs text-orange-600" onClick={()=>handleBlock(v._id)}><Ban className="h-3.5 w-3.5 mr-1" />Block</Button>}
              {v.status==='blocked'&&<Button variant="outline" size="sm" className="flex-1 text-xs" onClick={()=>handleUnblock(v._id)}><Check className="h-3.5 w-3.5 mr-1" />Unblock</Button>}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Vendor</TableHead><TableHead>Specialty</TableHead><TableHead>Origin</TableHead><TableHead>Coverage</TableHead><TableHead>Rating</TableHead><TableHead>Orders</TableHead><TableHead>Accept Rate</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={9} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow> : filtered.length===0 ? <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground"><Leaf className="h-10 w-10 mx-auto mb-2 opacity-30" />No vendors found</TableCell></TableRow> : filtered.map(v => (
              <TableRow key={v._id} className="hover:bg-muted/40 transition-colors cursor-pointer" onClick={()=>navigate(`/admin/vendors/${v._id}`)}>
                <TableCell><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white font-bold text-sm">{v.vendor_name.charAt(0)}</div><div><div className="font-medium">{v.vendor_name}</div><div className="text-xs text-muted-foreground">{v.owner_name}</div></div></div></TableCell>
                <TableCell><div className="flex flex-wrap gap-1">{(v.specialty_items||[]).slice(0,2).map(s=><Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}</div></TableCell>
                <TableCell className="text-sm"><span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{v.origin_location}</span></TableCell>
                <TableCell><Badge variant="secondary" className="text-xs">{v.delivery_coverage==='pan_india'?'Pan India':'Regional'}</Badge></TableCell>
                <TableCell><div className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /><span className="font-medium">{v.performance?.rating||0}</span></div></TableCell>
                <TableCell className="font-medium">{v.performance?.total_orders||0}</TableCell>
                <TableCell><span className="text-sm">{((v.performance?.acceptance_rate||0)*100).toFixed(0)}%</span></TableCell>
                <TableCell>{statusBadge(v.status)}</TableCell>
                <TableCell className="text-right" onClick={e=>e.stopPropagation()}>
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={()=>navigate(`/admin/vendors/${v._id}`)}><Eye className="h-4 w-4 mr-2" />View Details</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {v.status==='pending'&&<DropdownMenuItem onClick={()=>handleApprove(v._id)}><Check className="h-4 w-4 mr-2" />Approve</DropdownMenuItem>}
                      {v.status==='active'&&<DropdownMenuItem onClick={()=>handleBlock(v._id)} className="text-orange-600"><Ban className="h-4 w-4 mr-2" />Block</DropdownMenuItem>}
                      {v.status==='blocked'&&<DropdownMenuItem onClick={()=>handleUnblock(v._id)}><Check className="h-4 w-4 mr-2" />Unblock</DropdownMenuItem>}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Vendor Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={o=>{setIsAddDialogOpen(o);if(!o)resetForm();}}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add New Vendor</DialogTitle><DialogDescription>Enter details to onboard a new authentic food vendor</DialogDescription></DialogHeader>
          {generatedCreds ? (
            <div className="py-6 space-y-4">
              <div className="text-center"><Shield className="h-12 w-12 mx-auto text-green-500 mb-2" /><h3 className="text-lg font-bold text-green-700">Vendor Created Successfully!</h3><p className="text-sm text-muted-foreground mt-1">Share these credentials with the vendor</p></div>
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between"><div><Label className="text-xs text-muted-foreground">Login ID</Label><p className="font-mono font-bold">{generatedCreds.id}</p></div><Button variant="ghost" size="sm" onClick={()=>{navigator.clipboard.writeText(generatedCreds.id);toast.success('Copied!');}}><Copy className="h-4 w-4" /></Button></div>
                <div className="flex items-center justify-between"><div><Label className="text-xs text-muted-foreground">Password</Label><p className="font-mono font-bold">{generatedCreds.pass}</p></div><Button variant="ghost" size="sm" onClick={()=>{navigator.clipboard.writeText(generatedCreds.pass);toast.success('Copied!');}}><Copy className="h-4 w-4" /></Button></div>
              </div>
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white" onClick={()=>{setIsAddDialogOpen(false);resetForm();}}>Done</Button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Vendor Name *</Label><Input value={formData.vendor_name} onChange={e=>setFormData({...formData, vendor_name:e.target.value})} placeholder="e.g., Kakinada Sweets House" /></div>
                  <div className="space-y-2"><Label>Owner Name *</Label><Input value={formData.owner_name} onChange={e=>setFormData({...formData, owner_name:e.target.value})} placeholder="Owner's full name" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Phone *</Label><Input value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} placeholder="+91 XXXXX XXXXX" /></div>
                  <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} placeholder="vendor@email.com" /></div>
                </div>
                <div className="space-y-2"><Label>Full Address</Label><Textarea value={formData.full_address} onChange={e=>setFormData({...formData, full_address:e.target.value})} placeholder="Complete address" rows={2} /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>City</Label><Input value={formData.city} onChange={e=>setFormData({...formData, city:e.target.value})} /></div>
                  <div className="space-y-2"><Label>State</Label><Select value={formData.state} onValueChange={v=>setFormData({...formData, state:v})}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{INDIAN_REGIONS.map(r=><SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>Pincode</Label><Input value={formData.pincode} onChange={e=>setFormData({...formData, pincode:e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Origin Location</Label><Input value={formData.origin_location} onChange={e=>setFormData({...formData, origin_location:e.target.value})} placeholder="e.g., Kakinada, AP" /></div>
                  <div className="space-y-2"><Label>Category</Label><Select value={formData.category} onValueChange={v=>setFormData({...formData, category:v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Sweets','Snacks','Pickles','Dry Fruits','Spices','Bakery','Traditional','Regional Specialty','Other'].map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="space-y-2"><Label>Specialty Items (comma separated)</Label><Input value={formData.specialty_items} onChange={e=>setFormData({...formData, specialty_items:e.target.value})} placeholder="e.g., Kakinada Kaja, Pootharekulu, Putharekulu" /></div>
                <div className="space-y-2"><Label>Origin Story</Label><Textarea value={formData.origin_story} onChange={e=>setFormData({...formData, origin_story:e.target.value})} placeholder="Brief history and speciality of this vendor..." rows={2} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Delivery Coverage</Label><Select value={formData.delivery_coverage} onValueChange={(v: 'regional'|'pan_india')=>setFormData({...formData, delivery_coverage:v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="regional">Regional</SelectItem><SelectItem value="pan_india">Pan India</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Max Orders/Day</Label><Input type="number" value={formData.max_orders_per_day} onChange={e=>setFormData({...formData, max_orders_per_day:e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Preparation Time</Label><Input value={formData.preparation_time} onChange={e=>setFormData({...formData, preparation_time:e.target.value})} placeholder="e.g., 24 hours" /></div>
                  <div className="space-y-2"><Label>Dispatch SLA</Label><Input value={formData.dispatch_sla} onChange={e=>setFormData({...formData, dispatch_sla:e.target.value})} placeholder="e.g., 2-4 days" /></div>
                </div>
              </div>
              <DialogFooter><Button variant="outline" onClick={()=>setIsAddDialogOpen(false)}>Cancel</Button><Button onClick={handleSaveVendor} className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white">Create Vendor</Button></DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
