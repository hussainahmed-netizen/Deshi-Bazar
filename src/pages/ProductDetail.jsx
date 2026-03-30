import { db } from '@/lib/db';

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Minus, Plus, ShoppingCart, Truck, Shield, RotateCcw, ChevronLeft, X, ZoomIn, Zap } from 'lucide-react';
import { toast } from 'sonner';
import ProductCard from '../components/products/ProductCard';
import ReviewSection from '../components/products/ReviewSection';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    const products = await db.entities.Product.filter({ status: 'active' }, '-created_date', 50);
    const found = products.find(p => p.id === id);
    setProduct(found);
    if (found) {
      setRelatedProducts(products.filter(p => p.category === found.category && p.id !== found.id).slice(0, 5));
      setSelectedSize(found.sizes?.[0] || '');
      setSelectedColor(found.colors?.[0] || '');
    }
    setLoading(false);
  };

  const addToCart = async (redirect = false) => {
    setAddingToCart(true);
    const user = await db.auth.me();
    const existingItems = await db.entities.CartItem.filter({
      user_email: user.email,
      product_id: product.id,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    });

    if (existingItems.length > 0) {
      await db.entities.CartItem.update(existingItems[0].id, {
        quantity: existingItems[0].quantity + quantity,
      });
    } else {
      await db.entities.CartItem.create({
        product_id: product.id,
        product_name: product.name,
        product_image: product.images?.[0] || '',
        price: product.price,
        quantity,
        size: selectedSize,
        color: selectedColor,
        user_email: user.email,
      });
    }
    if (redirect) {
      navigate('/checkout');
    } else {
      toast.success('Added to cart!');
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">Product not found</p>
        <Link to="/products"><Button>Browse Products</Button></Link>
      </div>
    );
  }

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-foreground">Products</Link>
        <span>/</span>
        <span className="text-foreground truncate">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-3">
          {lightboxOpen && (
            <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
              <button className="absolute top-4 right-4 text-white bg-white/20 rounded-full p-2 hover:bg-white/30"><X className="h-5 w-5" /></button>
              <img src={product.images[selectedImage]} alt={product.name} className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={e => e.stopPropagation()} />
            </div>
          )}
          <div className="aspect-square rounded-xl overflow-hidden bg-secondary/30 border relative group cursor-zoom-in" onClick={() => product.images?.[selectedImage] && setLightboxOpen(true)}>
            {product.images?.[selectedImage] ? (
              <>
                <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <ZoomIn className="h-10 w-10 text-white drop-shadow" />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ShoppingCart className="h-16 w-16 opacity-20" />
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg border-2 overflow-hidden shrink-0 transition-colors ${
                    selectedImage === i ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-5">
          <div>
            <h1 className="font-heading text-xl md:text-2xl font-bold leading-tight">{product.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={`h-4 w-4 ${s <= (product.rating || 0) ? 'fill-primary text-primary' : 'text-muted'}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating?.toFixed(1)} ({product.review_count || 0} reviews)
              </span>
              {product.sold_count > 0 && (
                <span className="text-sm text-muted-foreground">• {product.sold_count} sold</span>
              )}
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">৳{product.price?.toLocaleString()}</span>
            {product.original_price && product.original_price > product.price && (
              <>
                <span className="text-lg text-muted-foreground line-through">৳{product.original_price?.toLocaleString()}</span>
                <Badge className="bg-destructive text-destructive-foreground">-{discount}%</Badge>
              </>
            )}
          </div>

          {product.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          {/* Size */}
          {product.sizes?.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Size</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'hover:border-primary/50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color */}
          {product.colors?.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Color: {selectedColor}</label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      selectedColor === color
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'hover:border-primary/50'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to cart - hidden on mobile (shown in sticky bar) */}
          <div className="hidden sm:block space-y-3">
            <div className="flex items-center border rounded-lg w-fit">
              <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(quantity + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-3">
              <Button size="lg" variant="outline" className="flex-1 gap-2 font-semibold" onClick={() => addToCart(false)} disabled={addingToCart}>
                <ShoppingCart className="h-4 w-4" />
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </Button>
              <Button size="lg" className="flex-1 gap-2 font-semibold bg-green-600 hover:bg-green-700 text-white border-0" onClick={() => addToCart(true)} disabled={addingToCart}>
                <Zap className="h-4 w-4" />
                Buy Now
              </Button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t">
            <div className="flex flex-col items-center text-center gap-1">
              <Truck className="h-5 w-5 text-primary" />
              <span className="text-[11px] text-muted-foreground">Free Shipping 999+</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-[11px] text-muted-foreground">Genuine Products</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <RotateCcw className="h-5 w-5 text-primary" />
              <span className="text-[11px] text-muted-foreground">Easy Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-16 left-0 right-0 z-30 sm:hidden bg-card border-t px-4 py-3 flex items-center gap-2 shadow-lg">
        <div className="flex items-center border rounded-lg shrink-0">
          <button className="h-9 w-9 flex items-center justify-center" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></button>
          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
          <button className="h-9 w-9 flex items-center justify-center" onClick={() => setQuantity(quantity + 1)}><Plus className="h-4 w-4" /></button>
        </div>
        <Button variant="outline" className="flex-1 gap-1 font-semibold h-10 text-sm" onClick={() => addToCart(false)} disabled={addingToCart}>
          <ShoppingCart className="h-4 w-4" />
          Cart
        </Button>
        <Button className="flex-1 gap-1 font-semibold h-10 text-sm bg-green-600 hover:bg-green-700 text-white border-0" onClick={() => addToCart(true)} disabled={addingToCart}>
          <Zap className="h-4 w-4" />
          Buy Now
        </Button>
      </div>

      {/* Reviews */}
      <ReviewSection productId={id} />

      {/* Related */}
      {relatedProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="font-heading text-xl font-bold mb-4">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}