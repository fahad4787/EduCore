const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const User = require('./models/User');
dotenv.config();
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    const adminExists = await User.findOne({ email: 'admin@university.com' });
    if (adminExists) {
      console.log('Admin already exists: admin@university.com / admin123');
      process.exit();
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    const admin = new User({
      name: 'System Admin',
      email: 'admin@university.com',
      password: hashedPassword,
      role: 'Admin'
    });
    await admin.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@university.com');
    console.log('Password: admin123');
    process.exit();
  } catch (err) {
    console.error('Initial error during seeding:', err);
    process.exit(1);
  }
};
seedDatabase();
