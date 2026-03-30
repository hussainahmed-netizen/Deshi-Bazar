import { db } from '@/lib/db';

import { useState, useEffect, useMemo } from 'react';

import ProductCard from '../components/products/ProductCard';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [filterOpen, setFilterOpen] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search') || '';
  const categoryFilter = urlParams.get('category') || '';
  const couponCode = urlParams.get('coupon') || '';

  const [activeCategory, setActiveCategory] = useState(categoryFilter);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [activeCoupon, setActiveCoupon] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
  }, []);

  const loadData = async () => {
    const [allProducts, allCategories] = await Promise.all([
      db.entities.Product.filter({ status: 'active' }, '-created_date', 100),
      db.entities.Category.list('-created_date', 50),
    ]);
    setProducts(allProducts);
    setCategories(allCategories);
    if (couponCode) {
      const coupons = await db.entities.Coupon.filter({ code: couponCode, is_active: true });
      if (coupons[0]) setActiveCoupon(coupons[0]);
    }
    setLoading(false);
  };

  const applyDiscount = (product) => {
    if (!activeCoupon) return product;
    let discountedPrice = product.price;
    if (activeCoupon.discount_type === 'percentage') {
      discountedPrice = Math.round(product.price * (1 - activeCoupon.amount / 100));
    } else {
      discountedPrice = Math.max(0, product.price - activeCoupon.amount);
    }
    return { ...product, original_price: product.price, price: discountedPrice };
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // If coupon active, filter to eligible products only
    if (activeCoupon?.eligible_product_ids?.length > 0) {
      result = result.filter(p => activeCoupon.eligible_product_ids.includes(p.id));
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
      );
    }

    if (activeCategory) {
      result = result.filter(p =>
        p.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    result = result.filter(p =>
      p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    switch (sortBy) {
      case 'price_low': result.sort((a, b) => a.price - b.price); break;
      case 'price_high': result.sort((a, b) => b.price - a.price); break;
      case 'popular': result.sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0)); break;
      case 'rating': result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      default: break;
    }

    return result.map(applyDiscount);
  }, [products, searchTerm, activeCategory, priceRange, sortBy, activeCoupon]);

  const categoryButtons = [
    { label: 'All', value: '' },
    { label: "Men's", value: 'mens' },
    { label: "Women's", value: 'womens' },
    { label: 'Kids', value: 'kids' },
    { label: 'Accessories', value: 'accessories' },
    { label: 'Footwear', value: 'footwear' },
  ];

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3">Category</h3>
        <div className="flex flex-wrap gap-2">
          {categoryButtons.map((cat) => (
            <Button
              key={cat.value}
              variant={activeCategory === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat.value)}
              className="text-xs"
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-3">Price Range</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={50000}
          step={100}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>৳{priceRange[0].toLocaleString()}</span>
          <span>৳{priceRange[1].toLocaleString()}</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Coupon Banner */}
      {activeCoupon && (
        <div className="mb-5 rounded-xl overflow-hidden border flex items-center gap-4 p-4" style={{ backgroundColor: activeCoupon.bg_color ? activeCoupon.bg_color + '22' : '#f9731622', borderColor: activeCoupon.bg_color || '#f97316' }}>
          {activeCoupon.image_url && <img src={activeCoupon.image_url} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-4 w-4" style={{ color: activeCoupon.bg_color || '#f97316' }} />
              <span className="font-bold font-mono" style={{ color: activeCoupon.bg_color || '#f97316' }}>{activeCoupon.code}</span>
              <Badge style={{ backgroundColor: activeCoupon.bg_color || '#f97316' }}>
                {activeCoupon.discount_type === 'percentage' ? `${activeCoupon.amount}% OFF` : `৳${activeCoupon.amount} OFF`}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{activeCoupon.description || 'Special discount applied to these products'}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">
            {activeCategory ? categoryButtons.find(c => c.value === activeCategory)?.label + ' Fashion' : 'All Products'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{filteredProducts.length} products found</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36 h-9 text-xs">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
            </SelectContent>
          </Select>

          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden h-9 w-9">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterPanel />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop filter sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-32">
            <FilterPanel />
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No products found</p>
              <Button variant="link" onClick={() => { setActiveCategory(''); setSearchTerm(''); setPriceRange([0, 50000]); }}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}