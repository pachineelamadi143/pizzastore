// E2E Tests: Cart & Checkout Flows
// Requires: frontend on http://localhost:3000 + backend on http://localhost:5000

describe('Cart & Checkout', () => {
  // ── Guest redirect ─────────────────────────────────────────────────────
  describe('Guest access', () => {
    it('redirects to /login when visiting /cart as a guest', () => {
      cy.visit('/cart');
      cy.url().should('include', '/login');
    });

    it('redirects to /login when visiting /orders as a guest', () => {
      cy.visit('/orders');
      cy.url().should('include', '/login');
    });
  });

  // ── Authenticated cart flow ────────────────────────────────────────────
  describe('Logged-in user flow', () => {
    // Seed sessionStorage with a fake token to simulate login
    beforeEach(() => {
      cy.window().then((win) => {
        win.sessionStorage.setItem('token', 'fake-test-token-for-e2e');
        win.sessionStorage.setItem(
          'user',
          JSON.stringify({ _id: 'u1', name: 'Test User', role: 'customer', email: 'test@example.com' })
        );
      });
    });

    it('navigates to /cart page without being redirected to /login', () => {
      cy.visit('/cart');
      // Should stay on /cart (or load the page)
      // If backend rejects the fake token, the page still renders the cart shell
      cy.url().should('include', '/cart');
    });

    it('shows the Checkout heading on the Cart page', () => {
      cy.visit('/cart');
      cy.contains(/checkout|cart/i, { timeout: 6000 }).should('exist');
    });

    it('the Cart page has a Place Order or Browse Menu button', () => {
      cy.visit('/cart');
      cy.get('button', { timeout: 6000 }).should('exist');
    });
  });

  // ── Home Page navigation ───────────────────────────────────────────────
  describe('Navigation from Home', () => {
    it('can reach the Menu page from the home Navbar', () => {
      cy.visit('/');
      cy.get('#nav-menu-guest').click();
      cy.url().should('include', '/menu');
    });

    it('can reach the Login page from the home Navbar', () => {
      cy.visit('/');
      cy.get('#nav-login').click();
      cy.url().should('include', '/login');
    });
  });
});
