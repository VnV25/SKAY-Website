// Supabase Database Query Functions
// This replaces mongoose models with direct Supabase queries

const { supabaseAdmin } = require('./supabase');
const supabase = supabaseAdmin;

// ════════════════════════════════════════════════════════════════════════════════
// PROFILES (Users)
// ════════════════════════════════════════════════════════════════════════════════

async function createProfile(userId, { email, full_name, avatar_url = null, phone = null, company = null }) {
  const insertData = { id: userId, email, full_name, avatar_url };

  // Only include phone and company if they have values
  if (phone) insertData.phone = phone;
  if (company) insertData.company = company;

  const { data, error } = await supabase
    .from('profiles')
    .upsert([insertData], { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function getProfileById(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    if (error.code === '42P01') {
      console.error(
        `🚨 Table "profiles" does not exist! Please run SUPABASE_DATABASE_SCHEMA.sql in Supabase SQL Editor.`,
      );
      throw new Error(
        'Database schema not initialized. Please run SUPABASE_DATABASE_SCHEMA.sql in Supabase Dashboard.',
      );
    }
    console.error(`[DB] Error fetching profile for ${userId}:`, error.message);
    throw error;
  }
  return data;
}

async function getProfileByEmail(email) {
  const { data, error } = await supabase.from('profiles').select('*').eq('email', email.toLowerCase()).single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data || null;
}

async function updateProfile(userId, updates) {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
  if (error) throw error;
  return data;
}

async function incrementLoginCount(userId) {
  try {
    const profile = await getProfileById(userId);
    if (!profile) return null;

    const nextLoginCount = (profile.login_count || 0) + 1;
    const { data, error } = await supabase
      .from('profiles')
      .update({
        login_count: nextLoginCount,
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
        return null;
      }
      throw error;
    }
    return data;
  } catch (err) {
    // Silently ignore if columns don't exist
    if (err.message && (err.message.includes('does not exist') || err.message.includes('schema cache'))) {
      return null;
    }
    throw err;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// ORDERS
// ════════════════════════════════════════════════════════════════════════════════

async function createOrder(userId, { items, total, status = 'pending' }) {
  const { data, error } = await supabase.from('orders').insert([{ user_id: userId, items, total, status }]).select();
  if (error) throw error;
  return data[0];
}

async function getOrdersByUserId(userId) {
  const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).order('order_date', {
    ascending: false,
  });
  if (error) throw error;
  return data;
}

async function getOrderById(orderId) {
  const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

async function updateOrder(orderId, updates) {
  const { data, error } = await supabase
    .from('orders')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function getAllOrders({ status, limit = 50, offset = 0 } = {}) {
  let query = supabase.from('orders').select('*', { count: 'exact' });
  if (status) query = query.eq('status', status);
  const { data, count, error } = await query
    .order('order_date', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return { orders: data, total: count };
}

// ════════════════════════════════════════════════════════════════════════════════
// CARTS
// ════════════════════════════════════════════════════════════════════════════════

async function getOrCreateCart(userId) {
  const { data, error } = await supabase.from('carts').select('*').eq('user_id', userId).single();
  if (error && error.code !== 'PGRST116') throw error;
  if (data) return data;

  const { data: newCart, error: insertError } = await supabase
    .from('carts')
    .insert([{ user_id: userId, items: [], total: 0 }])
    .select()
    .single();
  if (insertError) throw insertError;
  return newCart;
}

async function updateCart(userId, updates) {
  const { data, error } = await supabase.from('carts').update(updates).eq('user_id', userId).select().single();
  if (error) throw error;
  return data;
}

// ════════════════════════════════════════════════════════════════════════════════
// WISHLISTS
// ════════════════════════════════════════════════════════════════════════════════

async function getOrCreateWishlist(userId) {
  const { data, error } = await supabase.from('wishlists').select('*').eq('user_id', userId).single();
  if (error && error.code !== 'PGRST116') throw error;
  if (data) return data;

  const { data: newWishlist, error: insertError } = await supabase
    .from('wishlists')
    .insert([{ user_id: userId, items: [] }])
    .select()
    .single();
  if (insertError) throw insertError;
  return newWishlist;
}

async function updateWishlist(userId, updates) {
  const { data, error } = await supabase.from('wishlists').update(updates).eq('user_id', userId).select().single();
  if (error) throw error;
  return data;
}

// ════════════════════════════════════════════════════════════════════════════════
// CONTACTS
// ════════════════════════════════════════════════════════════════════════════════

async function createContact({ name, email, message }) {
  const { data, error } = await supabase
    .from('contacts')
    .insert([{ name, email, message, status: 'new' }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function getAllContacts() {
  const { data, error } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function updateContact(contactId, updates) {
  const { data, error } = await supabase.from('contacts').update(updates).eq('id', contactId).select().single();
  if (error) throw error;
  return data;
}

// ════════════════════════════════════════════════════════════════════════════════
// PRODUCTS
// ════════════════════════════════════════════════════════════════════════════════

async function getAllProducts({ category, featured, trending, search, limit = 50, offset = 0 }) {
  let query = supabase.from('products').select('*', { count: 'exact' });

  if (category && category !== 'all') query = query.eq('category', category);
  if (featured === true) query = query.eq('featured', true);
  if (trending === true) query = query.eq('trending', true);
  if (search) query = query.ilike('name', `%${search}%`);

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { products: data, total: count };
}

async function getProductById(id) {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

async function createProduct(productData) {
  const { data, error } = await supabase.from('products').insert([productData]).select().single();
  if (error) throw error;
  return data;
}

async function updateProduct(id, updates) {
  const { data, error } = await supabase
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// ════════════════════════════════════════════════════════════════════════════════
// ADMINS (stored in profiles with role='admin')
// ════════════════════════════════════════════════════════════════════════════════

async function createAdmin(userId, { email, full_name, permissions = [] }) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'admin', updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function getAdminById(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).eq('role', 'admin').single();
  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    if (error.code === '42P01') {
      console.error(
        `🚨 Table "profiles" does not exist! Please run SUPABASE_DATABASE_SCHEMA.sql in Supabase SQL Editor.`,
      );
      throw new Error(
        'Database schema not initialized. Please run SUPABASE_DATABASE_SCHEMA.sql in Supabase Dashboard.',
      );
    }
    throw error;
  }
  return data;
}

async function isAdmin(userId) {
  const admin = await getAdminById(userId);
  return !!admin;
}

module.exports = {
  // Profiles
  createProfile,
  getProfileById,
  getProfileByEmail,
  updateProfile,
  incrementLoginCount,
  // Orders
  createOrder,
  getOrdersByUserId,
  getOrderById,
  updateOrder,
  getAllOrders,
  // Carts
  getOrCreateCart,
  updateCart,
  // Wishlists
  getOrCreateWishlist,
  updateWishlist,
  // Contacts
  createContact,
  getAllContacts,
  updateContact,
  // Products
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  // Admins
  createAdmin,
  getAdminById,
  isAdmin,
};

