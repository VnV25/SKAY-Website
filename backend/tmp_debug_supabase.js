const { supabase } = require('./lib/supabase');

(async () => {
  const profile = await supabase.from('profiles').select('id,email,role,login_count').limit(5);
  console.log('profiles', profile.error ? profile.error : profile.data);

  const orders = await supabase.from('orders').select('id,user_id,status,total').limit(5);
  console.log('orders', orders.error ? orders.error : orders.data);

  const contacts = await supabase.from('contacts').select('id,name,email,status').limit(5);
  console.log('contacts', contacts.error ? contacts.error : contacts.data);

  const totalOrders = await supabase.from('orders').select('id', { count: 'exact', head: true });
  console.log('totalOrders', totalOrders.count, totalOrders.error ? totalOrders.error : null);

  const totalContacts = await supabase.from('contacts').select('id', { count: 'exact', head: true });
  console.log('totalContacts', totalContacts.count, totalContacts.error ? totalContacts.error : null);

  const admins = await supabase.from('profiles').select('id,email,role').eq('role', 'admin').limit(5);
  console.log('admins', admins.error ? admins.error : admins.data);
})();