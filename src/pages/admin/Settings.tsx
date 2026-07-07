import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { mockSystemSettings } from '@/lib/mockData';
import { SystemSettings as SystemSettingsType } from '@/types/admin';
import { 
  CreditCard, 
  Wallet, 
  Store, 
  DollarSign,
  Truck,
  Percent,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const [settings, setSettings] = useState<SystemSettingsType>(mockSystemSettings);

  const handleToggle = (key: keyof SystemSettingsType) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success('Setting updated');
  };

  const handleSave = () => {
    toast.success('All settings saved successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">Configure platform-wide settings and feature toggles</p>
      </div>

      {/* Feature Toggles */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Toggles</CardTitle>
          <CardDescription>Enable or disable platform features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Wallet className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <Label className="text-base">Cash on Delivery</Label>
                <p className="text-sm text-muted-foreground">Allow customers to pay with cash</p>
              </div>
            </div>
            <Switch 
              checked={settings.cash_on_delivery}
              onCheckedChange={() => handleToggle('cash_on_delivery')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <Label className="text-base">Online Payments</Label>
                <p className="text-sm text-muted-foreground">Enable online payment options</p>
              </div>
            </div>
            <Switch 
              checked={settings.online_payments}
              onCheckedChange={() => handleToggle('online_payments')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Store className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <Label className="text-base">New Restaurant Onboarding</Label>
                <p className="text-sm text-muted-foreground">Allow new restaurants to register</p>
              </div>
            </div>
            <Switch 
              checked={settings.new_restaurant_onboarding}
              onCheckedChange={() => handleToggle('new_restaurant_onboarding')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Order Settings</CardTitle>
          <CardDescription>Configure order-related parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="minOrder">Minimum Order Amount (₹)</Label>
              </div>
              <Input
                id="minOrder"
                type="number"
                value={settings.minimum_order_amount}
                onChange={(e) => setSettings(prev => ({ ...prev, minimum_order_amount: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="deliveryFee">Delivery Fee (₹)</Label>
              </div>
              <Input
                id="deliveryFee"
                type="number"
                value={settings.delivery_fee}
                onChange={(e) => setSettings(prev => ({ ...prev, delivery_fee: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="tax">Tax Percentage (%)</Label>
              </div>
              <Input
                id="tax"
                type="number"
                value={settings.tax_percentage}
                onChange={(e) => setSettings(prev => ({ ...prev, tax_percentage: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          <Save className="mr-2 h-4 w-4" />
          Save All Settings
        </Button>
      </div>
    </div>
  );
}
