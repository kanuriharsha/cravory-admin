import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Restaurant } from '@/types/admin';
import apiService from '@/services/api';
import { 
  Search, 
  Plus, 
  Star, 
  Clock, 
  MapPin, 
  MoreHorizontal,
  Check,
  X,
  Ban,
  Edit,
  Eye,
  Loader2,
  Trash2,
  ChefHat
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { extractCoordinatesFromMapsLink } from '@/lib/locationUtils';

export default function Restaurants() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [deleteRestaurantId, setDeleteRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: 'Hyderabad',
    cuisine: '',
    zone: '',
    openTime: '10:00',
    closeTime: '22:00',
    image: '',
    mapsLink: '',
    latitude: '',
    longitude: '',
    username: '',
    password: ''
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchRestaurants();
    fetchZones();
  }, [statusFilter, zoneFilter]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type — allow jpg, jpeg, png
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPG, JPEG, or PNG images are allowed');
        e.target.value = '';
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        e.target.value = '';
        return;
      }
      
      // Convert to base64 for preview and storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        // Use functional update to avoid stale closure
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

  const handleMapsLinkChange = async (link: string) => {
    setFormData({ ...formData, mapsLink: link });
    
    if (link.trim()) {
      toast.info('Extracting coordinates...');
      const coords = await extractCoordinatesFromMapsLink(link);
      if (coords) {
        setFormData(prev => ({
          ...prev,
          mapsLink: link,
          latitude: coords.lat.toString(),
          longitude: coords.lng.toString()
        }));
        toast.success('Coordinates extracted successfully!');
      } else {
        toast.error('Could not extract coordinates from the link. Please open the link in your browser, copy the full URL from the address bar, and paste it here. Or enter coordinates manually.');
      }
    }
  };

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (zoneFilter !== 'all') params.zone = zoneFilter;
      if (searchQuery) params.search = searchQuery;
      
      const data = await apiService.getRestaurants(params);
      setRestaurants(data as Restaurant[]);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to load restaurants');
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

  const handleSearch = () => {
    fetchRestaurants();
  };

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleApprove = async (id: string) => {
    try {
      await apiService.approveRestaurant(id);
      toast.success('Restaurant approved successfully');
      fetchRestaurants();
    } catch (error) {
      console.error('Error approving restaurant:', error);
      toast.error('Failed to approve restaurant');
    }
  };

  const handleBlock = async (id: string) => {
    try {
      await apiService.blockRestaurant(id);
      toast.success('Restaurant blocked');
      fetchRestaurants();
    } catch (error) {
      console.error('Error blocking restaurant:', error);
      toast.error('Failed to block restaurant');
    }
  };

  const handleUnblock = async (id: string) => {
    try {
      await apiService.unblockRestaurant(id);
      toast.success('Restaurant unblocked');
      fetchRestaurants();
    } catch (error) {
      console.error('Error unblocking restaurant:', error);
      toast.error('Failed to unblock restaurant');
    }
  };

  const handleToggleStatus = async (id: string, isOpen: boolean) => {
    try {
      await apiService.toggleRestaurantStatus(id, !isOpen);
      toast.success(`Restaurant ${!isOpen ? 'opened' : 'closed'}`);
      fetchRestaurants();
    } catch (error) {
      console.error('Error toggling restaurant status:', error);
      toast.error('Failed to update restaurant status');
    }
  };

  const handleSaveRestaurant = async () => {
    // Build per-field errors
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Restaurant name is required';
    if (!formData.cuisine.trim()) errors.cuisine = 'Cuisine type is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!editingRestaurant && !formData.username.trim()) errors.username = 'Username is required';
    if (!editingRestaurant && !formData.password.trim()) errors.password = 'Password is required';
    if (!formData.latitude.trim()) errors.latitude = 'Latitude is required';
    if (!formData.longitude.trim()) errors.longitude = 'Longitude is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fill all required fields');
      return;
    }
    setFormErrors({});

    try {
      const restaurantData: any = {
        name: formData.name,
        cuisine: formData.cuisine,
        location: { 
          address: formData.address, 
          city: formData.city,
          coordinates: {
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude)
          }
        },
        zone: formData.zone,
        operating_hours: { 
          open: formData.openTime, 
          close: formData.closeTime 
        },
        image: formData.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
        rating: 0,
        delivery_time: '30-40 mins',
        is_open: false,
        distance: 'N/A',
        status: 'pending'
      };

      if (!editingRestaurant) {
        restaurantData.username = formData.username;
        restaurantData.password = formData.password;
      } else if (formData.username || formData.password) {
        if (formData.username) restaurantData.username = formData.username;
        if (formData.password) restaurantData.password = formData.password;
      }

      if (editingRestaurant) {
        await apiService.updateRestaurant(editingRestaurant._id, restaurantData);
        toast.success('Restaurant updated successfully');
      } else {
        await apiService.createRestaurant(restaurantData);
        toast.success('Restaurant created successfully');
      }

      setIsAddDialogOpen(false);
      setEditingRestaurant(null);
      resetForm();
      fetchRestaurants();
    } catch (error) {
      console.error('Error saving restaurant:', error);
      toast.error('Failed to save restaurant');
    }
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      address: restaurant.location?.address || '',
      city: restaurant.location?.city || 'Hyderabad',
      cuisine: restaurant.cuisine,
      zone: restaurant.zone || '',
      openTime: restaurant.operating_hours?.open || '10:00',
      closeTime: restaurant.operating_hours?.close || '22:00',
      image: restaurant.image,
      mapsLink: '',
      latitude: (restaurant.location as any)?.coordinates?.latitude?.toString() || '',
      longitude: (restaurant.location as any)?.coordinates?.longitude?.toString() || '',
      username: (restaurant as any).username || '',
      password: ''
    });
    setImagePreview(restaurant.image);
    setIsAddDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: 'Hyderabad',
      cuisine: '',
      zone: '',
      openTime: '10:00',
      closeTime: '22:00',
      image: '',
      mapsLink: '',
      latitude: '',
      longitude: '',
      username: '',
      password: ''
    });
    setImagePreview('');
    setFormErrors({});
  };

  const handleDeleteRestaurant = async () => {
    if (!deleteRestaurantId) return;
    try {
      await apiService.deleteRestaurant(deleteRestaurantId);
      toast.success('Restaurant deleted successfully');
      fetchRestaurants();
      setDeleteRestaurantId(null);
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast.error('Failed to delete restaurant');
    }
  };

  const handleOpenDialog = () => {
    resetForm();
    setEditingRestaurant(null);
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Restaurants</h1>
          <p className="text-sm text-muted-foreground">Manage all restaurants on your platform</p>
        </div>
        <Button onClick={handleOpenDialog} size="sm" className="md:size-default">
          <Plus className="h-4 w-4 mr-1 md:mr-2" />
          <span className="hidden sm:inline">Add Restaurant</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={handleSearch} size="icon" className="shrink-0">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
          <Select value={zoneFilter} onValueChange={setZoneFilter}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Zones</SelectItem>
              {zones.map(zone => (
                <SelectItem key={zone._id} value={zone._id}>{zone.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ChefHat className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No restaurants found</p>
          </div>
        ) : (
          filteredRestaurants.map((restaurant) => (
            <div key={restaurant._id} className="bg-card border rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center gap-3">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-14 h-14 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold truncate">{restaurant.name}</p>
                    <StatusBadge status={restaurant.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span>{restaurant.rating}</span>
                  <span className="mx-1">·</span>
                  <span>{restaurant.zone || 'No zone'}</span>
                </div>
                <button
                  onClick={() => handleToggleStatus(restaurant._id, restaurant.is_open)}
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    restaurant.is_open
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {restaurant.is_open ? 'Open' : 'Closed'}
                </button>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => navigate(`/admin/restaurants/${restaurant._id}`)}
                >
                  <Eye className="h-3.5 w-3.5 mr-1" /> View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => handleEdit(restaurant)}
                >
                  <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                {restaurant.status === 'pending' && (
                  <Button size="sm" className="flex-1 text-xs" onClick={() => handleApprove(restaurant._id)}>
                    <Check className="h-3.5 w-3.5 mr-1" /> Approve
                  </Button>
                )}
                {restaurant.status === 'approved' && (
                  <Button variant="outline" size="sm" className="flex-1 text-xs text-orange-600" onClick={() => handleBlock(restaurant._id)}>
                    <Ban className="h-3.5 w-3.5 mr-1" /> Block
                  </Button>
                )}
                {restaurant.status === 'blocked' && (
                  <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => handleUnblock(restaurant._id)}>
                    <Check className="h-3.5 w-3.5 mr-1" /> Unblock
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => setDeleteRestaurantId(restaurant._id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurant</TableHead>
                <TableHead>Cuisine</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Open</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredRestaurants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <ChefHat className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    No restaurants found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRestaurants.map((restaurant) => (
                  <TableRow key={restaurant._id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="w-11 h-11 rounded-lg object-cover shrink-0"
                        />
                        <div>
                          <div className="font-medium">{restaurant.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {restaurant.distance}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{restaurant.cuisine}</TableCell>
                    <TableCell>
                      <span className="text-sm">{restaurant.zone || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{restaurant.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={restaurant.status} />
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleToggleStatus(restaurant._id, restaurant.is_open)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                          restaurant.is_open
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {restaurant.is_open ? 'Open' : 'Closed'}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/admin/restaurants/${restaurant._id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(restaurant)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {restaurant.status === 'pending' && (
                            <DropdownMenuItem onClick={() => handleApprove(restaurant._id)}>
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                          )}
                          {restaurant.status === 'approved' && (
                            <DropdownMenuItem
                              onClick={() => handleBlock(restaurant._id)}
                              className="text-orange-600"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Block
                            </DropdownMenuItem>
                          )}
                          {restaurant.status === 'blocked' && (
                            <DropdownMenuItem onClick={() => handleUnblock(restaurant._id)}>
                              <Check className="h-4 w-4 mr-2" />
                              Unblock
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteRestaurantId(restaurant._id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Restaurant
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

      {/* Add/Edit Restaurant Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
            </DialogTitle>
            <DialogDescription>
              {editingRestaurant 
                ? 'Update restaurant information' 
                : 'Enter details to add a new restaurant to the platform'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setFormErrors(prev => ({ ...prev, name: '' })); }}
                  placeholder="Enter restaurant name"
                  className={formErrors.name ? 'border-red-500' : ''}
                />
                {formErrors.name && <p className="text-xs text-red-500">* {formErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cuisine">Cuisine *</Label>
                <Input
                  id="cuisine"
                  value={formData.cuisine}
                  onChange={(e) => { setFormData({ ...formData, cuisine: e.target.value }); setFormErrors(prev => ({ ...prev, cuisine: '' })); }}
                  placeholder="e.g., North Indian, Chinese"
                  className={formErrors.cuisine ? 'border-red-500' : ''}
                />
                {formErrors.cuisine && <p className="text-xs text-red-500">* {formErrors.cuisine}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username {!editingRestaurant && '*'}</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => { setFormData({ ...formData, username: e.target.value }); setFormErrors(prev => ({ ...prev, username: '' })); }}
                  placeholder="Restaurant login username"
                  autoComplete="off"
                  className={formErrors.username ? 'border-red-500' : ''}
                />
                {formErrors.username && <p className="text-xs text-red-500">* {formErrors.username}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password {!editingRestaurant ? '*' : '(leave blank to keep current)'}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setFormErrors(prev => ({ ...prev, password: '' })); }}
                  placeholder={editingRestaurant ? 'Leave blank to keep current' : 'Restaurant login password'}
                  autoComplete="new-password"
                  className={formErrors.password ? 'border-red-500' : ''}
                />
                {formErrors.password && <p className="text-xs text-red-500">* {formErrors.password}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => { setFormData({ ...formData, address: e.target.value }); setFormErrors(prev => ({ ...prev, address: '' })); }}
                placeholder="Enter complete address"
                rows={2}
                className={formErrors.address ? 'border-red-500' : ''}
              />
              {formErrors.address && <p className="text-xs text-red-500">* {formErrors.address}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zone">Zone</Label>
                <Select value={formData.zone} onValueChange={(value) => setFormData({ ...formData, zone: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map(zone => (
                      <SelectItem key={zone._id} value={zone._id}>{zone.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openTime">Opening Time</Label>
                <Input
                  id="openTime"
                  type="time"
                  value={formData.openTime}
                  onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closeTime">Closing Time</Label>
                <Input
                  id="closeTime"
                  type="time"
                  value={formData.closeTime}
                  onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Restaurant Image</Label>
              
              {imagePreview && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImagePreview('');
                      setFormData({ ...formData, image: '' });
                    }}
                  >
                    Remove
                  </Button>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="imageFile" className="cursor-pointer">
                    Upload from Computer
                  </Label>
                  <Input
                    id="imageFile"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">JPG, JPEG or PNG. Max 5MB</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Or paste image URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.image.startsWith('data:') ? '' : formData.image}
                    onChange={(e) => {
                      setFormData({ ...formData, image: e.target.value });
                      setImagePreview(e.target.value);
                    }}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mapsLink" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Google Maps Link *
              </Label>
              <Input
                id="mapsLink"
                value={formData.mapsLink}
                onChange={(e) => handleMapsLinkChange(e.target.value)}
                placeholder="Paste Google Maps link (including short links)"
              />
              <p className="text-xs text-muted-foreground">
                Paste a Google Maps link and coordinates will be extracted automatically
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => { setFormData({ ...formData, latitude: e.target.value }); setFormErrors(prev => ({ ...prev, latitude: '' })); }}
                  placeholder="e.g., 17.385044"
                  className={formErrors.latitude ? 'border-red-500' : ''}
                />
                {formErrors.latitude && <p className="text-xs text-red-500">* {formErrors.latitude}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => { setFormData({ ...formData, longitude: e.target.value }); setFormErrors(prev => ({ ...prev, longitude: '' })); }}
                  placeholder="e.g., 78.486671"
                  className={formErrors.longitude ? 'border-red-500' : ''}
                />
                {formErrors.longitude && <p className="text-xs text-red-500">* {formErrors.longitude}</p>}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Coordinates will be used to calculate distance from user location
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRestaurant}>
              {editingRestaurant ? 'Update' : 'Create'} Restaurant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Restaurant Confirmation */}
      <AlertDialog open={!!deleteRestaurantId} onOpenChange={() => setDeleteRestaurantId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Restaurant</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the restaurant and all its data from the platform. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRestaurant}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Restaurant
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
