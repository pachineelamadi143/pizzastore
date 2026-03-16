const request = require('supertest');
const { expect } = require('chai');
const app = require('./testApp');
const db = require('./setup');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret';

describe('Payment API Routes', () => {
  let userToken;
  let userId = '507f1f77bcf86cd799439011';
  let orderId;


  beforeEach(async () => {
    userToken = jwt.sign({ id: userId, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Create an order for payment testing
    const order = await Order.create({
      userId,
      addressId: '507f1f77bcf86cd799439012',
      items: [{ itemId: '507f1f77bcf86cd799439013', name: 'Pizza', price: 10, quantity: 1 }],
      subtotal: 10,
      tax: 0.5,
      deliveryCharge: 0,
      totalAmount: 10.5,
      paymentMethod: 'card'
    });
    orderId = order._id;
  });

  describe('POST /api/payments', () => {
    it('should process a payment', async () => {
      const paymentData = {
        orderId: orderId.toString(),
        paymentMode: 'card',
        paidAmount: 10.5,
        transactionId: 'TXN123'
      };

      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(201);
      expect(res.body.message).to.equal('Payment successful');
      expect(res.body.payment).to.have.property('paidAmount', 10.5);
      expect(res.body.payment).to.have.property('paymentStatus', 'completed');
    });
  });

  describe('GET /api/payments/:orderId', () => {
    it('should get payment by order ID', async () => {
      await Payment.create({
        orderId,
        userId,
        paymentMode: 'card',
        paymentStatus: 'completed',
        paidAmount: 10.5,
        transactionId: 'TXN123'
      });

      const res = await request(app)
        .get(`/api/payments/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('transactionId', 'TXN123');
    });
  });
});
