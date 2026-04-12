const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String, required: true, trim: true,
  },
  email: {
    type: String, required: true, unique: true,
    lowercase: true, trim: true,
  },
  password: {
    // Not required when using Google auth (googleId present)
    type: String, minlength: 6,
  },
  googleId: {
    type: String, unique: true, sparse: true,
  },
  role: {
    type: String, enum: ['user', 'admin'], default: 'user',
  },
  avatar: {
    type: String, default: '',
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'Product',
  }],
  phone: String,
  company: String,
  lastLogin: Date,
  loginCount: {
    type: Number, default: 0,
  },
  status: {
    type: String, enum: ['active', 'inactive'], default: 'active',
  },
}, {
  timestamps: true,
});

// Virtual id
userSchema.virtual('id').get(function () { return this._id.toHexString(); });
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);