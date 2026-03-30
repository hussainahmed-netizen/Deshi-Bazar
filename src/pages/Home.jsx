import { db } from '@/lib/db';

import { useState, useEffect } from 'react';

import HeroCarousel from '../components/home/HeroCarousel';
import CategoryGrid from '../components/home/CategoryGrid';
import CouponBanner from '../components/home/CouponBanner';
import FlashDeals from '../components/home/FlashDeals';
import FeaturedProducts from '../components/home/FeaturedProducts';
import PromoBanner from '../components/home/PromoBanner';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [allProducts, allCategories] = await Promise.all([
      db.entities.Product.filter({ status: 'active' }, '-created_date', 20),
      db.entities.Category.list('-created_date', 20),
    ]);
    setProducts(allProducts);
    setFlashDeals(allProducts.filter(p => p.is_flash_deal));
    setCategories(allCategories);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <HeroCarousel />
      <CategoryGrid categories={categories} />
      <CouponBanner />
      <FlashDeals products={flashDeals} />
      <PromoBanner imageUrl="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80" />
      <FeaturedProducts products={products.filter(p => p.is_featured)} title="Featured Products" />
      <FeaturedProducts products={products} title="Just For You" />
    </div>
  );
}