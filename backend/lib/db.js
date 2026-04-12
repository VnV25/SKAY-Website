// Supabase Database Query Functions
// This replaces mongoose models with direct Supabase queries

const { supabase } = require('./supabase');

// ════════════════════════════════════════════════════════
// PROFILES (Users)
// ════════════════════════════════════════════════════════

async function createProfile(userId, { email, full_name, avatar_url = null, phone = null, company = null }) {
  const insertData = { id: userId, email, full_name, avatar_url };
  
  // Only include phone and company if they have values
  if (phone) insertData.phone = phone;
  if (company) insertData.company = company;
  
  const { data, error } = await supabase
    .from('profiles')
    .insert([insertData])
    .select();
  if (error) throw error;
  return data[0];
}

async function getProfileById(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    if (error.code === '42P01') {
      console.error(`🚨 Table "profiles" does not exist! Please run SUPABASE_DATABASE_SCHEMA.sql in Supabase SQL Editor.`);
      throw new Error('Database schema not initialized. Please run SUPABASE_DATABASE_SCHEMA.sql in Supabase Dashboard.');
    }
    console.error(`[DB] Error fetching profile for ${userId}:`, error.message);
    throw error;
  }
  return data;
}

async function getProfileByEmail(email) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data || null;
}

async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function incrementLoginCount(userId) {
  // Try to increment login count - ignore errors if columns don't exist
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        login_count: (await supabase.from('profiles').select('login_count').eq('id', userId).single()).data?.login_count + 1 || 1,
        last_login: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      // Silently ignore if columns don't exist
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

// ════════════════════════════════════════════════════════
// ORDERS
// ════════════════════════════════════════════════════════

async function createOrder(userId, { items, total, status = 'pending' }) {
  const { data, error } = await supabase
    .from('orders')
    .insert([{ user_id: userId, items, total, status }])
    .select();
  if (error) throw error;
  return data[0];
}

async function getOrdersByUserId(userId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('order_date', { ascending: false });
  if (error) throw error;
  return data;
}

async function getOrderById(orderId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  if (error) throw error;
  return data;
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

async function getAllOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('order_date', { ascending: false });
  if (error) throw error;
  return data;
}

// ════════════════════════════════════════════════════════
// CARTS
// ════════════════════════════════════════════════════════

async function getOrCreateCart(userId) {
  let { data: cart, error: getError } = await supabase
    .from('carts')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (getError && getError.code === 'PGRST116') {
    // Cart doesn't exist, create it
    const { data: newCart, error: createError } = await supabase
      .from('carts')
      .insert([{ user_id: userId, items: [], total: 0 }])
      .select()
      .single();
    if (createError) throw createError;
    return newCart;
  }

  if (getError) throw getError;
  return cart;
}

async function updateCart(userId, { items, total }) {
  const { data, error } = await supabase
    .from('carts')
    .update({ items, total, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ════════════════════════════════════════════════════════
// WISHLISTS
// ════════════════════════════════════════════════════════

async function getOrCreateWishlist(userId) {
  let { data: wishlist, error: getError } = await supabase
    .from('wishlists')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (getError && getError.code === 'PGRST116') {
    // Wishlist doesn't exist, create it
    const { data: newWishlist, error: createError } = await supabase
      .from('wishlists')
      .insert([{ user_id: userId, items: [] }])
      .select()
      .single();
    if (createError) throw createError;
    return newWishlist;
  }

  if (getError) throw getError;
  return wishlist;
}

async function updateWishlist(userId, items) {
  const { data, error } = await supabase
    .from('wishlists')
    .update({ items, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ════════════════════════════════════════════════════════
// CONTACTS
// ════════════════════════════════════════════════════════

async function createContact({ name, email, phone = null, message, status = 'new' }) {
  const { data, error } = await supabase
    .from('contacts')
    .insert([{ name, email, phone, message, status }])
    .select();
  if (error) throw error;
  return data[0];
}

async function getAllContacts() {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function updateContact(contactId, updates) {
  const { data, error } = await supabase
    .from('contacts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', contactId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ════════════════════════════════════════════════════════
// PRODUCTS
// ════════════════════════════════════════════════════════

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

// ════════════════════════════════════════════════════════
// ADMINS (stored in profiles with role='admin')
// ════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════
// ADMINS (stored in profiles with role='admin')
// ════════════════════════════════════════════════════════

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
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .eq('role', 'admin')
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    if (error.code === '42P01') {
      console.error(`🚨 Table "profiles" does not exist! Please run SUPABASE_DATABASE_SCHEMA.sql in Supabase SQL Editor.`);
      throw new Error('Database schema not initialized. Please run SUPABASE_DATABASE_SCHEMA.sql in Supabase Dashboard.');
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
