import { db } from '@/lib/db';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Search, Upload, X, ImageIcon, ZoomIn } from 'lucide-react';
import { useState as useStateAlias } from 'react';
import { toast } from 'sonner';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({
    name: '', description: '', price: '', original_price: '', category: 'mens',
    sizes: '', colors: '', stock: '', status: 'active',
    is_featured: false, is_flash_deal: false, images: '',
  });

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    const all = await db.entities.Product.list('-created_date', 200);
    setProducts(all);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', original_price: '', category: 'mens', sizes: '', colors: '', stock: '', status: 'active', is_featured: false, is_flash_deal: false, images: '' });
    setEditingProduct(null);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      original_price: product.original_price?.toString() || '',
      category: product.category || 'mens',
      sizes: product.sizes?.join(', ') || '',
      colors: product.colors?.join(', ') || '',
      stock: product.stock?.toString() || '',
      status: product.status || 'active',
      is_featured: product.is_featured || false,
      is_flash_deal: product.is_flash_deal || false,
      images: product.images?.join('\n') || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast.error('Name and price are required');
      return;
    }

    const data = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      category: form.category,
      sizes: form.sizes ? form.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
      colors: form.colors ? form.colors.split(',').map(s => s.trim()).filter(Boolean) : [],
      stock: form.stock ? parseInt(form.stock) : 0,
      status: form.status,
      is_featured: form.is_featured,
      is_flash_deal: form.is_flash_deal,
      images: form.images ? form.images.split('\n').map(s => s.trim()).filter(Boolean) : [],
    };

    if (editingProduct) {
      await db.entities.Product.update(editingProduct.id, data);
      toast.success('Product updated');
    } else {
      await db.entities.Product.create(data);
      toast.success('Product created');
    }

    setDialogOpen(false);
    resetForm();
    loadProducts();
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    await db.entities.Product.delete(id);
    toast.success('Product deleted');
    loadProducts();
  };

  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadImageFile = async (file) => {
    if (!file.type.startsWith('image/')) return;
    setUploadingImage(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setForm(prev => ({
      ...prev,
      images: prev.images ? prev.images + '\n' + file_url : file_url
    }));
    setUploadingImage(false);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) await uploadImageFile(file);
    e.target.value = '';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    for (const file of files) await uploadImageFile(file);
  };

  const removeImage = (index) => {
    const imgs = form.images.split('\n').map(s => s.trim()).filter(Boolean);
    imgs.splice(index, 1);
    setForm(prev => ({ ...prev, images: imgs.join('\n') }));
  };

  const getImages = () => form.images.split('\n').map(s => s.trim()).filter(Boolean);

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Products ({products.length})</h1>
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Product Name *</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Price (৳) *</Label>
                  <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                </div>
                <div>
                  <Label>Original Price (৳)</Label>
                  <Input type="number" value={form.original_price} onChange={e => setForm({ ...form, original_price: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mens">Men's</SelectItem>
                      <SelectItem value="womens">Women's</SelectItem>
                      <SelectItem value="kids">Kids</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                      <SelectItem value="footwear">Footwear</SelectItem>
                      <SelectItem value="traditional">Traditional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Stock</Label>
                  <Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Sizes (comma separated)</Label>
                <Input value={form.sizes} onChange={e => setForm({ ...form, sizes: e.target.value })} placeholder="S, M, L, XL" />
              </div>
              <div>
                <Label>Colors (comma separated)</Label>
                <Input value={form.colors} onChange={e => setForm({ ...form, colors: e.target.value })} placeholder="Black, White, Red" />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_featured} onCheckedChange={v => setForm({ ...form, is_featured: v })} />
                  <Label>Featured</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_flash_deal} onCheckedChange={v => setForm({ ...form, is_flash_deal: v })} />
                  <Label>Flash Deal</Label>
                </div>
              </div>
              <div>
                <Label>Product Images</Label>
                <p className="text-xs text-muted-foreground mb-2">First image will be the main image</p>

                {/* Drag & drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                    dragOver ? 'border-primary bg-accent/50' : 'border-border hover:border-primary/50 hover:bg-accent/20'
                  }`}
                  onClick={() => document.getElementById('img-upload-input').click()}
                >
                  {uploadingImage ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                      <p className="text-xs text-muted-foreground">Uploading...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-sm font-medium">Drag & drop images here</p>
                      <p className="text-xs text-muted-foreground">or click to browse from device</p>
                    </div>
                  )}
                  <input
                    id="img-upload-input"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>

                {/* Image previews */}
                {getImages().length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {getImages().map((url, i) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden border aspect-square">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {i === 0 && (
                          <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Main
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add more images button */}
                {getImages().length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full gap-2 text-xs"
                    onClick={() => document.getElementById('img-upload-input').click()}
                    disabled={uploadingImage}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add More Images
                  </Button>
                )}
              </div>
              <Button className="w-full" onClick={handleSave}>{editingProduct ? 'Update Product' : 'Create Product'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxUrl(null)}>
          <button className="absolute top-4 right-4 text-white bg-white/20 rounded-full p-2 hover:bg-white/30" onClick={() => setLightboxUrl(null)}><X className="h-5 w-5" /></button>
          <img src={lightboxUrl} alt="" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 sm:hidden">
        {filtered.map(product => (
          <div key={product.id} className="bg-card border rounded-xl p-3 flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg bg-secondary/30 overflow-hidden shrink-0 cursor-pointer" onClick={() => product.images?.[0] && setLightboxUrl(product.images[0])}>
              {product.images?.[0] && <img src={product.images[0]} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{product.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{product.category} • Stock: {product.stock || 0}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold text-primary text-sm">৳{product.price?.toLocaleString()}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  product.status === 'active' ? 'bg-green-100 text-green-700' :
                  product.status === 'inactive' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'
                }`}>{product.status}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}><Pencil className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteProduct(product.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-card border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/30">
                <th className="text-left p-3 font-medium">Product</th>
                <th className="text-left p-3 font-medium">Category</th>
                <th className="text-left p-3 font-medium">Price</th>
                <th className="text-left p-3 font-medium">Stock</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => (
                <tr key={product.id} className="border-b last:border-0 hover:bg-accent/30">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary/30 overflow-hidden shrink-0 cursor-pointer relative group" onClick={() => product.images?.[0] && setLightboxUrl(product.images[0])}>
                        {product.images?.[0] ? <><img src={product.images[0]} alt="" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><ZoomIn className="h-4 w-4 text-white" /></div></> : null}
                      </div>
                      <span className="font-medium truncate max-w-[200px]">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground capitalize">{product.category}</td>
                  <td className="p-3 font-medium">৳{product.price?.toLocaleString()}</td>
                  <td className="p-3">{product.stock || 0}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      product.status === 'active' ? 'bg-green-100 text-green-700' :
                      product.status === 'inactive' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'
                    }`}>{product.status}</span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteProduct(product.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}