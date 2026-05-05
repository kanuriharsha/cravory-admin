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
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import apiService from '@/services/api';
import { 
  Search, 
  Plus,
  Edit,
  Trash2,
  Loader2,
  UtensilsCrossed
} from 'lucide-react';
import { toast } from 'sonner';

interface MenuItem {
  _id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  is_available: boolean;
  is_veg: boolean;
  preparation_time: string;
  created_at: string;
}

interface Restaurant {
  _id: string;
  name: string;
}

export default function MenuItems() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    restaurant_id: '',
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    is_available: true,
    is_veg: false,
    preparation_time: ''
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchMenuItems();
    fetchRestaurants();
    fetchCategories();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Only allow jpg, jpeg, png
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPG, JPEG, or PNG images are allowed');
        e.target.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData(prev => ({ ...prev, image: base64String }));
        setFormErrors(prev => ({ ...prev, image: '' }));
        toast.success('Image uploaded successfully!');
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMenuItems();
      setMenuItems(data as MenuItem[]);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to fetch menu items');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const data = await apiService.getRestaurants();
      setRestaurants(data as Restaurant[]);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setRestaurants([]);
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

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        restaurant_id: item.restaurant_id,
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        category: item.category,
        image: item.image,
        is_available: item.is_available,
        is_veg: item.is_veg,
        preparation_time: item.preparation_time
      });
      setImagePreview(item.image || '');
    } else {
      setEditingItem(null);
      setFormData({
        restaurant_id: '',
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        is_available: true,
        is_veg: false,
        preparation_time: ''
      });
      setImagePreview('');
    }
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Per-field validation
    const errors: Record<string, string> = {};
    if (!formData.restaurant_id) errors.restaurant_id = 'Please select a restaurant';
    if (!formData.name.trim()) errors.name = 'Item name is required';
    if (!formData.price) errors.price = 'Price is required';
    if (!formData.category) errors.category = 'Please select a category';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fill in all required fields');
      return;
    }
    setFormErrors({});

    try {
      const itemData = {
        ...formData,
        price: parseFloat(formData.price)
      };

      if (editingItem) {
        await apiService.updateMenuItem(editingItem._id, itemData);
        toast.success('Menu item updated successfully');
      } else {
        await apiService.createMenuItem(itemData);
        toast.success('Menu item created successfully');
      }
      
      fetchMenuItems();
      setIsDialogOpen(false);
      setEditingItem(null);
      setImagePreview('');
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error('Failed to save menu item');
    }
  };

  const handleDelete = async () => {
    if (!deleteItemId) return;

    try {
      await apiService.deleteMenuItem(deleteItemId);
      toast.success('Menu item deleted successfully');
      fetchMenuItems();
      setIsDeleteDialogOpen(false);
      setDeleteItemId(null);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      await apiService.updateMenuItem(item._id, {
        is_available: !item.is_available
      });
      toast.success(`Menu item ${!item.is_available ? 'enabled' : 'disabled'}`);
      fetchMenuItems();
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRestaurant = selectedRestaurant === 'all' || item.restaurant_id === selectedRestaurant;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesRestaurant && matchesCategory;
  });

  const getRestaurantName = (restaurantId: string) => {
    const restaurant = restaurants.find(r => r._id === restaurantId);
    return restaurant?.name || 'Unknown Restaurant';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Menu Items</h1>
          <p className="text-sm text-muted-foreground">Manage menu items across all restaurants</p>
        </div>
        <Button onClick={() => handleOpenDialog()} size="sm">
          <Plus className="h-4 w-4 mr-1 md:mr-2" />
          <span className="hidden sm:inline">Add Menu Item</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
            <SelectTrigger>
              <SelectValue placeholder="All Restaurants" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Restaurants</SelectItem>
              {restaurants.map((restaurant) => (
                <SelectItem key={restaurant._id} value={restaurant._id}>{restaurant.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category.name}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <UtensilsCrossed className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No menu items found</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item._id} className="bg-card border rounded-xl p-3 flex gap-3 shadow-sm">
              {item.image && (
                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <p className="font-semibold text-sm truncate">{item.name}</p>
                  <p className="font-bold text-sm shrink-0">&#8377;{item.price}</p>
                </div>
                <p className="text-xs text-muted-foreground truncate">{getRestaurantName(item.restaurant_id)}</p>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <Badge variant="outline" className="text-xs py-0">{item.category}</Badge>
                  <Badge variant={item.is_veg ? 'default' : 'destructive'} className="text-xs py-0">
                    {item.is_veg ? 'Veg' : 'Non-Veg'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Switch checked={item.is_available} onCheckedChange={() => toggleAvailability(item)} />
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenDialog(item)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                      onClick={() => { setDeleteItemId(item._id); setIsDeleteDialogOpen(true); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden lg:table-cell">Prep Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    <UtensilsCrossed className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    No menu items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item._id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-11 h-11 rounded object-cover" />
                        )}
                        <div>
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{item.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{getRestaurantName(item.restaurant_id)}</TableCell>
                    <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                    <TableCell className="font-medium">&#8377;{item.price}</TableCell>
                    <TableCell>
                      <Badge variant={item.is_veg ? 'default' : 'destructive'}>
                        {item.is_veg ? 'Veg' : 'Non-Veg'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">{item.preparation_time}</TableCell>
                    <TableCell>
                      <Switch checked={item.is_available} onCheckedChange={() => toggleAvailability(item)} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                          onClick={() => { setDeleteItemId(item._id); setIsDeleteDialogOpen(true); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update menu item details' : 'Add a new menu item to the restaurant'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="restaurant">Restaurant *</Label>
                <Select
                  value={formData.restaurant_id}
                  onValueChange={(value) => { setFormData({ ...formData, restaurant_id: value }); setFormErrors(prev => ({ ...prev, restaurant_id: '' })); }}
                  required
                >
                  <SelectTrigger className={formErrors.restaurant_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select restaurant" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map((restaurant) => (
                      <SelectItem key={restaurant._id} value={restaurant._id}>
                        {restaurant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.restaurant_id && <p className="text-xs text-red-500">* {formErrors.restaurant_id}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setFormErrors(prev => ({ ...prev, name: '' })); }}
                  placeholder="e.g., Chicken Biryani"
                  required
                  className={formErrors.name ? 'border-red-500' : ''}
                />
                {formErrors.name && <p className="text-xs text-red-500">* {formErrors.name}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the menu item..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => { setFormData({ ...formData, price: e.target.value }); setFormErrors(prev => ({ ...prev, price: '' })); }}
                    placeholder="0.00"
                    required
                    className={formErrors.price ? 'border-red-500' : ''}
                  />
                  {formErrors.price && <p className="text-xs text-red-500">* {formErrors.price}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="preparation_time">Preparation Time</Label>
                  <Input
                    id="preparation_time"
                    value={formData.preparation_time}
                    onChange={(e) => setFormData({ ...formData, preparation_time: e.target.value })}
                    placeholder="e.g., 20-30 mins"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => { setFormData({ ...formData, category: value }); setFormErrors(prev => ({ ...prev, category: '' })); }}
                  required
                >
                  <SelectTrigger className={formErrors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.category && <p className="text-xs text-red-500">* {formErrors.category}</p>}
              </div>

              <div className="grid gap-2">
                <Label>Image</Label>
                {imagePreview && (
                  <div className="relative w-full h-36 rounded-lg overflow-hidden border border-border">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => { setImagePreview(''); setFormData(prev => ({ ...prev, image: '' })); }}
                    >
                      Remove
                    </Button>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="imageFile" className="cursor-pointer text-sm">Upload File</Label>
                    <Input
                      id="imageFile"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleImageUpload}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">JPG, JPEG or PNG. Max 5MB</p>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="image" className="text-sm">Or paste URL</Label>
                    <Input
                      id="image"
                      value={formData.image.startsWith('data:') ? '' : formData.image}
                      onChange={(e) => { setFormData({ ...formData, image: e.target.value }); setImagePreview(e.target.value); }}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_veg"
                    checked={formData.is_veg}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_veg: checked })}
                  />
                  <Label htmlFor="is_veg">Vegetarian</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_available"
                    checked={formData.is_available}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                  />
                  <Label htmlFor="is_available">Available</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingItem ? 'Update' : 'Create'} Menu Item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this menu item. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
