const mongoose = require('mongoose');

const schoolInfoSchema = new mongoose.Schema(
  {
    isSingleton: { type: Boolean, default: true, unique: true },
    schoolName: { type: String, default: 'Whispering Pines School' },
    tagline: { type: String, default: 'Whispering Pines School — Excellence in Every Step' },
    overview: { type: String, default: '' },
    principalName: { type: String, default: '' },
    principalMessage: { type: String, default: '' },
    principalPhoto: { type: String, default: '' },
    principalQualification: { type: String, default: '' },
    principalExperience: { type: String, default: '' },
    principalAchievements: { type: String, default: '' },
    principalBio: { type: String, default: '' },
    establishedYear: { type: String, default: '' },
    affiliation: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    phone: { type: String, default: '' },
    altPhone: { type: String, default: '' },
    email: { type: String, default: '' },
    website: { type: String, default: '' },
    mapEmbedUrl: {
      type: String,
      default: '',
    },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SchoolInfo', schoolInfoSchema);
