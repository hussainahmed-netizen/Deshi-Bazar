import { db } from '@/lib/db';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Store, Truck, CreditCard, Bell, Save, Palette, Upload } from 'lucide-react';
import { toast } from 'sonner';

const TABS = [
  { key: 'general', label: 'General', icon: Store },
  { key: 'branding', label: 'Branding', icon: Palette },
  { key: 'shipping', label: 'Shipping', icon: Truck },
  { key: 'payments', label: 'Payments', icon: CreditCard },
  { key: 'notifications', label: 'Notifications', icon: Bell },
];

const DEFAULTS = {
  store_logo_url: '',
  store_favicon_url: '',
  store_tagline: 'Your one-stop fashion destination',
  store_description: '',
  primary_color: '#f97316',
  store_name: 'DeshiBazar',
  store_email: '',
  store_phone: '',
  store_address: '',
  store_city: 'Dhaka',
  currency: 'BDT',
  free_shipping_min: '999',
  dhaka_shipping: '60',
  outside_dhaka_shipping: '120',
  cod_enabled: 'true',
  bkash_enabled: 'true',
  nagad_enabled: 'true',
  card_enabled: 'false',
  order_notifications: 'true',
  low_stock_threshold: '5',
};

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    db.entities.StoreSettings.list('-created_date', 100).then(data => {
      const map = { ...DEFAULTS };
      data.forEach(s => { map[s.key] = s.value; });
      setSettings(map);
      setLoading(false);
    });
  }, []);

  const set = (key, value) => setSettings(s => ({ ...s, [key]: value }));

  const saveAll = async () => {
    setSaving(true);
    const existing = await db.entities.StoreSettings.list('-created_date', 100);
    const existingMap = {};
    existing.forEach(s => { existingMap[s.key] = s.id; });

    await Promise.all(Object.entries(settings).map(([key, value]) => {
      if (existingMap[key]) {
        return db.entities.StoreSettings.update(existingMap[key], { key, value: String(value) });
      } else {
        return db.entities.StoreSettings.create({ key, value: String(value), group: activeTab });
      }
    }));
    setSaving(false);
    toast.success('Settings saved!');
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Store Settings</h1>
        <Button onClick={saveAll} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tab nav */}
        <div className="md:w-48 flex md:flex-col gap-1">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
            >
              <tab.icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 bg-card border rounded-xl p-5 space-y-4">
          {activeTab === 'branding' && (
            <>
              <h2 className="font-semibold text-lg border-b pb-2">Branding & Logo</h2>
              <div className="space-y-5">
                <div>
                  <Label>Store Logo URL</Label>
                  <p className="text-xs text-muted-foreground mb-1">Paste a URL or upload an image for your logo</p>
                  {settings.store_logo_url && (
                    <div className="mb-2 p-3 border rounded-lg bg-secondary/20 inline-flex">
                      <img src={settings.store_logo_url} alt="Logo preview" className="h-12 object-contain" />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input className="mt-1 flex-1" value={settings.store_logo_url} onChange={e => set('store_logo_url', e.target.value)} placeholder="https://..." />
                    <label className="mt-1 flex items-center gap-1 px-3 py-1 border rounded-md cursor-pointer hover:bg-accent text-sm text-muted-foreground shrink-0">
                      <Upload className="h-4 w-4" /> Upload
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0]; if (!file) return;
                        const { file_url } = await db.integrations.Core.UploadFile({ file });
                        set('store_logo_url', file_url);
                      }} />
                    </label>
                  </div>
                </div>
                <div>
                  <Label>Favicon URL</Label>
                  <p className="text-xs text-muted-foreground mb-1">Small icon shown in browser tab (32x32px recommended)</p>
                  <Input className="mt-1" value={settings.store_favicon_url} onChange={e => set('store_favicon_url', e.target.value)} placeholder="https://..." />
                </div>
                <div><Label>Store Tagline</Label><Input className="mt-1" value={settings.store_tagline} onChange={e => set('store_tagline', e.target.value)} placeholder="Your one-stop fashion destination" /></div>
                <div><Label>Store Description</Label><Textarea className="mt-1" value={settings.store_description} onChange={e => set('store_description', e.target.value)} rows={3} placeholder="Brief description of your store..." /></div>
              </div>
            </>
          )}

          {activeTab === 'general' && (
            <>
              <h2 className="font-semibold text-lg border-b pb-2">General Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Store Name</Label><Input className="mt-1" value={settings.store_name} onChange={e => set('store_name', e.target.value)} /></div>
                <div><Label>Store Email</Label><Input className="mt-1" type="email" value={settings.store_email} onChange={e => set('store_email', e.target.value)} /></div>
                <div><Label>Store Phone</Label><Input className="mt-1" value={settings.store_phone} onChange={e => set('store_phone', e.target.value)} /></div>
                <div><Label>Currency</Label>
                  <Select value={settings.currency} onValueChange={v => set('currency', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BDT">BDT (৳)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2"><Label>Store Address</Label><Textarea className="mt-1" value={settings.store_address} onChange={e => set('store_address', e.target.value)} rows={2} /></div>
                <div><Label>City</Label><Input className="mt-1" value={settings.store_city} onChange={e => set('store_city', e.target.value)} /></div>
                <div><Label>Low Stock Alert Threshold</Label><Input className="mt-1" type="number" value={settings.low_stock_threshold} onChange={e => set('low_stock_threshold', e.target.value)} /></div>
              </div>
            </>
          )}

          {activeTab === 'shipping' && (
            <>
              <h2 className="font-semibold text-lg border-b pb-2">Shipping Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><Label>Free Shipping on Orders Over (৳)</Label><Input className="mt-1" type="number" value={settings.free_shipping_min} onChange={e => set('free_shipping_min', e.target.value)} /></div>
                <div><Label>Dhaka Delivery Fee (৳)</Label><Input className="mt-1" type="number" value={settings.dhaka_shipping} onChange={e => set('dhaka_shipping', e.target.value)} /></div>
                <div><Label>Outside Dhaka Delivery Fee (৳)</Label><Input className="mt-1" type="number" value={settings.outside_dhaka_shipping} onChange={e => set('outside_dhaka_shipping', e.target.value)} /></div>
              </div>
            </>
          )}

          {activeTab === 'payments' && (
            <>
              <h2 className="font-semibold text-lg border-b pb-2">Payment Methods</h2>
              <div className="space-y-4">
                {[
                  { key: 'cod_enabled', label: 'Cash on Delivery', desc: 'Pay when the order is delivered' },
                  { key: 'bkash_enabled', label: 'bKash', desc: 'Mobile banking payment' },
                  { key: 'nagad_enabled', label: 'Nagad', desc: 'Mobile banking payment' },
                  { key: 'card_enabled', label: 'Credit/Debit Card', desc: 'Online card payment' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{label}</p>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                    <Switch checked={settings[key] === 'true'} onCheckedChange={v => set(key, v ? 'true' : 'false')} />
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'notifications' && (
            <>
              <h2 className="font-semibold text-lg border-b pb-2">Notification Settings</h2>
              <div className="space-y-4">
                {[
                  { key: 'order_notifications', label: 'New Order Notifications', desc: 'Get notified when a new order is placed' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{label}</p>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                    <Switch checked={settings[key] === 'true'} onCheckedChange={v => set(key, v ? 'true' : 'false')} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}