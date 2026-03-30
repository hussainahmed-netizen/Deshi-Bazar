import { db } from '@/lib/db';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Package, ShoppingCart, Users, TrendingUp, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pending: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [products, orders] = await Promise.all([
      db.entities.Product.list('-created_date', 200),
      db.entities.Order.list('-created_date', 200),
    ]);

    const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const pending = orders.filter(o => o.status === 'pending').length;

    setStats({ products: products.length, orders: orders.length, revenue, pending });
    setRecentOrders(orders.slice(0, 5));
    setLoading(false);
  };

  const statCards = [
    { label: 'Total Products', value: stats.products, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Orders', value: stats.orders, icon: ShoppingCart, color: 'bg-green-50 text-green-600' },
    { label: 'Revenue', value: `৳${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
    { label: 'Pending Orders', value: stats.pending, icon: Users, color: 'bg-orange-50 text-orange-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className="bg-card border rounded-xl p-4">
            <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-lg font-semibold">Recent Orders</h2>
        <Link to="/admin/orders" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
          View All <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-secondary/30">
              <th className="text-left p-3 font-medium">Order</th>
              <th className="text-left p-3 font-medium hidden sm:table-cell">Customer</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-right p-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(order => (
              <tr key={order.id} className="border-b last:border-0 hover:bg-accent/30">
                <td className="p-3 font-medium">{order.order_number}</td>
                <td className="p-3 text-muted-foreground hidden sm:table-cell">{order.shipping_name}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-3 text-right font-medium">৳{order.total?.toLocaleString()}</td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}