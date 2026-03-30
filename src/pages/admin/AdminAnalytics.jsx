import { db } from '@/lib/db';

import { useState, useEffect } from 'react';

import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, ShoppingBag, Users, Package, BarChart2 } from 'lucide-react';

const COLORS = ['hsl(24,95%,53%)', 'hsl(24,80%,65%)', 'hsl(20,70%,45%)', 'hsl(35,90%,55%)', 'hsl(15,85%,50%)'];

export default function AdminAnalytics() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      db.entities.Order.list('-created_date', 500),
      db.entities.Product.list('-created_date', 200),
    ]).then(([ords, prods]) => {
      setOrders(ords);
      setProducts(prods);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  // Last 7 days revenue
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('en', { weekday: 'short' });
    const dayOrders = orders.filter(o => {
      const od = new Date(o.created_date);
      return od.toDateString() === d.toDateString();
    });
    return { day: label, revenue: dayOrders.reduce((s, o) => s + (o.total || 0), 0), orders: dayOrders.length };
  });

  // Last 6 months revenue
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const label = d.toLocaleDateString('en', { month: 'short' });
    const monthOrders = orders.filter(o => {
      const od = new Date(o.created_date);
      return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
    });
    return { month: label, revenue: monthOrders.reduce((s, o) => s + (o.total || 0), 0) };
  });

  // Orders by status
  const statusData = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: orders.filter(o => o.status === s).length,
  })).filter(s => s.value > 0);

  // Top products by sold
  const topProducts = [...products].sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0)).slice(0, 5);

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Analytics & Reports</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `৳${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
          { label: 'Delivered', value: deliveredOrders, icon: Package, color: 'text-primary bg-primary/10' },
          { label: 'Products', value: products.length, icon: Users, color: 'text-purple-600 bg-purple-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border rounded-xl p-4">
            <div className={`inline-flex p-2 rounded-lg ${color} mb-3`}><Icon className="h-5 w-5" /></div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Revenue charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-xl p-5">
          <h2 className="font-semibold mb-4">Revenue - Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={last7}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(24,95%,53%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(24,95%,53%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`৳${v}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(24,95%,53%)" fill="url(#rev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border rounded-xl p-5">
          <h2 className="font-semibold mb-4">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last6Months}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`৳${v}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="hsl(24,95%,53%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Order status pie */}
        <div className="bg-card border rounded-xl p-5">
          <h2 className="font-semibold mb-4">Orders by Status</h2>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5">
              {statusData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{item.name}:</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top products */}
        <div className="bg-card border rounded-xl p-5">
          <h2 className="font-semibold mb-4">Top Products by Sales</h2>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                <div className="w-8 h-8 rounded bg-secondary overflow-hidden shrink-0">
                  {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                </div>
                <p className="flex-1 text-sm truncate">{p.name}</p>
                <span className="text-sm font-medium shrink-0">{p.sold_count || 0} sold</span>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-sm text-muted-foreground">No sales data yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}