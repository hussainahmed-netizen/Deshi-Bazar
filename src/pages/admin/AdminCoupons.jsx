import { db } from '@/lib/db';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Trash2, Ticket, Copy, Upload, Search } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY = { code: '', description: '', discount_type: 'percentage', amount: 10, min_order: 0, max_uses: 0, used_count: 0, expiry_date: '', is_active: true, image_url: '', bg_color: '#f97316', eligible_product_ids: [] };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    Promise.all([
      db.entities.Coupon.list('-created_date', 100),
      db.entities.Product.filter({ status: 'active' }, '-created_date', 200),
    ]).then(([c, p]) => { setCoupons(c); setProducts(p); setLoading(false); });
  }, []);

  const loadCoupons = async () => {
    const data = await db.entities.Coupon.list('-created_date', 100);
    setCoupons(data);
  };

  const openNew = () => { setForm(EMPTY); setEditingId(null); setProductSearch(''); setDialogOpen(true); };
  const openEdit = (c) => { setForm({ ...EMPTY, ...c, eligible_product_ids: c.eligible_product_ids || [] }); setEditingId(c.id); setProductSearch(''); setDialogOpen(true); };

  const generateCode = () => {
    const code = 'DESHI' + Math.random().toString(36).substring(2, 7).toUpperCase();
    setForm(f => ({ ...f, code }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, image_url: file_url }));
    setUploading(false);
  };

  const toggleProduct = (id) => {
    setForm(f => ({
      ...f,
      eligible_product_ids: f.eligible_product_ids.includes(id)
        ? f.eligible_product_ids.filter(p => p !== id)
        : [...f.eligible_product_ids, id],
    }));
  };

  const handleSave = async () => {
    if (!form.code || !form.amount) { toast.error('Code and amount are required'); return; }
    if (editingId) {
      await db.entities.Coupon.update(editingId, form);
      toast.success('Coupon updated');
    } else {
      await db.entities.Coupon.create(form);
      toast.success('Coupon created');
    }
    setDialogOpen(false);
    loadCoupons();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete coupon?')) return;
    await db.entities.Coupon.delete(id);
    toast.success('Deleted');
    loadCoupons();
  };

  const copyCode = (code) => { navigator.clipboard.writeText(code); toast.success('Code copied!'); };
  const isExpired = (coupon) => coupon.expiry_date && new Date(coupon.expiry_date) < new Date();

  const filteredProducts = products.filter(p =>
    !productSearch || p.name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Coupons</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage discount coupons</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Add Coupon</Button>
      </div>

      <div className="grid gap-3">
        {coupons.map(coupon => (
          <div key={coupon.id} className={`bg-card border rounded-xl overflow-hidden ${isExpired(coupon) ? 'opacity-60' : ''}`}>
            <div className="flex items-stretch">
              {/* Banner image or colored strip */}
              <div className="w-24 shrink-0 relative" style={{ backgroundColor: coupon.bg_color || '#f97316' }}>
                {coupon.image_url
                  ? <img src={coupon.image_url} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Ticket className="h-8 w-8 text-white/70" /></div>
                }
              </div>
              <div className="flex flex-1 items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold font-mono text-lg">{coupon.code}</span>
                    <button onClick={() => copyCode(coupon.code)} className="text-muted-foreground hover:text-foreground"><Copy className="h-3.5 w-3.5" /></button>
                    {!coupon.is_active && <Badge variant="secondary">Inactive</Badge>}
                    {isExpired(coupon) && <Badge variant="destructive">Expired</Badge>}
                    {(coupon.eligible_product_ids?.length > 0) && <Badge variant="outline">{coupon.eligible_product_ids.length} products</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {coupon.discount_type === 'percentage' ? `${coupon.amount}% off` : `৳${coupon.amount} off`}
                    {coupon.min_order > 0 && ` • Min order ৳${coupon.min_order}`}
                    {coupon.max_uses > 0 && ` • ${coupon.used_count || 0}/${coupon.max_uses} used`}
                    {coupon.expiry_date && ` • Expires ${new Date(coupon.expiry_date).toLocaleDateString()}`}
                  </p>
                  {coupon.description && <p className="text-xs text-muted-foreground mt-0.5">{coupon.description}</p>}
                </div>
                <Switch checked={!!coupon.is_active} onCheckedChange={async () => { await db.entities.Coupon.update(coupon.id, { is_active: !coupon.is_active }); loadCoupons(); }} />
                <Button variant="ghost" size="icon" onClick={() => openEdit(coupon)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(coupon.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        ))}
        {coupons.length === 0 && (
          <div className="text-center py-16 bg-card border rounded-xl">
            <Ticket className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No coupons yet.</p>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Coupon' : 'New Coupon'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Coupon Code *</Label>
              <div className="flex gap-2 mt-1">
                <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. SAVE20" className="font-mono" />
                <Button type="button" variant="outline" onClick={generateCode}>Generate</Button>
              </div>
            </div>
            <div><Label>Description</Label><Input className="mt-1" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>

            {/* Image + Color */}
            <div>
              <Label>Banner Image</Label>
              {form.image_url && <img src={form.image_url} alt="preview" className="mt-1 h-20 w-full object-cover rounded-lg border mb-1" />}
              <div className="flex gap-2 mt-1">
                <Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="Paste image URL..." />
                <label className="flex items-center gap-1 px-3 py-1 border rounded-md cursor-pointer hover:bg-accent text-sm text-muted-foreground shrink-0">
                  {uploading ? '...' : <><Upload className="h-4 w-4" /> Upload</>}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1"><Label>Background Color</Label><Input className="mt-1" type="color" value={form.bg_color} onChange={e => setForm(f => ({ ...f, bg_color: e.target.value }))} /></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Discount Type</Label>
                <Select value={form.discount_type} onValueChange={v => setForm(f => ({ ...f, discount_type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (৳)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Amount *</Label><Input className="mt-1" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} /></div>
              <div><Label>Min Order (৳)</Label><Input className="mt-1" type="number" value={form.min_order} onChange={e => setForm(f => ({ ...f, min_order: Number(e.target.value) }))} /></div>
              <div><Label>Max Uses (0 = unlimited)</Label><Input className="mt-1" type="number" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: Number(e.target.value) }))} /></div>
            </div>
            <div><Label>Expiry Date</Label><Input className="mt-1" type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} /></div>

            {/* Eligible products */}
            <div>
              <Label>Eligible Products ({form.eligible_product_ids.length} selected)</Label>
              <p className="text-xs text-muted-foreground mb-2">Leave empty to apply to all products</p>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input className="pl-8 h-8 text-xs" placeholder="Search products..." value={productSearch} onChange={e => setProductSearch(e.target.value)} />
              </div>
              <div className="border rounded-lg max-h-40 overflow-y-auto divide-y">
                {filteredProducts.map(p => (
                  <label key={p.id} className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer">
                    <Checkbox checked={form.eligible_product_ids.includes(p.id)} onCheckedChange={() => toggleProduct(p.id)} />
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {p.images?.[0] && <img src={p.images[0]} alt="" className="w-6 h-6 rounded object-cover shrink-0" />}
                      <span className="text-xs truncate">{p.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto shrink-0">৳{p.price?.toLocaleString()}</span>
                    </div>
                  </label>
                ))}
              </div>
              {form.eligible_product_ids.length > 0 && (
                <button className="text-xs text-primary hover:underline mt-1" onClick={() => setForm(f => ({ ...f, eligible_product_ids: [] }))}>Clear all</button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={!!form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Active</Label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave}>{editingId ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}