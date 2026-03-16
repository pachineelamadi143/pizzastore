const db = require('./setup');

exports.mochaHooks = {
  async beforeAll() {
    await db.connect();
  },
  async afterAll() {
    await db.closeDatabase();
  },
  async afterEach() {
    await db.clearDatabase();
  }
};
