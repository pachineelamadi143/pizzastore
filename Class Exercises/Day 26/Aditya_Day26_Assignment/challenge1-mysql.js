require('dotenv').config();
console.log('USER:', process.env.MYSQL_USER);
console.log('PASS:', process.env.MYSQL_PASSWORD);

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Adi@1033',
  database: 'skillsphere',
});

connection.connect((err) => {
  if (err) throw err;
  console.log('✅ Connected to MySQL');

  // Create table if not exists
  const createTable = `
    CREATE TABLE IF NOT EXISTS courses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  connection.query(createTable, (err) => {
    if (err) throw err;

    // Insert a new course
    const course = {
      title: 'Node.js for Beginners',
      description: 'Learn Node.js from scratch',
    };

    connection.query('INSERT INTO courses SET ?', course, (err, result) => {
      if (err) throw err;
      console.log('✅ INSERT INTO courses successful! ID:', result.insertId);
      connection.end();
    });
  });
});