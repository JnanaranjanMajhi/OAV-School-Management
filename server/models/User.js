const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { 
      type: String, 
      required: function() { return this.authProvider === 'local'; }, 
      minlength: 6 
    },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String, default: null },
    role: { type: String, enum: ['admin', 'teacher', 'student'], required: true },
    // Student fields
    class: { type: String, default: '' },
    rollNumber: { type: String, default: '' },
    // Teacher fields
    subject: { type: String, default: '' },
    qualification: { type: String, default: '' },
    experience: { type: String, default: '' },
    achievements: { type: String, default: '' },
    bio: { type: String, default: '' },
    photo: { type: String, default: '' },
    // Common
    phone: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Hash password before findOneAndUpdate
userSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate();
  if (update.password) {
    const salt = await bcrypt.genSalt(10);
    update.password = await bcrypt.hash(update.password, salt);
  }
});
// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Don't return password
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Enforce max 2 admin accounts
userSchema.statics.canAddAdmin = async function () {
  const count = await this.countDocuments({ role: 'admin' });
  return count < 2;
};

// Indexes for performance
userSchema.index({ role: 1, class: 1, isActive: 1 });
userSchema.index({ name: 'text', email: 'text' });

module.exports = mongoose.model('User', userSchema);
