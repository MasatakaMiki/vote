const mongoose = require('mongoose');

const WorkSchema = new mongoose.Schema({
  workId: {unique: true, type: String, required: true},
  workName: {type: String, required: true},
  votedCount: { type: Number, default: 0 },
},{
  collection: 'works'
});

module.exports = mongoose.model('Work', WorkSchema);
