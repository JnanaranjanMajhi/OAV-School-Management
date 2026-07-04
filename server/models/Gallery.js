const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    caption: { type: String, default: '' },
    image: { type: String, required: true },
    category: { type: String, default: '' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Gallery', gallerySchema);
