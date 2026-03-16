const request = require('supertest');
const { expect } = require('chai');
const app = require('./testApp');
const db = require('./setup');
const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');

process.env.JWT_SECRET = 'test-secret';

describe('Menu API Routes', () => {
  it('GET /api/menu should return empty array when no items exist', async () => {
    const res = await request(app).get('/api/menu');
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.deep.equal([]);
  });

  it('admin POST /api/menu should create a new menu item', async () => {
    // Generate an admin token for testing (mocking authentication)
    const adminToken = require('jsonwebtoken').sign(
      { id: 'admin123', role: 'admin' }, 
      'test-secret', 
      { expiresIn: '1h' }
    );

    // Create a real category to get a valid ObjectId
    const category = new Category({ categoryName: 'Pizzas', description: 'Test Cat', imageUrl: '/cat.jpg' });
    await category.save();

    const newItem = {
      name: 'Test Pizza',
      description: 'A delicious test pizza',
      price: 15.99,
      categoryId: category._id.toString(),
      type: 'veg',
      spicy: true,
      popular: false
    };

    const res = await request(app)
      .post('/api/menu')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newItem);

    expect(res.statusCode).to.equal(201);
    expect(res.body.menuItem).to.have.property('_id');
    expect(res.body.menuItem).to.have.property('name', 'Test Pizza');

    // Verify it was correctly saved to DB
    const savedItem = await MenuItem.findOne({ name: 'Test Pizza' });
    expect(savedItem).to.not.be.null;
  });

  it('GET /api/menu should return populated menu items', async () => {
    // Create a real category to get a valid ObjectId
    const category = new Category({ categoryName: 'Drinks', description: 'Test Drinks', imageUrl: '/drink.jpg' });
    await category.save();

    // Seed database directly
    const item = new MenuItem({
      name: 'Seed Pizza',
      description: 'Seeded test item',
      price: 9.99,
      categoryId: category._id,
      type: 'non-veg',
      spicy: false,
      popular: true,
      imageUrl: '/images/test.jpg'
    });
    await item.save();

    const res = await request(app).get('/api/menu');
    expect(res.statusCode).to.equal(200);
    expect(res.body.length).to.equal(1);
    expect(res.body[0]).to.have.property('name', 'Seed Pizza');
  });

  describe('PUT /api/menu/:id', () => {
    it('admin should update a menu item', async () => {
      const adminToken = require('jsonwebtoken').sign({ id: 'admin123', role: 'admin' }, 'test-secret', { expiresIn: '1h' });
      const category = await Category.create({ categoryName: 'Test' });
      const item = await MenuItem.create({ 
        name: 'Old', 
        description: 'Test Desc',
        price: 1, 
        categoryId: category._id, 
        type: 'veg', 
        spicy: false, 
        popular: false 
      });

      const res = await request(app)
        .put(`/api/menu/${item._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated' });

      expect(res.statusCode).to.equal(200);
      expect(res.body.menuItem).to.have.property('name', 'Updated');
    });
  });

  describe('DELETE /api/menu/:id', () => {
    it('admin should delete a menu item', async () => {
      const adminToken = require('jsonwebtoken').sign({ id: 'admin123', role: 'admin' }, 'test-secret', { expiresIn: '1h' });
      const category = await Category.create({ categoryName: 'Test' });
      const item = await MenuItem.create({ 
        name: 'Delete Me', 
        description: 'Test Desc',
        price: 1, 
        categoryId: category._id, 
        type: 'veg', 
        spicy: false, 
        popular: false 
      });

      const res = await request(app)
        .delete(`/api/menu/${item._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal('Menu item deleted successfully');

      const dbItem = await MenuItem.findById(item._id);
      expect(dbItem).to.be.null;
    });
  });
});
