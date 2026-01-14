const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Schema (simplified version)
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  bookmarkedBooths: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booth'
  }],
  visitedBooths: [{
    boothId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booth'
    },
    visitedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Admin credentials
    const adminData = {
      name: 'Admin User',
      email: '9656550933@connectplus.com',
      password: '123456',
      role: 'admin'
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('\n⚠️  Admin user already exists!');
      console.log('Email:', adminData.email);
      
      // Update password if needed
      existingAdmin.password = adminData.password;
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('✅ Admin password and role updated');
    } else {
      // Create new admin user
      const admin = new User(adminData);
      await admin.save();
      console.log('\n✅ Admin user created successfully!');
    }

    // Display admin credentials
    console.log('\n' + '='.repeat(50));
    console.log('📋 ADMIN CREDENTIALS');
    console.log('='.repeat(50));
    console.log('Email/Username: 9656550933@connectplus.com');
    console.log('Phone:          9656550933');
    console.log('Password:       123456');
    console.log('Role:           admin');
    console.log('='.repeat(50));
    console.log('\n💡 Use these credentials to login to the admin panel');
    console.log('🔗 Admin Dashboard: http://localhost:3000/admin');
    console.log('='.repeat(50) + '\n');

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

// Run the script
createAdmin();
