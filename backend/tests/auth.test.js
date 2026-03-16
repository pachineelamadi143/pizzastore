const request = require('supertest');
const { expect } = require('chai');
const app = require('./testApp');
const db = require('./setup');
const User = require('../models/User');

// Set process.env overrides
process.env.JWT_SECRET = 'test-secret';

describe('Auth API Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should successfully register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Tester',
          email: 'test@example.com',
          password: 'password123',
          phone: '1234567890'
        });

      expect(res.statusCode).to.equal(201);
      expect(res.body.message).to.equal('Registered successfully. Please log in.');
      
      const dbUser = await User.findOne({ email: 'test@example.com' });
      expect(dbUser).to.not.be.null;
    });

    it('should return error if email already exists', async () => {
      // Seed the DB first
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'User 1', email: 'test@example.com', password: 'pwd', phone: '1111111111' });

      // Try registering again
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User 2', email: 'test@example.com', password: 'pwd', phone: '2222222222' });

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('message', 'User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create user for login testing
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Login User',
          email: 'login@example.com',
          password: 'validpassword',
          phone: '9876543210'
        });
    });

    it('should login a user with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'validpassword'
        });

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('token');
      expect(res.body.user).to.have.property('email', 'login@example.com');
    });

    it('should return 400 on invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('message', 'Invalid email or password');
    });
    
    it('should return 400 for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password'
        });

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('message', 'Invalid email or password');
    });
  });

  describe('Validation', () => {
    it('should return 400 for missing fields in registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test' });

      expect(res.statusCode).to.equal(400);
    });

    it('should return 400 for missing fields in login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });

      expect(res.statusCode).to.equal(400);
    });
  });
});
