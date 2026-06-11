const mongoose = require('mongoose');
const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  audience: { type: String, enum: ['All', 'Admin', 'Professor', 'Student'], default: 'All' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
module.exports = mongoose.model('Notice', noticeSchema);
