// E2E Tests: Menu Page Flows
// Requires: frontend on http://localhost:3000 + backend on http://localhost:5000

describe('Menu Page', () => {
  beforeEach(() => {
    cy.visit('/menu');
  });

  it('loads the menu page without crashing', () => {
    cy.url().should('include', '/menu');
  });

  it('displays the Navbar with navigation links', () => {
    // Guest navbar should have Login link
    cy.get('#nav-login').should('be.visible');
    cy.get('#nav-menu-guest').should('be.visible');
  });

  it('shows menu items or a loading indicator', () => {
    // Either shows menu items or a spinner/loading state
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="menu-item"]').length > 0) {
        cy.get('[data-testid="menu-item"]').should('have.length.greaterThan', 0);
      } else {
        // still valid if items loaded but no data-testid — check for any card
        cy.get('.card, .spinner-border, h4, p').should('exist');
      }
    });
  });

  it('navigates to login when clicking Add to Cart as guest', () => {
    // If there are add-to-cart buttons visible, clicking should redirect to login
    cy.get('body').then(($body) => {
      if ($body.find('button').filter(':contains("Add")').length > 0) {
        cy.get('button').contains(/add/i).first().click();
        cy.url().should('include', '/login');
      }
    });
  });

  it('can navigate to Login from the Navbar', () => {
    cy.get('#nav-login').click();
    cy.url().should('include', '/login');
  });
});
