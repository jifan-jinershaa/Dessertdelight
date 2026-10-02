const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Item price is required'],
    min: 0,
  },
  quantity: {
    type: Number,
    required: [true, 'Item quantity is required'],
    min: 1,
  },
  image: {
    type: String,
    default: '',
  },
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  // Retained for compatibility with databases created by an earlier version
  // of this project, which used a unique `orderNumber` index.
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  customer: {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Customer phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      lowercase: true,
    },
  },
  address: {
    type: String,
    required: [true, 'Delivery address is required'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['Cash on Delivery', 'UPI'],
    default: 'Cash on Delivery',
  },
  items: {
    type: [orderItemSchema],
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'An order must contain at least one item.',
    },
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  delivery: {
    type: Number,
    required: true,
    default: 40,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['Order placed', 'Kitchen confirmed', 'Preparing your desserts', 'Delivery partner assigned', 'Picked up by partner', 'Arriving soon', 'Delivered', 'Cancelled'],
    default: 'Order placed',
  },
  deliveryPartner: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    vehicle: { type: String, default: '' },
    rating: { type: Number, default: null },
  },
  tracking: {
    currentStep: { type: Number, default: 0 },
    estimatedMinutes: { type: Number, default: 35 },
    timeline: [{
      status: String,
      message: String,
      completedAt: Date,
    }],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', orderSchema);
