const axios = require('axios');

async function testLogin() {
  console.log('Testing login endpoint...');
  try {
    const res = await axios.post('https://pizza-store-backend.onrender.com/api/auth/login', {
      email: 'admin@pizzastore.com',
      password: 'password'
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

testLogin();
