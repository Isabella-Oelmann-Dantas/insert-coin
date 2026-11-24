const { Schema, model } = require('mongoose');

const VIP_THRESHOLD = 300;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  totalSpent: { type: Number, default: 0 },
});

// Player Gold (VIP) = já gastou R$ 300 ou mais em compras
userSchema.virtual('isVip').get(function () {
  return this.totalSpent >= VIP_THRESHOLD;
});

userSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => { delete ret.password; delete ret.id; return ret; },
});

module.exports = model('User', userSchema);
module.exports.VIP_THRESHOLD = VIP_THRESHOLD;