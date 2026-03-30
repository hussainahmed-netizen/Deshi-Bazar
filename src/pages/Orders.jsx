import { db } from '@/lib/db';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const user = await db.auth.me();
    const userOrders = await db.entities.Order.filter({ user_email: user.email }, '-created_date', 50);
    setOrders(userOrders);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="font-heading text-xl font-bold mb-2">No orders yet</h2>
        <p className="text-muted-foreground text-sm mb-6">Start shopping and your orders will appear here</p>
        <Link to="/products"><Button>Browse Products</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="font-heading text-2xl font-bold mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-card border rounded-xl p-4 md:p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium text-sm">{order.order_number}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.created_date).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </p>
              </div>
              <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-800'}>
                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
              </Badge>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {order.items?.slice(0, 4).map((item, i) => (
                <div key={i} className="w-14 h-14 rounded-lg bg-secondary/30 overflow-hidden shrink-0">
                  {item.product_image ? (
                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="h-4 w-4 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
              ))}
              {order.items?.length > 4 && (
                <div className="w-14 h-14 rounded-lg bg-secondary/30 flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
                  +{order.items.length - 4}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <div>
                <span className="text-xs text-muted-foreground">{order.items?.length || 0} items</span>
                <span className="mx-2 text-muted-foreground">•</span>
                <span className="text-sm font-bold text-primary">৳{order.total?.toLocaleString()}</span>
              </div>
              <span className="text-xs text-muted-foreground capitalize">{order.payment_method}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}