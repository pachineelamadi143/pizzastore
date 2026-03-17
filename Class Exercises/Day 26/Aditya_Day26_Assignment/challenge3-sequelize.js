require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// Connect (using SQLite for simplicity — swap for MySQL if needed)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './skillsphere.sqlite',
  logging: false,
});

// --- Models ---
const Instructor = sequelize.define('Instructor', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true },
});

const Course = sequelize.define('Course', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
});

// --- Relationships ---
Instructor.hasMany(Course, { foreignKey: 'instructorId' });
Course.belongsTo(Instructor, { foreignKey: 'instructorId' });

// --- Seed + Query ---
async function run() {
  await sequelize.sync({ force: true }); // creates fresh tables
  console.log('✅ Tables synced');

  // Create instructor
  const instructor = await Instructor.create({
    name: 'John Doe',
    email: 'john@skillsphere.com',
  });

  // Create courses under that instructor
  await Course.bulkCreate([
    { title: 'JavaScript Basics', description: 'Intro to JS', instructorId: instructor.id },
    { title: 'Advanced Node.js', description: 'Deep dive into Node', instructorId: instructor.id },
    { title: 'React Fundamentals', description: 'Learn React', instructorId: instructor.id },
  ]);

  console.log(`✅ Courses created for instructor: ${instructor.name}`);

  // Query: all courses by this instructor
  const result = await Instructor.findOne({
    where: { id: instructor.id },
    include: [{ model: Course }],
  });

  console.log(`\n📋 Courses by ${result.name}:`);
  result.Courses.forEach(c => {
    console.log(`  - [${c.id}] ${c.title}: ${c.description}`);
  });

  await sequelize.close();
}

run();
