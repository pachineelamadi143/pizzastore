// E2E Tests: Authentication Flows
// Requires: frontend on http://localhost:3000 + backend on http://localhost:5000

describe('Authentication Flows', () => {
  // ── Login Page ─────────────────────────────────────────────────────────
  describe('Login Page', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('displays the login form', () => {
      cy.get('h5').contains(/login/i).should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('shows validation errors on empty submit', () => {
      cy.get('button[type="submit"]').click();
      cy.contains(/email is required/i).should('be.visible');
      cy.contains(/password is required/i).should('be.visible');
    });

    it('shows error for invalid email format', () => {
      cy.get('input[name="email"]').type('notanemail').blur();
      cy.contains(/enter a valid email address/i).should('be.visible');
    });

    it('shows error for short password', () => {
      cy.get('input[name="password"]').type('123').blur();
      cy.contains(/at least 6 characters/i).should('be.visible');
    });

    it('shows server error for invalid credentials', () => {
      cy.get('input[name="email"]').type('wrong@example.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();

      // Look for any toast or alert that might pop up, or just verify we don't proceed
      // Since it's a toaster element, we can just look for error indicators or an alert
      cy.get('.toast, .alert, .text-danger').should('exist');
    });

    it('has a link to the Register page', () => {
      cy.contains(/register/i).should('be.visible').click();
      cy.url().should('include', '/register');
    });
  });

  // ── Register Page ──────────────────────────────────────────────────────
  describe('Register Page', () => {
    beforeEach(() => {
      cy.visit('/register');
    });

    it('displays all registration fields', () => {
      cy.get('input[name="name"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('input[name="phone"]').should('be.visible');
    });

    it('shows required validation errors on empty submit', () => {
      cy.get('button[type="submit"]').click();
      cy.contains(/full name is required/i).should('be.visible');
      cy.contains(/email is required/i).should('be.visible');
    });

    it('shows phone validation error for short phone', () => {
      cy.get('input[name="phone"]').type('12345').blur();
      cy.contains(/valid 10-digit phone/i).should('be.visible');
    });

    it('has a link back to the Login page', () => {
      cy.contains(/already have an account/i).should('be.visible');
      cy.get('a[href="/login"]').click();
      cy.url().should('include', '/login');
    });
  });
});
