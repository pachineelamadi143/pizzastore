const request = require('supertest');
const { expect } = require('chai');
const app = require('./testApp');
const db = require('./setup');
const Address = require('../models/Address');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret';

describe('Address API Routes', () => {
  let userToken;
  let userId = '507f1f77bcf86cd799439011';


  beforeEach(async () => {
    userToken = jwt.sign({ id: userId, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  describe('POST /api/address', () => {
    it('should add a new address', async () => {
      const newAddress = {
        houseNumber: '123',
        street: 'Main St',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        landmark: 'Near Park',
        isDefault: true
      };

      const res = await request(app)
        .post('/api/address')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newAddress);

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property('houseNumber', '123');
      expect(res.body).to.have.property('isDefault', true);
    });
  });

  describe('GET /api/address', () => {
    it('should return all addresses for the user', async () => {
      await Address.create({
        userId,
        houseNumber: '1',
        street: 'St 1',
        city: 'C1',
        state: 'S1',
        pincode: '111',
        isDefault: true
      });

      const res = await request(app)
        .get('/api/address')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.lengthOf(1);
      expect(res.body[0]).to.have.property('houseNumber', '1');
    });
  });

  describe('PUT /api/address/:id', () => {
    it('should update an address', async () => {
      const address = await Address.create({
        userId,
        houseNumber: '1',
        street: 'St 1',
        city: 'C1',
        state: 'S1',
        pincode: '111'
      });

      const res = await request(app)
        .put(`/api/address/${address._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ houseNumber: 'Updated 1' });

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('houseNumber', 'Updated 1');
    });
  });

  describe('DELETE /api/address/:id', () => {
    it('should delete an address', async () => {
      const address = await Address.create({
        userId,
        houseNumber: '1',
        street: 'St 1',
        city: 'C1',
        state: 'S1',
        pincode: '111'
      });

      const res = await request(app)
        .delete(`/api/address/${address._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal('Address deleted successfully');

      const dbAddress = await Address.findById(address._id);
      expect(dbAddress).to.be.null;
    });
  });
});
