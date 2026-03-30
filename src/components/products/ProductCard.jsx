import { db } from '@/lib/db';

import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import { toast } from 'sonner';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const user = await db.auth.me().catch(() => null);
    if (!user) { navigate('/'); return; }
    const existing = await db.entities.CartItem.filter({ user_email: user.email, product_id: product.id });
    if (existing.length > 0) {
      await db.entities.CartItem.update(existing[0].id, { quantity: existing[0].quantity + 1 });
    } else {
      await db.entities.CartItem.create({
        product_id: product.id, product_name: product.name,
        product_image: product.images?.[0] || '', price: product.price,
        quantity: 1, user_email: user.email,
      });
    }
    toast.success('Added to cart!');
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary/30">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ShoppingCart className="h-10 w-10 opacity-20" />
          </div>
        )}
        {discount > 0 && (
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold">
            -{discount}%
          </Badge>
        )}
        {product.is_flash_deal && (
          <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-bold">
            ⚡ Flash
          </Badge>
        )}
      </div>

      <div className="p-2 flex flex-col flex-1">
        <h3 className="text-xs sm:text-sm font-medium line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-1">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mb-1">
          <Star className="h-3 w-3 fill-primary text-primary" />
          <span className="text-[10px] text-muted-foreground">
            {product.rating?.toFixed(1) || '0.0'} ({product.review_count || 0})
          </span>
        </div>

        <div className="flex items-baseline gap-1 flex-wrap">
          <span className="text-sm sm:text-base font-bold text-primary">৳{product.price?.toLocaleString()}</span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-[10px] text-muted-foreground line-through">
              ৳{product.original_price?.toLocaleString()}
            </span>
          )}
        </div>

        <div className="mt-auto pt-2">
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-1.5 border border-primary text-primary rounded-lg py-1.5 text-xs font-semibold hover:bg-primary hover:text-white transition-colors"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}