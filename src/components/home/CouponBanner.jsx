import { db } from '@/lib/db';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Ticket, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function CouponBanner() {
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    db.entities.Coupon.filter({ is_active: true }, '-created_date', 10).then(data => {
      const valid = data.filter(c => !c.expiry_date || new Date(c.expiry_date) >= new Date());
      setCoupons(valid);
    }).catch(() => {});
  }, []);

  if (coupons.length === 0) return null;

  const copyCode = (e, code) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied!');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="font-heading text-xl md:text-2xl font-bold mb-4">🎟️ Active Coupons</h2>
      <div className="flex gap-4 overflow-x-auto pb-3 snap-x">
        {coupons.map(coupon => {
          const url = coupon.eligible_product_ids?.length > 0
            ? `/products?coupon=${coupon.code}`
            : `/products?coupon=${coupon.code}`;
          return (
            <Link
              key={coupon.id}
              to={url}
              className="shrink-0 snap-start w-64 rounded-2xl overflow-hidden border hover:shadow-lg transition-shadow group"
            >
              {/* Banner image or color */}
              <div className="h-28 relative flex items-center justify-center" style={{ backgroundColor: coupon.bg_color || '#f97316' }}>
                {coupon.image_url
                  ? <img src={coupon.image_url} alt={coupon.code} className="w-full h-full object-cover" />
                  : <Ticket className="h-14 w-14 text-white/50" />
                }
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-0.5 text-xs font-bold" style={{ color: coupon.bg_color || '#f97316' }}>
                  {coupon.discount_type === 'percentage' ? `${coupon.amount}% OFF` : `৳${coupon.amount} OFF`}
                </div>
              </div>

              {/* Info */}
              <div className="bg-card p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-base">{coupon.code}</span>
                  <button
                    onClick={(e) => copyCode(e, coupon.code)}
                    className="text-muted-foreground hover:text-foreground p-1"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                {coupon.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{coupon.description}</p>
                )}
                {coupon.min_order > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">Min order ৳{coupon.min_order}</p>
                )}
                <p className="text-xs text-primary font-medium mt-2">Tap to shop →</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}