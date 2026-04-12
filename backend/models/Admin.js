const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['admin', 'super-admin'],
  },
  permissions: [{
    type: String,
    enum: ['manage-products', 'manage-orders', 'manage-users', 'manage-admins', 'view-analytics'],
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockedUntil: Date,
}, {
  timestamps: true,
});

// Virtual id
adminSchema.virtual('id').get(function () { return this._id.toHexString(); });
adminSchema.set('toJSON', { virtuals: true });

// Prevent admin email/username from being exposed in JSON unnecessarily
adminSchema.methods.toJSON = function () {
  const admin = this.toObject();
  delete admin.password;
  return admin;
};

module.exports = mongoose.model('Admin', adminSchema);
