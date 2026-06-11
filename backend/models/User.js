const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Professor', 'Student'], required: true },
  enrolledCourse: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  dateOfBirth: { type: Date },
  enrollmentNumber: { type: String },
  mobileNumber: { type: String },
  category: { type: String, enum: ['General', 'OBC', 'SC', 'ST'] },
  address: {
    city: { type: String },
    state: { type: String },
    pincode: { type: String }
  },
  year: { type: String },
  admissionDate: { type: Date },
  parentName: { type: String },
  parentContact: { type: String },
  isHandicapped: { type: Boolean, default: false },
  assignedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);
