import { db } from '@/lib/db';
import { supabase } from '@/lib/supabaseClient';

import { useState, useEffect } from 'react';

import { useOutletContext, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Trash2, Pencil, UserCheck, UserPlus, Search } from 'lucide-react';
import { toast } from 'sonner';

const PERMISSION_OPTIONS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'products', label: 'Products' },
  { key: 'categories', label: 'Categories' },
  { key: 'orders', label: 'Orders' },
  { key: 'customers', label: 'Customers' },
  { key: 'coupons', label: 'Coupons' },
  { key: 'banners', label: 'Hero Banners' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'settings', label: 'Settings' },
];

export default function AdminUsers() {
  const { currentUser, isSuperAdmin } = useOutletContext();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ role: 'admin', admin_permissions: [] });
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('admins'); // 'admins' | 'all'

  useEffect(() => {
    if (!isSuperAdmin) { navigate('/admin'); return; }
    loadUsers();
  }, [isSuperAdmin]);

  const loadUsers = async () => {
    try {
      // Get current session user (the only user we can access from client-side)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Format the current user to match expected format
        const formattedUser = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email,
          role: user.user_metadata?.role || 'super_admin', // Default to super_admin for the owner
          admin_permissions: user.user_metadata?.admin_permissions || [],
          created_at: user.created_at,
        };
        setUsers([formattedUser]);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users from Supabase Auth.');
    } finally {
      setLoading(false);
    }
  };

  const grantAccess = (user) => {
    setEditingUser(user);
    setEditForm({ role: 'admin', admin_permissions: [] });
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      role: user.role || 'admin',
      admin_permissions: user.admin_permissions || [],
    });
  };

  const saveEdit = async () => {
    // Cannot change super_admin's own role
    if (editingUser.id === currentUser.id) {
      toast.error("You can't edit your own account here.");
      return;
    }
    await db.entities.User.update(editingUser.id, {
      role: editForm.role,
      admin_permissions: editForm.role === 'admin' ? editForm.admin_permissions : [],
    });
    toast.success('User updated');
    setEditingUser(null);
    loadUsers();
  };

  const deleteUser = async (user) => {
    if (user.id === currentUser.id) {
      toast.error("You can't delete your own account.");
      return;
    }
    if (user.role === 'super_admin') {
      toast.error("Cannot delete another Super Admin.");
      return;
    }
    if (!confirm(`Remove admin access for ${user.full_name || user.email}?`)) return;
    await db.entities.User.update(user.id, { role: 'user', admin_permissions: [] });
    toast.success('Admin access revoked');
    loadUsers();
  };

  const togglePermission = (key) => {
    setEditForm(prev => ({
      ...prev,
      admin_permissions: prev.admin_permissions.includes(key)
        ? prev.admin_permissions.filter(p => p !== key)
        : [...prev.admin_permissions, key],
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  const adminUsers = users.filter(u => u.role === 'admin' || u.role === 'super_admin');
  const regularUsers = users.filter(u => u.role !== 'admin' && u.role !== 'super_admin');

  const filterUsers = (list) => list.filter(u =>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-amber-500" />
        <h1 className="font-heading text-2xl font-bold">Admin Users</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-secondary/40 p-1 rounded-lg w-fit">
        <button onClick={() => setTab('admins')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'admins' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
          Admins ({adminUsers.length})
        </button>
        <button onClick={() => setTab('all')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'all' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
          All Users ({regularUsers.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input className="flex h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-secondary/30">
              <th className="text-left p-3 font-medium">User</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Role</th>
              {tab === 'admins' && <th className="text-left p-3 font-medium hidden lg:table-cell">Permissions</th>}
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tab === 'admins' && filterUsers(adminUsers).map(user => (
              <tr key={user.id} className="border-b last:border-0 hover:bg-accent/30">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {(user.full_name || user.email || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{user.full_name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    {user.id === currentUser.id && (
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">You</span>
                    )}
                  </div>
                </td>
                <td className="p-3 hidden md:table-cell">
                  {user.role === 'super_admin' ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full w-fit">
                      <Shield className="h-3 w-3" /> Super Admin
                    </span>
                  ) : (
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">Admin</span>
                  )}
                </td>
                <td className="p-3 hidden lg:table-cell">
                  {user.role === 'super_admin' ? (
                    <span className="text-xs text-muted-foreground italic">Full Access</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {(user.admin_permissions || []).length === 0
                        ? 'No permissions set'
                        : (user.admin_permissions || []).join(', ')}
                    </span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {user.role !== 'super_admin' && (
                      <>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(user)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteUser(user)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {tab === 'all' && filterUsers(regularUsers).map(user => (
              <tr key={user.id} className="border-b last:border-0 hover:bg-accent/30">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-bold text-sm shrink-0">
                      {(user.full_name || user.email || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{user.full_name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 hidden md:table-cell">
                  <span className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded-full">User</span>
                </td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => grantAccess(user)}>
                    <UserPlus className="h-3.5 w-3.5" /> Grant Admin Access
                  </Button>
                </td>
              </tr>
            ))}
            {tab === 'admins' && filterUsers(adminUsers).length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No admin users found</td></tr>
            )}
            {tab === 'all' && filterUsers(regularUsers).length === 0 && (
              <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No regular users found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Admin: {editingUser?.full_name || editingUser?.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Role</Label>
              <Select value={editForm.role} onValueChange={v => setEditForm({ ...editForm, role: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editForm.role === 'admin' && (
              <div>
                <Label className="mb-2 block">Accessible Sections</Label>
                <div className="space-y-2.5">
                  {PERMISSION_OPTIONS.map(opt => (
                    <div key={opt.key} className="flex items-center gap-2">
                      <Checkbox
                        id={opt.key}
                        checked={editForm.admin_permissions.includes(opt.key)}
                        onCheckedChange={() => togglePermission(opt.key)}
                      />
                      <Label htmlFor={opt.key} className="cursor-pointer">{opt.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {editForm.role === 'super_admin' && (
              <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
                Super Admin has full access to all sections and cannot be restricted.
              </p>
            )}

            <Button className="w-full" onClick={saveEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}