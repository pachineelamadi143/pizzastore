const request = require('supertest');
const { expect } = require('chai');
const app = require('./testApp');
const db = require('./setup');
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret';

describe('Message API Routes', () => {
  let adminToken;
  let userToken;
  let userId = '507f1f77bcf86cd799439011';
  let orderId = '507f1f77bcf86cd799439012';

  before(async () => {
    await db.connect();
  });

  beforeEach(async () => {
    await db.clearDatabase();
    adminToken = jwt.sign({ id: 'admin123', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    userToken = jwt.sign({ id: userId, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  describe('POST /api/messages', () => {
    it('admin should be able to send a message', async () => {
      const messageData = {
        userId: userId,
        orderId: orderId,
        message: 'Your order is being prepared!'
      };

      const res = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(messageData);

      expect(res.statusCode).to.equal(201);
      expect(res.body.message).to.equal('Message sent successfully');
      expect(res.body.data).to.have.property('message', 'Your order is being prepared!');
    });
  });

  describe('GET /api/messages/my-messages', () => {
    it('user should get their messages', async () => {
      await Message.create({
        userId,
        orderId,
        message: 'Hello Customer'
      });

      const res = await request(app)
        .get('/api/messages/my-messages')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.lengthOf(1);
    });
  });

  describe('PUT /api/messages/mark-all-read', () => {
    it('user should mark all messages as read', async () => {
      await Message.create({
        userId,
        orderId,
        message: 'Msg 1',
        isRead: false
      });

      const res = await request(app)
        .put('/api/messages/mark-all-read')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal('All messages marked as read');

      const unreadCount = await Message.countDocuments({ userId, isRead: false });
      expect(unreadCount).to.equal(0);
    });
  });
});
