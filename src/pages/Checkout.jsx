import { db } from '@/lib/db';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';

export default function Checkout() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    shipping_name: '',
    shipping_phone: '',
    shipping_address: '',
    shipping_city: '',
    payment_method: 'cod',
    notes: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const user = await db.auth.me();
    const cartItems = await db.entities.CartItem.filter({ user_email: user.email });
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }
    setItems(cartItems);
    setForm(prev => ({ ...prev, shipping_name: user.full_name || '' }));
    setLoading(false);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 999 ? 0 : 60;
  const total = subtotal + shipping;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.shipping_name || !form.shipping_phone || !form.shipping_address) {
      toast.error('Please fill in all required fields');
      return;
    }
    setPlacing(true);
    const user = await db.auth.me();
    const orderNumber = 'DB' + Date.now().toString(36).toUpperCase();

    await db.entities.Order.create({
      order_number: orderNumber,
      user_email: user.email,
      items: items.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
      subtotal,
      shipping_cost: shipping,
      total,
      status: 'pending',
      ...form,
    });

    // Clear cart
    for (const item of items) {
      await db.entities.CartItem.delete(item.id);
    }

    toast.success('Order placed successfully!');
    navigate(`/order-success?order=${orderNumber}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="font-heading text-2xl font-bold mb-6">Checkout</h1>

      {/* Order Summary on mobile — shown first */}
      <div className="md:hidden bg-card border rounded-xl p-4 mb-4">
        <h2 className="font-heading font-semibold mb-3">Order Summary</h2>
        <div className="space-y-2 mb-3">
          {items.map(item => (
            <div key={item.id} className="flex gap-2 items-center">
              <div className="w-10 h-10 rounded-lg bg-secondary/30 overflow-hidden shrink-0">
                {item.product_image && <img src={item.product_image} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{item.product_name}</p>
                <p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <span className="text-xs font-bold">৳{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-2 text-sm space-y-1">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>৳{subtotal.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'Free' : `৳${shipping}`}</span></div>
          <div className="flex justify-between font-bold border-t pt-1"><span>Total</span><span className="text-primary">৳{total.toLocaleString()}</span></div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-5 gap-6">
          {/* Shipping Info */}
          <div className="md:col-span-3 space-y-5">
            <div className="bg-card border rounded-xl p-5 space-y-4">
              <h2 className="font-heading font-semibold">Shipping Information</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" value={form.shipping_name} onChange={e => setForm({ ...form, shipping_name: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" value={form.shipping_phone} onChange={e => setForm({ ...form, shipping_phone: e.target.value })} required placeholder="01XXXXXXXXX" />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea id="address" value={form.shipping_address} onChange={e => setForm({ ...form, shipping_address: e.target.value })} required rows={2} />
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" value={form.shipping_city} onChange={e => setForm({ ...form, shipping_city: e.target.value })} placeholder="Dhaka" />
              </div>

              <div>
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <Textarea id="notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Any special instructions..." />
              </div>
            </div>

            <div className="bg-card border rounded-xl p-5 space-y-4">
              <h2 className="font-heading font-semibold">Payment Method</h2>
              <RadioGroup value={form.payment_method} onValueChange={v => setForm({ ...form, payment_method: v })}>
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex-1 cursor-pointer">
                    <span className="font-medium">Cash on Delivery</span>
                    <span className="text-xs text-muted-foreground block">Pay when you receive</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="bkash" id="bkash" />
                  <Label htmlFor="bkash" className="flex-1 cursor-pointer">
                    <span className="font-medium">bKash</span>
                    <span className="text-xs text-muted-foreground block">Mobile payment</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="nagad" id="nagad" />
                  <Label htmlFor="nagad" className="flex-1 cursor-pointer">
                    <span className="font-medium">Nagad</span>
                    <span className="text-xs text-muted-foreground block">Mobile payment</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Order Summary - desktop only */}
          <div className="hidden md:block md:col-span-2">
            <div className="bg-card border rounded-xl p-5 sticky top-32">
              <h2 className="font-heading font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg bg-secondary/30 overflow-hidden shrink-0">
                      {item.product_image && <img src={item.product_image} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium">৳{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-2 text-sm">
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
                <div className="border-t pt-2 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary">৳{total.toLocaleString()}</span>
                </div>
              </div>

              <Button type="submit" className="w-full mt-4 font-semibold" size="lg" disabled={placing}>
                {placing ? 'Placing Order...' : `Place Order • ৳${total.toLocaleString()}`}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}