import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

export default function OrderSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderNumber = urlParams.get('order') || '';

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="animate-slide-up">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="font-heading text-2xl font-bold mb-2">Order Placed Successfully!</h1>
        <p className="text-muted-foreground text-sm mb-2">Thank you for shopping with DeshiBazar</p>
        {orderNumber && (
          <p className="text-sm">
            Order Number: <span className="font-bold text-primary">{orderNumber}</span>
          </p>
        )}

        <div className="bg-card border rounded-xl p-5 mt-8 text-left space-y-3">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">What happens next?</p>
              <p className="text-xs text-muted-foreground">We'll confirm your order and prepare it for shipping.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
          <Link to="/orders">
            <Button variant="outline" className="gap-2">
              Track Order
            </Button>
          </Link>
          <Link to="/products">
            <Button className="gap-2">
              Continue Shopping <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}