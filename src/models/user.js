const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const saltRounds = 10

const UserSchema = new mongoose.Schema({
  email: {unique: true, type: String, required: true},
  password: {type: String, required: true},
  hasVotedCount: { type: Number, default: false },
},{
  collection: 'users'
});

UserSchema.pre('save', function(next) {
  const user = this;
  if (!user.isModified('password')) return next();
  bcrypt.hash(user.password, saltRounds).then(hash => {
    user.password = hash;
    next();
  }).catch(err => {
    return next(err)
  })
});

module.exports = mongoose.model('User', UserSchema);
