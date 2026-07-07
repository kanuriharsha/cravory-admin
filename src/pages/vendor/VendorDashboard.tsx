import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, ShoppingBag, TrendingUp, Star, AlertTriangle, Loader2, ArrowUpRight, Clock, Truck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import vendorApiService from '@/services/vendorApi';
import type { VendorDashboardStats, VendorOrder } from '@/types/vendor';

export default function VendorDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<VendorDashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, ordersData] = await Promise.all([
        vendorApiService.getDashboardStats(),
        vendorApiService.getOrders({}),
      ]);
      setStats(statsData as VendorDashboardStats);
      setRecentOrders((ordersData as VendorOrder[]).slice(0, 6));
    } catch (error) {
      console.error('Error fetching vendor dashboard:', error);
      setStats({ total_vendors: 0, active_vendors: 0, pending_vendors: 0, total_products: 0, active_orders: 0, total_revenue: 0, avg_rating: 0, flagged_vendors: 0, orders_today: 0, dispatched_today: 0 });
      setRecentOrders([]);
    } finally { setLoading(false); }
  };

  const statusColor = (s: string) => {
    const c: Record<string,string> = { placed:'bg-blue-100 text-blue-700', auto_assigned:'bg-purple-100 text-purple-700', vendor_accepted:'bg-indigo-100 text-indigo-700', preparing:'bg-amber-100 text-amber-700', dispatched:'bg-cyan-100 text-cyan-700', in_transit:'bg-orange-100 text-orange-700', delivered:'bg-green-100 text-green-700', cancelled:'bg-red-100 text-red-700' };
    return c[s] || 'bg-gray-100 text-gray-700';
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;

  const StatCard = ({ title, value, sub, Icon, borderColor, iconBg }: any) => (
    <Card className={`border-l-4 ${borderColor} hover:shadow-lg transition-shadow`}>
      <CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">{title}</p><p className="text-2xl font-bold mt-1">{value}</p>{sub && <p className="text-xs mt-1 text-muted-foreground">{sub}</p>}</div><div className={`h-12 w-12 rounded-xl ${iconBg} flex items-center justify-center`}><Icon className="h-6 w-6" /></div></div></CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendor Dashboard</h1>
          <p className="text-muted-foreground">Authentic Foods — E-commerce & Supply Chain Overview</p>
        </div>
        <Button onClick={() => navigate('/admin/vendors/list')} className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-md">
          <Users className="h-4 w-4 mr-2" />Manage Vendors
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Vendors" value={stats?.total_vendors || 0} sub={`${stats?.active_vendors || 0} active`} Icon={Users} borderColor="border-l-amber-500" iconBg="bg-amber-100 text-amber-600" />
        <StatCard title="Active Products" value={stats?.total_products || 0} sub="Admin managed" Icon={Package} borderColor="border-l-yellow-500" iconBg="bg-yellow-100 text-yellow-600" />
        <StatCard title="Active Orders" value={stats?.active_orders || 0} sub={`${stats?.dispatched_today || 0} dispatched today`} Icon={ShoppingBag} borderColor="border-l-emerald-500" iconBg="bg-emerald-100 text-emerald-600" />
        <StatCard title="Flagged Vendors" value={stats?.flagged_vendors || 0} sub="Needs attention" Icon={AlertTriangle} borderColor="border-l-rose-500" iconBg="bg-rose-100 text-rose-600" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold mt-1">₹{(stats?.total_revenue || 0).toLocaleString()}</p></div><TrendingUp className="h-5 w-5 text-emerald-500" /></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Avg Rating</p><p className="text-2xl font-bold mt-1 flex items-center gap-1"><Star className="h-5 w-5 fill-amber-400 text-amber-400" />{(stats?.avg_rating || 0).toFixed(1)}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Pending Approvals</p><p className="text-2xl font-bold mt-1">{stats?.pending_vendors || 0}</p></div><Clock className="h-5 w-5 text-amber-500" /></div></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between"><div><CardTitle className="text-lg">Recent Vendor Orders</CardTitle><CardDescription>Latest orders from authentic food vendors</CardDescription></div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/vendors/orders')} className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">View All <ArrowUpRight className="h-4 w-4 ml-1" /></Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.length > 0 ? recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted/80 transition-colors">
                  <div><p className="font-medium text-sm">{order.order_id}</p><p className="text-xs text-muted-foreground">{order.vendor?.vendor_name || 'Unassigned'}</p></div>
                  <div className="text-right"><p className="font-semibold text-sm">₹{order.total_amount}</p><Badge variant="secondary" className={statusColor(order.status)}>{order.status.replace(/_/g, ' ')}</Badge></div>
                </div>
              )) : <div className="text-center py-8"><Truck className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" /><p className="text-sm text-muted-foreground">No vendor orders yet</p></div>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Add New Vendor', icon: Users, path: '/admin/vendors/list' },
              { label: 'Create Product', icon: Package, path: '/admin/vendors/products' },
              { label: 'Monitor Orders', icon: ShoppingBag, path: '/admin/vendors/orders' },
              { label: 'Quality Control', icon: AlertTriangle, path: '/admin/vendors/quality' },
              { label: 'View Earnings', icon: TrendingUp, path: '/admin/vendors/earnings' },
            ].map(({ label, icon: I, path }) => (
              <Button key={label} variant="outline" className="w-full justify-start gap-3 h-11 hover:border-amber-300 hover:bg-amber-50" onClick={() => navigate(path)}>
                <I className="h-4 w-4 text-amber-600" /><span>{label}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
