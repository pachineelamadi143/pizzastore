const request = require('supertest');
const { expect } = require('chai');
const app = require('./testApp');
const db = require('./setup');
const Category = require('../models/Category');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret';

describe('Category API Routes', () => {
  let adminToken;
  let userToken;


  beforeEach(async () => {
    
    adminToken = jwt.sign({ id: 'admin123', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    userToken = jwt.sign({ id: 'user123', role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  describe('GET /api/categories', () => {
    it('should return all categories', async () => {
      await Category.create({ categoryName: 'Pizzas' });
      await Category.create({ categoryName: 'Sides' });

      const res = await request(app).get('/api/categories');

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.lengthOf(2);
      expect(res.body[0]).to.have.property('categoryName', 'Pizzas');
    });
  });

  describe('POST /api/categories', () => {
    it('admin should create a new category', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ categoryName: 'New Category' });

      expect(res.statusCode).to.equal(201);
      expect(res.body.category).to.have.property('categoryName', 'New Category');
    });

    it('non-admin should not be able to create category', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ categoryName: 'Should Fail' });

      expect(res.statusCode).to.equal(403);
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('admin should update a category', async () => {
      const category = await Category.create({ categoryName: 'Old Name' });

      const res = await request(app)
        .put(`/api/categories/${category._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ categoryName: 'Updated Name' });

      expect(res.statusCode).to.equal(200);
      expect(res.body.category).to.have.property('categoryName', 'Updated Name');
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('admin should delete a category', async () => {
      const category = await Category.create({ categoryName: 'To Delete' });

      const res = await request(app)
        .delete(`/api/categories/${category._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal('Category deleted successfully');

      const dbCategory = await Category.findById(category._id);
      expect(dbCategory).to.be.null;
    });
  });
});
