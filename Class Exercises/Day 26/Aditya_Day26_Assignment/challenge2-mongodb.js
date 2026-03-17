require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/skillsphere')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => { throw err; });

// --- Models ---
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
});

const enrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  courseName: String,
  enrolledAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

// --- Seed + Fetch ---
async function run() {
  // Create a user
  const user = await User.create({ name: 'Alice', email: 'alice@skillsphere.com' });
  console.log('✅ User created:', user.name);

  // Create an enrollment
  await Enrollment.create({ user: user._id, courseName: 'MongoDB Mastery' });
  console.log('✅ Enrollment created');

  // Fetch enrollments with user details
  const enrollments = await Enrollment.find().populate('user', 'name email');
  console.log('\n📋 Enrollment Details:');
  enrollments.forEach(e => {
    console.log(`  - ${e.user.name} (${e.user.email}) enrolled in "${e.courseName}"`);
  });

  await mongoose.disconnect();
}

run();