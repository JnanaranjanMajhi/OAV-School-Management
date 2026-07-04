const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['email', 'phone'],
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // 10 minutes TTL
  },
});

otpSchema.index({ identifier: 1, type: 1 });

module.exports = mongoose.model('Otp', otpSchema);
