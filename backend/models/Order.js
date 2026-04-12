const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User',
  },
  // Guest info (when no user account)
  guestName:  String,
  guestEmail: String,
  guestPhone: String,

  items: [{
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name:     String,     // snapshot at order time
    price:    { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    size:     String,
    color:    String,
    image:    String,
  }],

  totalAmount: { type: Number, required: true, min: 0 },

  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },

  shippingAddress: {
    street: String, city: String,
    state: String,  zipCode: String, country: String,
  },

  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'bank_transfer', 'cod', 'other'],
    default: 'other',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },

  orderNotes: String,
}, {
  timestamps: true,
});

orderSchema.virtual('id').get(function () { return this._id.toHexString(); });
orderSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);