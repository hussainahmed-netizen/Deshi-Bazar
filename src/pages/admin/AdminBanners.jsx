import { db } from '@/lib/db';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Image, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY_FORM = { title: '', subtitle: '', button_text: 'Shop Now', button_link: '/products', image_url: '', bg_color: '#fff7ed', order: 0, is_active: true };

export default function AdminBanners() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadSlides(); }, []);

  const loadSlides = async () => {
    const data = await db.entities.HeroSlide.list('order', 50);
    setSlides(data);
    setLoading(false);
  };

  const openNew = () => { setForm(EMPTY_FORM); setEditingId(null); setDialogOpen(true); };
  const openEdit = (slide) => { setForm({ ...EMPTY_FORM, ...slide }); setEditingId(slide.id); setDialogOpen(true); };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, image_url: file_url }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error('Title is required'); return; }
    if (editingId) {
      await db.entities.HeroSlide.update(editingId, form);
      toast.success('Banner updated');
    } else {
      await db.entities.HeroSlide.create(form);
      toast.success('Banner created');
    }
    setDialogOpen(false);
    loadSlides();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this banner?')) return;
    await db.entities.HeroSlide.delete(id);
    toast.success('Deleted');
    loadSlides();
  };

  const toggleActive = async (slide) => {
    await db.entities.HeroSlide.update(slide.id, { is_active: !slide.is_active });
    loadSlides();
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Hero Banners</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your homepage slideshow. Banners rotate every 6 seconds.</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Add Banner</Button>
      </div>

      {slides.length === 0 ? (
        <div className="text-center py-16 bg-card border rounded-xl">
          <Image className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No banners yet. Add your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, i) => (
            <div key={slide.id} className="bg-card border rounded-xl p-4 flex items-center gap-4">
              <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              <div className="w-20 h-14 rounded-lg overflow-hidden bg-secondary shrink-0">
                {slide.image_url ? (
                  <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: slide.bg_color || '#fff7ed' }}>
                    <Image className="h-5 w-5 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{slide.title}</p>
                <p className="text-xs text-muted-foreground truncate">{slide.subtitle}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Link: {slide.button_link} • Order: {slide.order}</p>
              </div>
              <Switch checked={!!slide.is_active} onCheckedChange={() => toggleActive(slide)} />
              <Button variant="ghost" size="icon" onClick={() => openEdit(slide)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(slide.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Banner' : 'New Banner'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Title *</Label>
                <Input className="mt-1" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. New Collection 2026" />
              </div>
              <div className="col-span-2">
                <Label>Subtitle</Label>
                <Input className="mt-1" value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Short description" />
              </div>
              <div>
                <Label>Button Text</Label>
                <Input className="mt-1" value={form.button_text} onChange={e => setForm(f => ({ ...f, button_text: e.target.value }))} placeholder="Shop Now" />
              </div>
              <div>
                <Label>Button Link</Label>
                <Input className="mt-1" value={form.button_link} onChange={e => setForm(f => ({ ...f, button_link: e.target.value }))} placeholder="/products" />
              </div>
              <div>
                <Label>Background Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={form.bg_color || '#fff7ed'} onChange={e => setForm(f => ({ ...f, bg_color: e.target.value }))} className="h-9 w-12 rounded border cursor-pointer" />
                  <Input value={form.bg_color} onChange={e => setForm(f => ({ ...f, bg_color: e.target.value }))} placeholder="#fff7ed" />
                </div>
              </div>
              <div>
                <Label>Display Order</Label>
                <Input className="mt-1" type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} />
              </div>
            </div>

            <div>
              <Label>Banner Image</Label>
              {form.image_url && (
                <img src={form.image_url} alt="preview" className="mt-2 w-full h-32 object-cover rounded-lg border mb-2" />
              )}
              <label className="mt-1 flex items-center justify-center gap-2 h-10 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent transition-colors text-sm text-muted-foreground">
                <Image className="h-4 w-4" />
                {uploading ? 'Uploading...' : 'Upload Image'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
              <p className="text-xs text-muted-foreground mt-1">Or paste URL directly:</p>
              <Input className="mt-1" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." />
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={!!form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Active (visible on homepage)</Label>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave}>{editingId ? 'Update' : 'Create'} Banner</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}