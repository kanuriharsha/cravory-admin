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
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import apiService from '@/services/api';
import { Zone } from '@/types/admin';
import { 
  Plus,
  Edit,
  MapPin,
  Store,
  Search,
  Trash2,
  Loader2
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface Restaurant {
  _id: string;
  name: string;
}

export default function Zones() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [deleteZoneId, setDeleteZoneId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    city: 'Hyderabad',
    restaurants: [] as string[],
    is_active: true
  });

  useEffect(() => {
    fetchZones();
    fetchRestaurants();
  }, []);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const data = await apiService.getZones();
      setZones(data as Zone[]);
    } catch (error) {
      console.error('Error fetching zones:', error);
      toast.error('Failed to fetch zones');
      setZones([]);
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

  const filteredZones = zones.filter(zone => 
    zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    zone.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      city: 'Hyderabad',
      restaurants: [],
      is_active: true
    });
  };

  const handleSaveZone = async () => {
    if (!formData.name || !formData.city) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (editingZone) {
        await apiService.updateZone(editingZone._id, formData);
        toast.success('Zone updated successfully');
      } else {
        await apiService.createZone(formData);
        toast.success('Zone created successfully');
      }

      fetchZones();
      setIsDialogOpen(false);
      setEditingZone(null);
      resetForm();
    } catch (error) {
      console.error('Error saving zone:', error);
      toast.error('Failed to save zone');
    }
  };

  const handleDelete = async () => {
    if (!deleteZoneId) return;

    try {
      await apiService.deleteZone(deleteZoneId);
      toast.success('Zone deleted successfully');
      fetchZones();
      setIsDeleteDialogOpen(false);
      setDeleteZoneId(null);
    } catch (error) {
      console.error('Error deleting zone:', error);
      toast.error('Failed to delete zone');
    }
  };

  const toggleActive = async (zone: Zone) => {
    try {
      await apiService.updateZone(zone._id, {
        is_active: !zone.is_active
      });
      toast.success(`Zone ${!zone.is_active ? 'activated' : 'deactivated'}`);
      fetchZones();
    } catch (error) {
      console.error('Error updating zone:', error);
      toast.error('Failed to update zone');
    }
  };

  const openEditDialog = (zone: Zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      city: zone.city,
      restaurants: zone.restaurants,
      is_active: zone.is_active
    });
    setIsDialogOpen(true);
  };

  const getRestaurantName = (id: string) => {
    return restaurants.find(r => r._id === id)?.name || 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Zones</h1>
          <p className="text-muted-foreground">Manage delivery zones and restaurant assignments</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setEditingZone(null); setIsDialogOpen(true); }}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Zone
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search zones..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Zones Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredZones.map((zone) => (
          <Card key={zone._id} className={!zone.is_active ? 'opacity-60' : ''}>
            <CardHeader className="pb-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-2 rounded-lg bg-orange-100 shrink-0">
                    <MapPin className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{zone.name}</CardTitle>
                    <CardDescription>{zone.city}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Switch 
                    checked={zone.is_active}
                    onCheckedChange={() => toggleActive(zone)}
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(zone)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => {
                      setDeleteZoneId(zone._id);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Store className="h-4 w-4" />
                  <span>{zone.restaurants.length} restaurants assigned</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {zone.restaurants.slice(0, 3).map(id => (
                    <Badge key={id} variant="secondary" className="text-xs">
                      {getRestaurantName(id)}
                    </Badge>
                  ))}
                  {zone.restaurants.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{zone.restaurants.length - 3} more
                    </Badge>
                  )}
                </div>
                <Badge variant={zone.is_active ? 'default' : 'secondary'}>
                  {zone.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredZones.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          No zones found
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingZone ? 'Edit Zone' : 'Add New Zone'}</DialogTitle>
            <DialogDescription>
              {editingZone ? 'Update zone details and assignments' : 'Create a new delivery zone'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="zoneName">Zone Name *</Label>
              <Input
                id="zoneName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Sector 15 & Old City"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Active Zone</Label>
            </div>
            <div className="grid gap-2">
              <Label>Assign Restaurants</Label>
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                {restaurants.map(restaurant => (
                  <div key={restaurant._id} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.restaurants.includes(restaurant._id)}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          restaurants: checked
                            ? [...prev.restaurants, restaurant._id]
                            : prev.restaurants.filter(id => id !== restaurant._id)
                        }));
                      }}
                    />
                    <span className="text-sm">{restaurant.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveZone}>
              {editingZone ? 'Update' : 'Create'} Zone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this zone. This action cannot be undone.
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
