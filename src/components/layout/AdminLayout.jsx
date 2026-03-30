import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

// Strict admin access - only specific email addresses
const AUTHORIZED_ADMIN_EMAILS = [
  'hussainahmed199312@gmail.com',
];

// Check if user is admin - authorized emails get immediate super_admin access
const checkIsAdmin = (user) => {
  if (!user) return { isAdmin: false, isSuperAdmin: false };
  
  // Strict email check - authorized emails immediately get super_admin
  if (user.email === 'hussainahmed199312@gmail.com' || AUTHORIZED_ADMIN_EMAILS.includes(user.email)) {
    return { isAdmin: true, isSuperAdmin: true };
  }
  
  // Fallback to metadata role check
  const role = user.user_metadata?.role || user.app_metadata?.role;
  if (role === 'super_admin') {
    return { isAdmin: true, isSuperAdmin: true };
  }
  if (role === 'admin') {
    return { isAdmin: true, isSuperAdmin: false };
  }
  
  return { isAdmin: false, isSuperAdmin: false };
};

import { LayoutDashboard, Package, ShoppingCart, ArrowLeft, Menu, X, Users, Shield, Tag, Ticket, BarChart2, Settings, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ALL_NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, key: 'dashboard' },
  { label: 'Orders', path: '/admin/orders', icon: ShoppingCart, key: 'orders' },
  { label: 'Products', path: '/admin/products', icon: Package, key: 'products' },
  { label: 'Categories', path: '/admin/categories', icon: Tag, key: 'categories' },
  { label: 'Customers', path: '/admin/customers', icon: Users, key: 'customers' },
  { label: 'Coupons', path: '/admin/coupons', icon: Ticket, key: 'coupons' },
  { label: 'Hero Banners', path: '/admin/banners', icon: Image, key: 'banners' },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart2, key: 'analytics' },
  { label: 'Settings', path: '/admin/settings', icon: Settings, key: 'settings' },
  { label: 'Admin Users', path: '/admin/users', icon: Shield, key: 'users', superAdminOnly: true },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const { isAdmin, isSuperAdmin } = checkIsAdmin(user);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    if (!isAdmin) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const visibleNavItems = ALL_NAV_ITEMS.filter(item => {
    if (item.superAdminOnly) return isSuperAdmin;
    if (isSuperAdmin) return true;
    // Regular admin: check permissions from metadata
    const perms = user?.user_metadata?.admin_permissions || user?.app_metadata?.admin_permissions || [];
    return perms.includes(item.key);
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-card">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <span className="font-heading font-bold text-primary">DeshiBazar Admin</span>
        <Link to="/"><Button variant="ghost" size="sm" className="text-xs gap-1"><ArrowLeft className="h-3 w-3" /> Store</Button></Link>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-60 bg-card border-r transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-5 border-b hidden lg:block">
            <Link to="/" className="font-heading text-lg font-bold text-primary">DeshiBazar</Link>
            <div className="flex items-center gap-1.5 mt-1">
              {isSuperAdmin ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  <Shield className="h-3 w-3" /> Super Admin
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Admin Panel</span>
              )}
            </div>
          </div>

          <nav className="p-3 space-y-1 mt-4 lg:mt-0">
            {visibleNavItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <div className="border-t my-3" />
            <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent">
              <ArrowLeft className="h-4 w-4" /> Back to Store
            </Link>
          </nav>

          {user && (
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-card">
              <p className="text-xs font-medium truncate">{user.user_metadata?.full_name || user.email}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <button onClick={logout} className="text-xs text-red-500 mt-2 hover:underline">Logout</button>
            </div>
          )}
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 min-h-screen min-w-0 overflow-x-hidden">
          {user && <Outlet context={{ currentUser: user, isSuperAdmin }} />}
        </main>
      </div>
    </div>
  );
}