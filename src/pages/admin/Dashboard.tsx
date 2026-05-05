import { useState, useEffect } from 'react';
import { Store, ShoppingBag, Truck, MessageSquareWarning, TrendingUp, Users, Loader2 } from 'lucide-react';
import { StatsCard } from '@/components/admin/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/admin/StatusBadge';
import apiService from '@/services/api';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, ordersData, complaintsData] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getOrders({}),
        apiService.getComplaints({})
      ]);
      
      setStats(statsData);
      setRecentOrders((ordersData as any[]).slice(0, 5));
      setRecentComplaints((complaintsData as any[]).filter((c: any) => c.status === 'open' || c.status === 'in_progress'));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values on error
      setStats({
        total_restaurants: 0,
        active_orders: 0,
        delivery_partners: 0,
        open_complaints: 0,
        total_revenue: 0,
        total_customers: 0
      });
      setRecentOrders([]);
      setRecentComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your platform overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Restaurants"
          value={stats?.total_restaurants || 0}
          icon={Store}
          trend={{ value: 12, isPositive: true }}
          iconClassName="bg-blue-100 text-blue-600"
        />
        <StatsCard
          title="Active Orders"
          value={stats?.active_orders || 0}
          icon={ShoppingBag}
          trend={{ value: 8, isPositive: true }}
          iconClassName="bg-orange-100 text-orange-600"
        />
        <StatsCard
          title="Delivery Partners"
          value={stats?.delivery_partners || 0}
          icon={Truck}
          trend={{ value: 5, isPositive: true }}
          iconClassName="bg-green-100 text-green-600"
        />
        <StatsCard
          title="Open Complaints"
          value={stats?.open_complaints || 0}
          icon={MessageSquareWarning}
          trend={{ value: 3, isPositive: false }}
          iconClassName="bg-red-100 text-red-600"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatsCard
          title="Total Revenue"
          value={`₹${(stats?.total_revenue || 0).toLocaleString()}`}
          icon={TrendingUp}
          trend={{ value: 15, isPositive: true }}
          iconClassName="bg-emerald-100 text-emerald-600"
        />
        <StatsCard
          title="Total Customers"
          value={(stats?.total_customers || 0).toLocaleString()}
          icon={Users}
          trend={{ value: 10, isPositive: true }}
          iconClassName="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <CardDescription>Latest orders across all restaurants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{order.order_id}</p>
                      <p className="text-xs text-muted-foreground">{order.restaurant?.name || 'N/A'}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-semibold text-sm">₹{order.total_amount}</p>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent orders</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Complaints */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Complaints</CardTitle>
            <CardDescription>Issues requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentComplaints.length > 0 ? (
                recentComplaints.map((complaint) => (
                  <div key={complaint._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{complaint.ticket_id}</p>
                      <p className="text-xs text-muted-foreground capitalize">{complaint.issue_type.replace('_', ' ')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={complaint.priority} />
                      <StatusBadge status={complaint.status} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No active complaints</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
