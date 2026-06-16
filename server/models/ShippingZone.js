const mongoose = require('mongoose');

const shippingZoneSchema = new mongoose.Schema(
  {
    governorate: {
      ar: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    price: {
      type: Number,
      required: [true, 'Shipping price is required'],
      min: 0,
    },
    estimatedDays: {
      min: { type: Number, required: true, min: 1 },
      max: { type: Number, required: true, min: 1 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ShippingZone', shippingZoneSchema);
