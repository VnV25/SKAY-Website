const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String, required: true, trim: true,
  },
  description: {
    type: String, required: true,
  },
  price: {
    type: Number, required: true, min: 0,
  },
  originalPrice: {
    type: Number, min: 0,
  },
  category: {
    type: String,
    required: true,
    enum: ['t-shirts', 'hoodies', 'caps', 'mugs', 'stickers', 'custom'],
  },
  images: [{
    type: String,
  }],
  // Convenience alias — first image URL
  image: {
    type: String,
    default: '',
  },
  sizes: [{
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'],
  }],
  colors: [{
    name: String,
    hex:  String,
  }],
  stock: {
    type: Number, required: true, min: 0, default: 0,
  },
  featured: {
    type: Boolean, default: false,
  },
  trending: {
    type: Boolean, default: false,
  },
  discount: {
    type: Number, min: 0, max: 100, default: 0,
  },
  rating: {
    type: Number, min: 0, max: 5, default: 4.5,
  },
  reviews: {
    type: Number, default: 0,
  },
  tags: [String],
}, {
  timestamps: true,
});

// Virtual: id alias for _id
productSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
productSchema.set('toJSON', { virtuals: true });

// Pre-save: sync image from images array
productSchema.pre('save', function (next) {
  if (this.images?.length && !this.image) {
    this.image = this.images[0];
  }
  if (this.image && !this.images?.length) {
    this.images = [this.image];
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);