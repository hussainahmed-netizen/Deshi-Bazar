import { db } from '@/lib/db';

import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Home, ShoppingBag, Search, User, Package, ShieldCheck, LogOut } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/products', label: 'Shop', icon: ShoppingBag },
  { to: '/products?search=', label: 'Search', icon: Search },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    db.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t flex md:hidden">
      {navItems.map(({ to, label, icon: Icon }) => {
        const isActive = pathname === to || (to !== '/' && pathname.startsWith(to.split('?')[0]));
        return (
          <Link
            key={label}
            to={to}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors ${
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
            {label}
          </Link>
        );
      })}

      {/* Profile button with popup */}
      <div ref={profileRef} className="flex-1 relative">
        <button
          onClick={() => setProfileOpen(o => !o)}
          className={`w-full flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors ${
            profileOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <User className={`h-5 w-5 ${profileOpen ? 'text-primary' : ''}`} />
          Profile
        </button>

        {profileOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-56 bg-card border rounded-xl shadow-xl overflow-hidden">
            {user && (
              <div className="px-4 py-3 border-b bg-secondary/30">
                <p className="text-sm font-semibold truncate">{user.user_metadata?.full_name || user.email}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            )}
            <Link
              to="/orders"
              onClick={() => setProfileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent transition-colors"
            >
              <Package className="h-4 w-4 text-muted-foreground" />
              My Orders
            </Link>
            {(user?.user_metadata?.role === 'admin' || user?.user_metadata?.role === 'super_admin') && (
              <Link
                to="/admin"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent transition-colors"
              >
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                Admin Panel
              </Link>
            )}
            <button
              onClick={async () => {
                await db.auth.logout();
                setProfileOpen(false);
                setUser(null);
                window.location.href = '/';
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-accent transition-colors border-t"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}