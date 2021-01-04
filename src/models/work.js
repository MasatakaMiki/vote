const mongoose = require('mongoose');

const WorkSchema = new mongoose.Schema({
  title: String,
  votes: { type: Number, default: 0 },
},{
  collection: 'works'
});

module.exports = mongoose.model('Work', WorkSchema);
