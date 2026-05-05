import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Loader2, Package, Edit, Trash2, MoreHorizontal, Eye, Power, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import vendorApiService from '@/services/vendorApi';
import type { VendorProduct, Vendor } from '@/types/vendor';
import { VENDOR_PRODUCT_CATEGORIES } from '@/types/vendor';

export default function VendorProducts() {
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<VendorProduct | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [assignDialog, setAssignDialog] = useState<{ productId: string; current: string[] } | null>(null);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '', description: '', category: 'Sweets', region_tags: '', ingredients: '',
    shelf_life: '', packaging_type: 'Standard', storage_instructions: '',
    dispatch_time: '24 hours', delivery_feasibility: '2-4 days', price: '', discounted_price: '', image: '',
  });

  useEffect(() => { fetchProducts(); fetchVendors(); }, [categoryFilter, statusFilter]);

  const fetchProducts = async () => {
    try { setLoading(true); const params: any = {}; if (categoryFilter !== 'all') params.category = categoryFilter; if (statusFilter !== 'all') params.status = statusFilter; if (searchQuery) params.search = searchQuery; const data = await vendorApiService.getProducts(params); setProducts(data as VendorProduct[]); } catch { toast.error('Failed to load products'); } finally { setLoading(false); }
  };
  const fetchVendors = async () => { try { const data = await vendorApiService.getVendors({ status: 'active' }); setVendors(data as Vendor[]); } catch { console.error('Failed to fetch vendors'); } };

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.shelf_life.trim() || !formData.price) { toast.error('Name, shelf life, and price are required'); return; }
    try {
      const data = { ...formData, region_tags: formData.region_tags.split(',').map(s => s.trim()).filter(Boolean), ingredients: formData.ingredients.split(',').map(s => s.trim()).filter(Boolean), price: parseFloat(formData.price), discounted_price: formData.discounted_price ? parseFloat(formData.discounted_price) : undefined };
      if (editingProduct) { await vendorApiService.updateProduct(editingProduct._id, data); toast.success('Product updated'); }
      else { await vendorApiService.createProduct(data); toast.success('Product created'); }
      setIsFormOpen(false); resetForm(); fetchProducts();
    } catch { toast.error('Failed to save product'); }
  };

  const handleDelete = async () => { if (!deleteId) return; try { await vendorApiService.deleteProduct(deleteId); toast.success('Product deleted'); fetchProducts(); setDeleteId(null); } catch { toast.error('Failed to delete'); } };
  const handleToggle = async (id: string, current: string) => { try { await vendorApiService.toggleProduct(id, current === 'active' ? 'disabled' : 'active'); toast.success(`Product ${current === 'active' ? 'disabled' : 'enabled'}`); fetchProducts(); } catch { toast.error('Failed'); } };
  const handleAssignVendors = async () => { if (!assignDialog) return; try { await vendorApiService.assignVendorsToProduct(assignDialog.productId, selectedVendors); toast.success('Vendors assigned'); setAssignDialog(null); fetchProducts(); } catch { toast.error('Failed to assign vendors'); } };

  const handleEdit = (p: VendorProduct) => { setEditingProduct(p); setFormData({ name: p.name, description: p.description, category: p.category, region_tags: (p.region_tags || []).join(', '), ingredients: (p.ingredients || []).join(', '), shelf_life: p.shelf_life, packaging_type: p.packaging_type, storage_instructions: p.storage_instructions, dispatch_time: p.dispatch_time, delivery_feasibility: p.delivery_feasibility, price: p.price.toString(), discounted_price: p.discounted_price?.toString() || '', image: p.image || '' }); setIsFormOpen(true); };
  const resetForm = () => { setFormData({ name: '', description: '', category: 'Sweets', region_tags: '', ingredients: '', shelf_life: '', packaging_type: 'Standard', storage_instructions: '', dispatch_time: '24 hours', delivery_feasibility: '2-4 days', price: '', discounted_price: '', image: '' }); setEditingProduct(null); };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-xl md:text-2xl font-bold">Vendor Products</h1><p className="text-sm text-muted-foreground">Admin-only product management — Vendors cannot modify</p></div>
        <Button onClick={() => { resetForm(); setIsFormOpen(true); }} className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"><Plus className="h-4 w-4 mr-1" />Create Product</Button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyPress={e => e.key === 'Enter' && fetchProducts()} className="pl-9" /></div></div>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger className="flex-1"><SelectValue placeholder="Category" /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem>{VENDOR_PRODUCT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="flex-1"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="disabled">Disabled</SelectItem></SelectContent></Select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead>Shelf Life</TableHead><TableHead>Price</TableHead><TableHead>Vendors</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow> : filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground"><Package className="h-10 w-10 mx-auto mb-2 opacity-30" />No products found</TableCell></TableRow> : filtered.map(p => (
              <TableRow key={p._id} className="hover:bg-muted/40">
                <TableCell><div><div className="font-medium">{p.name}</div><div className="text-xs text-muted-foreground">{p.description?.substring(0, 50)}</div></div></TableCell>
                <TableCell><Badge variant="outline">{p.category}</Badge></TableCell>
                <TableCell className="text-sm">{p.shelf_life}</TableCell>
                <TableCell><div className="font-medium">₹{p.price}{p.discounted_price && <span className="text-xs text-muted-foreground line-through ml-1">₹{p.discounted_price}</span>}</div></TableCell>
                <TableCell><Badge variant="secondary">{(p.assigned_vendors || []).length} vendors</Badge></TableCell>
                <TableCell><Badge className={p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{p.status}</Badge></TableCell>
                <TableCell className="text-right">
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(p)}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setAssignDialog({ productId: p._id, current: p.assigned_vendors || [] }); setSelectedVendors(p.assigned_vendors || []); }}><Users className="h-4 w-4 mr-2" />Assign Vendors</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggle(p._id, p.status)}><Power className="h-4 w-4 mr-2" />{p.status === 'active' ? 'Disable' : 'Enable'}</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(p._id)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Product Dialog */}
      <Dialog open={isFormOpen} onOpenChange={o => { setIsFormOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingProduct ? 'Edit Product' : 'Create New Product'}</DialogTitle><DialogDescription>Admin-controlled product management. Vendors cannot modify products.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Product Name *</Label><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Kakinada Kaja" /></div>
              <div className="space-y-2"><Label>Category *</Label><Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{VENDOR_PRODUCT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Shelf Life * (mandatory)</Label><Input value={formData.shelf_life} onChange={e => setFormData({ ...formData, shelf_life: e.target.value })} placeholder="e.g., 7 days" /></div>
              <div className="space-y-2"><Label>Packaging Type</Label><Input value={formData.packaging_type} onChange={e => setFormData({ ...formData, packaging_type: e.target.value })} placeholder="e.g., Vacuum sealed" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Price (₹) *</Label><Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} /></div>
              <div className="space-y-2"><Label>Discounted Price (₹)</Label><Input type="number" value={formData.discounted_price} onChange={e => setFormData({ ...formData, discounted_price: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Region Tags (comma separated)</Label><Input value={formData.region_tags} onChange={e => setFormData({ ...formData, region_tags: e.target.value })} placeholder="e.g., Andhra Pradesh, Telangana" /></div>
            <div className="space-y-2"><Label>Ingredients (comma separated)</Label><Input value={formData.ingredients} onChange={e => setFormData({ ...formData, ingredients: e.target.value })} placeholder="e.g., Maida, Sugar, Ghee" /></div>
            <div className="space-y-2"><Label>Storage Instructions</Label><Input value={formData.storage_instructions} onChange={e => setFormData({ ...formData, storage_instructions: e.target.value })} placeholder="e.g., Store in cool dry place" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Dispatch Time</Label><Input value={formData.dispatch_time} onChange={e => setFormData({ ...formData, dispatch_time: e.target.value })} /></div>
              <div className="space-y-2"><Label>Delivery Feasibility</Label><Input value={formData.delivery_feasibility} onChange={e => setFormData({ ...formData, delivery_feasibility: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button><Button onClick={handleSave} className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white">{editingProduct ? 'Update' : 'Create'} Product</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Vendors Dialog */}
      <Dialog open={!!assignDialog} onOpenChange={() => setAssignDialog(null)}>
        <DialogContent><DialogHeader><DialogTitle>Assign Vendors to Product</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-60 overflow-y-auto">{vendors.map(v => (<label key={v._id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"><input type="checkbox" checked={selectedVendors.includes(v._id)} onChange={e => { if (e.target.checked) setSelectedVendors([...selectedVendors, v._id]); else setSelectedVendors(selectedVendors.filter(id => id !== v._id)); }} className="rounded" /><span className="text-sm font-medium">{v.vendor_name}</span><span className="text-xs text-muted-foreground">{v.origin_location}</span></label>))}</div>
          <DialogFooter><Button variant="outline" onClick={() => setAssignDialog(null)}>Cancel</Button><Button onClick={handleAssignVendors} className="bg-amber-500 hover:bg-amber-600 text-white">Save Assignment</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Product?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}
