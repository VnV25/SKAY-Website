require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skay';

// Default admin credentials
const DEFAULT_ADMIN = {
  name: 'SKAY Admin',
  username: 'admin', // Unique username
  email: 'admin@skay.com',
  password: 'AdminSKAY@2024', // CHANGE THIS IN PRODUCTION!
  role: 'admin',
};

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: DEFAULT_ADMIN.username });
    if (existingAdmin) {
      console.log('ℹ️  Admin account already exists.');
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      
      if (!process.argv.includes('--force')) {
        console.log('   To re-create, run: node seeds/admin-seed.js --force');
        await mongoose.disconnect();
        return;
      }
      
      console.log('   --force flag detected. Updating admin password...');
      existingAdmin.password = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
      existingAdmin.status = 'active';
      await existingAdmin.save();
      console.log('✅ Admin password updated');
    } else {
      // Create new admin
      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
      const admin = await new Admin({
        name: DEFAULT_ADMIN.name,
        username: DEFAULT_ADMIN.username,
        email: DEFAULT_ADMIN.email,
        password: hashedPassword,
        role: DEFAULT_ADMIN.role,
        status: 'active',
        permissions: [
          'manage-products',
          'manage-orders',
          'manage-users',
          'view-analytics'
        ],
      }).save();

      console.log('✅ Admin account created successfully!');
      console.log(`   Name: ${admin.name}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
    }

    console.log('\n📝 Admin Login Credentials:');
    console.log(`   Username: ${DEFAULT_ADMIN.username}`);
    console.log(`   Password: ${DEFAULT_ADMIN.password}`);
    console.log('\n⚠️  IMPORTANT: Change this password in production!');

  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

seedAdmin();
