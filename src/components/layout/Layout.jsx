import { db, onCartChange } from '@/lib/db';
import { supabase } from '@/lib/supabaseClient';

import { Outlet } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';

export default function Layout() {
  const [cartCount, setCartCount] = useState(0);

  // Memoized cart count loader - only fetches count, not all items
  const loadCartCount = useCallback(async () => {
    const user = await db.auth.me().catch(() => null);
    if (!user) {
      setCartCount(0);
      return;
    }
    
    // Use count query for better performance
    const { count, error } = await supabase
      .from('cart_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_email', user.email);
    
    if (!error && count !== null) {
      setCartCount(count);
    }
  }, []);

  useEffect(() => {
    loadCartCount();
    
    // Subscribe to cart changes for real-time updates
    const unsubscribe = onCartChange(() => {
      loadCartCount();
    });
    
    return unsubscribe;
  }, [loadCartCount]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={cartCount} />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <div className="hidden md:block"><Footer /></div>
      <BottomNav />
    </div>
  );
}