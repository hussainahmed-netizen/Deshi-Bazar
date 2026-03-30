import { db } from '@/lib/db';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY = { name: '', slug: '', description: '', image_url: '', is_featured: false, is_active: true };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    const data = await db.entities.Category.list('-created_date', 100);
    setCategories(data);
    setLoading(false);
  };

  const openNew = () => { setForm(EMPTY); setEditingId(null); setDialogOpen(true); };
  const openEdit = (cat) => { setForm({ ...EMPTY, ...cat }); setEditingId(cat.id); setDialogOpen(true); };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, image_url: file_url }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('Name is required'); return; }
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-');
    if (editingId) {
      await db.entities.Category.update(editingId, { ...form, slug });
      toast.success('Category updated');
    } else {
      await db.entities.Category.create({ ...form, slug });
      toast.success('Category created');
    }
    setDialogOpen(false);
    loadCategories();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    await db.entities.Category.delete(id);
    toast.success('Deleted');
    loadCategories();
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Categories</h1>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Add Category</Button>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-secondary/30">
              <th className="text-left p-3 font-medium">Category</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Slug</th>
              <th className="text-left p-3 font-medium hidden lg:table-cell">Description</th>
              <th className="text-center p-3 font-medium">Visible</th>
              <th className="text-center p-3 font-medium hidden md:table-cell">Featured</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id} className="border-b last:border-0 hover:bg-accent/30">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-secondary overflow-hidden shrink-0">
                      {cat.image_url ? <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" /> : <Tag className="h-4 w-4 m-2.5 text-muted-foreground" />}
                    </div>
                    <span className="font-medium">{cat.name}</span>
                  </div>
                </td>
                <td className="p-3 hidden md:table-cell text-muted-foreground">{cat.slug}</td>
                <td className="p-3 hidden lg:table-cell text-muted-foreground truncate max-w-xs">{cat.description || '—'}</td>
                <td className="p-3 text-center">
                  <Switch checked={cat.is_active !== false} onCheckedChange={async (v) => { await db.entities.Category.update(cat.id, { is_active: v }); loadCategories(); }} />
                </td>
                <td className="p-3 text-center hidden md:table-cell">
                  <Switch checked={!!cat.is_featured} onCheckedChange={async () => { await db.entities.Category.update(cat.id, { is_featured: !cat.is_featured }); loadCategories(); }} />
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(cat.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No categories yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Category' : 'New Category'}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><Label>Name *</Label><Input className="mt-1" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Slug (auto-generated if empty)</Label><Input className="mt-1" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="e.g. mens-fashion" /></div>
            <div><Label>Description</Label><Input className="mt-1" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div>
              <Label>Image</Label>
              {form.image_url && <img src={form.image_url} alt="preview" className="mt-1 h-20 w-full object-cover rounded-lg border mb-1" />}
              <label className="mt-1 flex items-center justify-center gap-2 h-9 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent text-sm text-muted-foreground">
                {uploading ? 'Uploading...' : 'Upload Image'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
              <Input className="mt-1" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="or paste URL" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active !== false} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Visible on website</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={!!form.is_featured} onCheckedChange={v => setForm(f => ({ ...f, is_featured: v }))} />
              <Label>Featured on homepage</Label>
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