import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/lib/AuthContext';

export default function Header({ cartCount = 0 }) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, signInWithGoogle } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const categories = [
    { name: "Men's Fashion", path: "/products?category=mens" },
    { name: "Women's Fashion", path: "/products?category=womens" },
    { name: "Kids", path: "/products?category=kids" },
    { name: "Accessories", path: "/products?category=accessories" },
    { name: "Footwear", path: "/products?category=footwear" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card shadow-sm">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between text-xs">
          <span className="font-medium">🔥 Free shipping on orders over ৳999!</span>
          <div className="hidden md:flex items-center gap-4">
            <Link to="/orders" className="hover:underline">Track Order</Link>
            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <Link to="/admin" className="hover:underline">Admin Panel</Link>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="p-6">
                <Link to="/">
                  <span className="font-heading text-2xl font-bold text-primary">DeshiBazar</span>
                </Link>
              </div>
              <nav className="px-4 pb-6 space-y-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.path}
                    to={cat.path}
                    className="block px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
                <div className="border-t my-3" />
                <Link to="/orders" className="block px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent transition-colors">
                  My Orders
                </Link>
                <Link to="/cart" className="block px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent transition-colors">
                  Cart
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="shrink-0">
            <span className="font-heading text-xl md:text-2xl font-bold text-primary">DeshiBazar</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden sm:flex">
            <div className="relative w-full">
              <Input
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-12 h-10 bg-secondary/50 border-border focus-visible:ring-primary"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-0 top-0 h-10 w-10 rounded-l-none"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2 ml-auto">
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            <div className="hidden sm:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {isAuthenticated && user ? (
                    <>
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium">{user.user_metadata?.full_name || user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/orders')}>
                        My Orders
                      </DropdownMenuItem>
                      {(user?.email === 'hussainahmed199312@gmail.com' || user?.user_metadata?.role === 'super_admin') && (
                        <DropdownMenuItem onClick={() => navigate('/admin')}>
                          Admin Panel
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>
                        Logout
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem onClick={signInWithGoogle}>
                      Sign in with Google
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="sm:hidden mt-3">
          <div className="relative w-full">
            <Input
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-12 h-9 bg-secondary/50"
            />
            <Button type="submit" size="icon" className="absolute right-0 top-0 h-9 w-9 rounded-l-none">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      {/* Desktop category nav */}
      <nav className="hidden lg:block border-t bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-8 h-10">
            {categories.map((cat) => (
              <Link
                key={cat.path}
                to={cat.path}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}