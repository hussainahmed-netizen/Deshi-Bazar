import { supabase } from './supabaseClient';

// Auth helpers
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Cart callbacks registry for real-time updates
const cartCallbacks = new Set();

export const onCartChange = (callback) => {
  cartCallbacks.add(callback);
  return () => cartCallbacks.delete(callback);
};

export const notifyCartChange = (data) => {
  cartCallbacks.forEach(cb => cb(data));
};

// Generic CRUD operations mimicking legacy platform entities API
export const createEntityService = (tableName) => ({
  // List all items with optional ordering and limit
  async list(orderBy = '-created_at', limit = 100) {
    const ascending = !orderBy.startsWith('-');
    const column = orderBy.replace(/^-/, '');
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order(column, { ascending })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  // Filter items with filters
  async filter(filters = {}, orderBy = '-created_at', limit = 100) {
    const ascending = !orderBy.startsWith('-');
    const column = orderBy.replace(/^-/, '');
    
    let query = supabase
      .from(tableName)
      .select('*')
      .order(column, { ascending })
      .limit(limit);
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get single item by ID
  async get(id) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new item with optional callback
  async create(item, onSuccess) {
    const { data, error } = await supabase
      .from(tableName)
      .insert(item)
      .select()
      .single();
    
    if (error) throw error;
    
    // Trigger callback immediately if provided
    if (onSuccess && typeof onSuccess === 'function') {
      onSuccess(data);
    }
    
    // Notify cart listeners if this is a cart item
    if (tableName === 'cart_items') {
      notifyCartChange({ action: 'create', item: data });
    }
    
    return data;
  },

  // Update item by ID with optional callback
  async update(id, updates, onSuccess) {
    const { data, error } = await supabase
      .from(tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Trigger callback immediately if provided
    if (onSuccess && typeof onSuccess === 'function') {
      onSuccess(data);
    }
    
    // Notify cart listeners if this is a cart item
    if (tableName === 'cart_items') {
      notifyCartChange({ action: 'update', item: data });
    }
    
    return data;
  },

  // Delete item by ID
  async delete(id) {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Subscribe to changes (mock implementation to prevent crashes)
  subscribe(callback) {
    // TODO: Implement real-time subscriptions with Supabase Realtime if needed
    console.warn(`subscribe() called on ${tableName} - not implemented`);
    // Return mock subscription object with unsubscribe method
    return () => {
      // Mock unsubscribe function
    };
  },
});

// Create entity services for each table
export const entities = {
  Coupon: createEntityService('coupons'),
  Product: createEntityService('products'),
  CartItem: createEntityService('cart_items'),
  Category: createEntityService('categories'),
  Order: createEntityService('orders'),
  Banner: createEntityService('banners'),
  HeroSlide: createEntityService('hero_slides'),
  User: createEntityService('users'),
  Review: createEntityService('reviews'),
  StoreSettings: createEntityService('store_settings'),
};

// File upload helper (stores to Supabase Storage)
export const integrations = {
  Core: {
    async UploadFile({ file }) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);

      return { file_url: publicUrl };
    },
  },
};

// Auth service mimicking legacy platform auth API
export const auth = {
  async me() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    // Map Supabase user to expected format with metadata
    return {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email,
      role: user.user_metadata?.role || user.app_metadata?.role || 'user',
      admin_permissions: user.user_metadata?.admin_permissions || user.app_metadata?.admin_permissions || [],
      ...user,
    };
  },

  async isAuthenticated() {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },

  async logout(redirectUrl) {
    await supabase.auth.signOut();
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  },

  async redirectToLogin(returnUrl) {
    // Store return URL and trigger Google OAuth
    if (returnUrl) {
      localStorage.setItem('auth_return_url', returnUrl);
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  },
};

// Export db object with legacy platform compatible structure
export const db = {
  auth,
  entities,
  integrations,
};

export default db;
