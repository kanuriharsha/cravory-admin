import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
import { Switch } from '@/components/ui/switch';
import apiService from '@/services/api';
import { MenuItem } from '@/types/admin';
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  MapPin, 
  Plus,
  Edit,
  Ban,
  Trash2,
  Search,
  Check,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  
  const [menuForm, setMenuForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    image: '',
    is_available: true,
    is_veg: true,
    preparation_time: '20-30 mins'
  });
  const [menuImagePreview, setMenuImagePreview] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchRestaurantDetails();
      fetchMenuItems();
      fetchCategories();
    }
  }, [id]);

  const handleMenuImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      // Convert to base64 for preview and storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setMenuImagePreview(base64String);
        setMenuForm({ ...menuForm, image: base64String });
        toast.success('Image uploaded successfully!');
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true);
      const data = await apiService.getRestaurant(id!);
      console.log('Restaurant data:', data);
      if (!data) {
        throw new Error('Restaurant not found');
      }
      setRestaurant(data);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      toast.error('Failed to fetch restaurant details');
      navigate('/admin/restaurants');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const data = await apiService.getMenuItems();
      const items = (data as MenuItem[]).filter(item => item.restaurant_id === id);
      setMenuItems(items);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setMenuItems([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(data as any[]);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground">Restaurant not found</p>
        <Button variant="link" onClick={() => navigate('/admin/restaurants')}>
          Back to Restaurants
        </Button>
      </div>
    );
  }

  const menuCategories = [...new Set(menuItems.map(item => item.category))];

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'available' ? item.is_available : !item.is_available);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const resetMenuForm = () => {
    setMenuForm({
      name: '',
      description: '',
      category: '',
      price: '',
      image: '',
      is_available: true,
      is_veg: true,
      preparation_time: '20-30 mins'
    });
    setMenuImagePreview('');
  };

  const handleSaveMenuItem = async () => {
    if (!menuForm.name || !menuForm.category || !menuForm.price) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const itemData = {
        restaurant_id: id!,
        name: menuForm.name,
        description: menuForm.description,
        category: menuForm.category,
        price: parseFloat(menuForm.price),
        image: menuForm.image,
        is_available: menuForm.is_available,
        is_veg: menuForm.is_veg,
        preparation_time: menuForm.preparation_time
      };

      if (editingItem) {
        await apiService.updateMenuItem(editingItem._id, itemData);
        toast.success('Menu item updated successfully');
      } else {
        await apiService.createMenuItem(itemData);
        toast.success('Menu item added successfully');
      }

      fetchMenuItems();
      setIsMenuDialogOpen(false);
      setEditingItem(null);
      resetMenuForm();
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error('Failed to save menu item');
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await apiService.updateMenuItem(item._id, {
        is_available: !item.is_available
      });
      toast.success(`Item ${!item.is_available ? 'enabled' : 'disabled'}`);
      fetchMenuItems();
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error('Failed to update item');
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setMenuForm({
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price.toString(),
      image: item.image,
      is_available: item.is_available,
      is_veg: item.is_veg,
      preparation_time: item.preparation_time
    });
    setMenuImagePreview(item.image || '');
    setIsMenuDialogOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!deleteItemId) return;

    try {
      await apiService.deleteMenuItem(deleteItemId);
      toast.success('Menu item deleted');
      fetchMenuItems();
      setDeleteItemId(null);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/restaurants')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-lg md:text-2xl font-bold tracking-tight truncate">{restaurant.name}</h1>
          <p className="text-sm text-muted-foreground">Restaurant details and menu management</p>
        </div>
      </div>

      {/* Restaurant Info Card */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full sm:w-40 md:w-48 h-48 sm:h-40 md:h-48 rounded-xl object-cover shrink-0"
            />
            <div className="flex-1 space-y-3 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="text-lg md:text-xl font-semibold truncate">{restaurant.name}</h2>
                  <p className="text-muted-foreground text-sm">{restaurant.cuisine}</p>
                </div>
                <Badge variant={restaurant.status === 'approved' ? 'default' : 'secondary'} className="shrink-0">
                  {restaurant.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-1.5 bg-muted/50 rounded-lg p-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <p className="text-sm font-medium">{restaurant.rating}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-muted/50 rounded-lg p-2">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Delivery</p>
                    <p className="text-sm font-medium">{restaurant.delivery_time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-muted/50 rounded-lg p-2">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">City</p>
                    <p className="text-sm font-medium truncate">{restaurant.location?.city || 'Hyderabad'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-muted/50 rounded-lg p-2">
                  <Badge variant={restaurant.is_open ? 'default' : 'secondary'} className="text-xs">
                    {restaurant.is_open ? 'Open Now' : 'Closed'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <p className="text-sm text-muted-foreground flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span className="break-words">{restaurant.location?.address}, {restaurant.location?.city}</span>
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  Operating Hours: {restaurant.operating_hours?.open} - {restaurant.operating_hours?.close}
                </p>
                {(restaurant.location as any)?.mapsLink && (
                  <a
                    href={(restaurant.location as any).mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary flex items-center gap-1.5 hover:underline truncate"
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    View on Google Maps
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
          <div>
            <CardTitle className="text-base md:text-lg">Menu Items</CardTitle>
            <CardDescription className="text-xs md:text-sm">Manage menu items for this restaurant</CardDescription>
          </div>
          <Button
            onClick={() => { resetMenuForm(); setEditingItem(null); setIsMenuDialogOpen(true); }}
            size="sm"
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            <Plus className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Add Item</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          {/* Filters */}
          <div className="flex flex-col gap-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {menuCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Menu Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="hidden sm:table-cell">Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Prep Time</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMenuItems.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="p-2">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1 hidden sm:block">{item.description}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">{item.category}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{item.category}</TableCell>
                      <TableCell>
                        <Badge variant={item.is_veg ? 'default' : 'destructive'} className="text-xs">
                          {item.is_veg ? 'Veg' : 'Non-Veg'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">&#8377;{item.price}</p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={item.is_available ? 'default' : 'secondary'} className="text-xs">
                          {item.is_available ? 'Available' : 'Unavailable'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">
                        {item.preparation_time}
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditItem(item)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggleAvailability(item)}
                          >
                            {item.is_available
                              ? <Ban className="h-3.5 w-3.5 text-orange-600" />
                              : <Check className="h-3.5 w-3.5 text-green-600" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => setDeleteItemId(item._id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filteredMenuItems.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                No menu items found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Menu Item Dialog */}
      <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update menu item details' : 'Add a new item to the menu'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="itemName">Item Name *</Label>
              <Input
                id="itemName"
                value={menuForm.name}
                onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                placeholder="Enter item name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="itemDesc">Description</Label>
              <Textarea
                id="itemDesc"
                value={menuForm.description}
                onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                placeholder="Brief description of the item"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={menuForm.category}
                  onValueChange={(value) => setMenuForm({ ...menuForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: any) => (
                      <SelectItem key={category._id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Food Type</Label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={menuForm.is_veg}
                      onCheckedChange={(checked) => setMenuForm({ ...menuForm, is_veg: checked })}
                    />
                    <Label>{menuForm.is_veg ? 'Vegetarian' : 'Non-Vegetarian'}</Label>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={menuForm.price}
                  onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                  placeholder="299"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prepTime">Preparation Time</Label>
                <Input
                  id="prepTime"
                  value={menuForm.preparation_time}
                  onChange={(e) => setMenuForm({ ...menuForm, preparation_time: e.target.value })}
                  placeholder="20-30 mins"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center gap-3">
                <Switch
                  checked={menuForm.is_available}
                  onCheckedChange={(checked) => setMenuForm({ ...menuForm, is_available: checked })}
                />
                <Label>Available for orders</Label>
              </div>
            </div>
            <div className="space-y-3">
              <Label>Menu Item Image</Label>
              
              {menuImagePreview && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                  <img 
                    src={menuImagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setMenuImagePreview('');
                      setMenuForm({ ...menuForm, image: '' });
                    }}
                  >
                    Remove
                  </Button>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="menuImageFile" className="cursor-pointer">
                    Upload from Computer
                  </Label>
                  <Input
                    id="menuImageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleMenuImageUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">Max size: 5MB</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="menuImageUrl">Or paste image URL</Label>
                  <Input
                    id="menuImageUrl"
                    value={menuForm.image.startsWith('data:') ? '' : menuForm.image}
                    onChange={(e) => {
                      setMenuForm({ ...menuForm, image: e.target.value });
                      setMenuImagePreview(e.target.value);
                    }}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMenuDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMenuItem}>
              {editingItem ? 'Update' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this menu item. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
