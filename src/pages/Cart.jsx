import { db } from '@/lib/db';

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const user = await db.auth.me();
    const cartItems = await db.entities.CartItem.filter({ user_email: user.email }, '-created_date', 50);
    setItems(cartItems);
    setLoading(false);
  };

  const updateQuantity = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      await db.entities.CartItem.delete(item.id);
      toast.success('Item removed');
    } else {
      await db.entities.CartItem.update(item.id, { quantity: newQty });
    }
    loadCart();
  };

  const removeItem = async (item) => {
    await db.entities.CartItem.delete(item.id);
    toast.success('Item removed');
    loadCart();
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 999 ? 0 : 60;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="font-heading text-xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground text-sm mb-6">Add items to your cart and they will appear here</p>
        <Link to="/products"><Button className="gap-2">Start Shopping <ArrowRight className="h-4 w-4" /></Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="font-heading text-2xl font-bold mb-6">Shopping Cart ({items.length} items)</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex gap-4 p-4 bg-card border rounded-xl">
              <Link to={`/product/${item.product_id}`} className="shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-secondary/30">
                  {item.product_image ? (
                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product_id}`} className="text-sm font-medium hover:text-primary line-clamp-2">
                  {item.product_name}
                </Link>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  {item.size && <span>Size: {item.size}</span>}
                  {item.color && <span>Color: {item.color}</span>}
                </div>
                <p className="text-primary font-bold mt-2">৳{item.price?.toLocaleString()}</p>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border rounded-lg">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item, -1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item, 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(item)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border rounded-xl p-5 sticky top-32">
            <h2 className="font-heading font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className={shipping === 0 ? 'text-green-600' : ''}>
                  {shipping === 0 ? 'Free' : `৳${shipping}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  Add ৳{(999 - subtotal).toLocaleString()} more for free shipping
                </p>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-primary">৳{total.toLocaleString()}</span>
              </div>
            </div>
            <Button className="w-full mt-4 gap-2 font-semibold" size="lg" onClick={() => navigate('/checkout')}>
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}