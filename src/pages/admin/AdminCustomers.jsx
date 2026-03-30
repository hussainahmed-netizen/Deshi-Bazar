import { db } from '@/lib/db';

import { useState, useEffect } from 'react';

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Users } from 'lucide-react';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      db.entities.User.list('-created_date', 200),
      db.entities.Order.list('-created_date', 500),
    ]).then(([users, ords]) => {
      // Only regular users
      setCustomers(users.filter(u => u.role === 'user' || !u.role));
      setOrders(ords);
      setLoading(false);
    });
  }, []);

  const getStats = (email) => {
    const userOrders = orders.filter(o => o.user_email === email);
    const total = userOrders.reduce((s, o) => s + (o.total || 0), 0);
    return { count: userOrders.length, total };
  };

  const filtered = customers.filter(c =>
    !search || c.full_name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">{customers.length} registered customers</p>
        </div>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-secondary/30">
              <th className="text-left p-3 font-medium">Customer</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Email</th>
              <th className="text-center p-3 font-medium">Orders</th>
              <th className="text-right p-3 font-medium">Total Spent</th>
              <th className="text-left p-3 font-medium hidden lg:table-cell">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(customer => {
              const stats = getStats(customer.email);
              return (
                <tr key={customer.id} className="border-b last:border-0 hover:bg-accent/30">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {(customer.full_name || customer.email || 'U')[0].toUpperCase()}
                      </div>
                      <span className="font-medium">{customer.full_name || '—'}</span>
                    </div>
                  </td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{customer.email}</td>
                  <td className="p-3 text-center">
                    <Badge variant={stats.count > 0 ? 'default' : 'secondary'}>{stats.count}</Badge>
                  </td>
                  <td className="p-3 text-right font-medium">৳{stats.total.toLocaleString()}</td>
                  <td className="p-3 hidden lg:table-cell text-muted-foreground text-xs">
                    {new Date(customer.created_date).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No customers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}