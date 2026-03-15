const request = require('supertest');
const { expect } = require('chai');
const app = require('./testApp');
const db = require('./setup');
const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret';

describe('Cart API Routes', () => {
  let userToken;
  let userId = '507f1f77bcf86cd799439011'; // Mock ObjectId
  let menuItem;

  before(async () => {
    await db.connect();
  });

  beforeEach(async () => {
    await db.clearDatabase();
    
    // Create a mock user token
    userToken = jwt.sign({ id: userId, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Create a category and menu item for cart testing
    const category = new Category({ 
      categoryName: 'Pizzas', 
      description: 'Test Category', 
      imageUrl: '/cat.jpg' 
    });
    await category.save();

    menuItem = new MenuItem({
      name: 'Test Pizza',
      description: 'Test Description',
      price: 10,
      categoryId: category._id,
      type: 'veg',
      spicy: false,
      popular: true,
      imageUrl: '/pizza.jpg'
    });
    await menuItem.save();
  });

  describe('POST /api/cart', () => {
    it('should add an item to the cart', async () => {
      const res = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          itemId: menuItem._id.toString(),
          name: menuItem.name,
          price: menuItem.price,
          quantity: 2
        });

      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal('Item added to cart');
      expect(res.body.cart.items).to.have.lengthOf(1);
      expect(res.body.cart.items[0]).to.have.property('name', 'Test Pizza');
      expect(res.body.cart.totalAmount).to.equal(20);
    });
  });

  describe('GET /api/cart', () => {
    it('should return empty cart when none exists', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body.items).to.have.lengthOf(0);
      expect(res.body.totalAmount).to.equal(0);
    });

    it('should return the user\'s cart', async () => {
      // Seed a cart
      await Cart.create({
        userId: userId,
        items: [{
          itemId: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1
        }],
        totalAmount: 10
      });

      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body.items).to.have.lengthOf(1);
      expect(res.body.items[0].itemId).to.have.property('name', 'Test Pizza');
    });
  });

  describe('PUT /api/cart/update', () => {
    it('should update item quantity in cart', async () => {
      const cart = await Cart.create({
        userId: userId,
        items: [{
          itemId: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1
        }],
        totalAmount: 10
      });

      const res = await request(app)
        .put('/api/cart/update')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          itemId: menuItem._id.toString(),
          quantity: 3
        });

      expect(res.statusCode).to.equal(200);
      expect(res.body.cart.items[0]).to.have.property('quantity', 3);
      expect(res.body.cart.totalAmount).to.equal(30);
    });
  });

  describe('DELETE /api/cart/:itemId', () => {
    it('should remove an item from the cart', async () => {
      const cart = await Cart.create({
        userId: userId,
        items: [{
          itemId: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1
        }],
        totalAmount: 10
      });

      const res = await request(app)
        .delete(`/api/cart/${menuItem._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body.cart.items).to.have.lengthOf(0);
      expect(res.body.cart.totalAmount).to.equal(0);
    });
  });

  describe('DELETE /api/cart/clear', () => {
    it('should clear the entire cart', async () => {
      await Cart.create({
        userId: userId,
        items: [{
          itemId: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1
        }],
        totalAmount: 10
      });

      const res = await request(app)
        .delete('/api/cart/clear')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal('Cart cleared successfully');

      const dbCart = await Cart.findOne({ userId: userId });
      expect(dbCart).to.be.null;
    });
  });
});
