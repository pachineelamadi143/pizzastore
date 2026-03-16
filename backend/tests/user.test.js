const request = require('supertest');
const { expect } = require('chai');
const app = require('./testApp');
const db = require('./setup');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

process.env.JWT_SECRET = 'test-secret';

describe('User API Routes', () => {
  let adminToken;
  let userToken;
  let userId;
  let user;


  beforeEach(async () => {
    
    // Create a regular user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      phone: '1234567890',
      role: 'customer'
    });
    await user.save();
    userId = user._id;

    userToken = jwt.sign({ id: userId, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    adminToken = jwt.sign({ id: 'admin123', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  describe('GET /api/users/profile', () => {
    it('should get current user profile', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('email', 'test@example.com');
      expect(res.body).to.not.have.property('password');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update current user profile', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Name', phone: '0987654321' });

      expect(res.statusCode).to.equal(200);
      expect(res.body.user).to.have.property('name', 'Updated Name');
    });
  });

  describe('PUT /api/users/change-password', () => {
    it('should change user password', async () => {
      const res = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ currentPassword: 'password123', newPassword: 'newpassword123' });

      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal('Password updated successfully');

      // Verify password was changed
      const updatedUser = await User.findById(userId);
      const isMatch = await bcrypt.compare('newpassword123', updatedUser.password);
      expect(isMatch).to.be.true;
    });
  });

  describe('Admin Routes', () => {
    it('GET /api/users should return all customers for admin', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.lengthOf(1);
      expect(res.body[0]).to.have.property('email', 'test@example.com');
    });

    it('DELETE /api/users/:id should delete a user for admin', async () => {
      const res = await request(app)
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal('User deleted successfully');

      const dbUser = await User.findById(userId);
      expect(dbUser).to.be.null;
    });
  });
});
