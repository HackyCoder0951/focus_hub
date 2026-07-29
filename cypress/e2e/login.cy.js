describe('Login Flow', () => {
  it('logs in with valid credentials and redirects to the feed', () => {
    cy.visit('/login');
    cy.get('input#email').type('priyakumari@gmail.com');
    cy.get('input#password').type('User@123');
    cy.get('button[type=submit]').click();
    cy.url({ timeout: 10000 }).should('include', '/app/feed');
  });

  it('shows an error for invalid credentials', () => {
    cy.visit('/login');
    cy.get('input#email').type('priyakumari@gmail.com');
    cy.get('input#password').type('wrong-password');
    cy.get('button[type=submit]').click();
    cy.contains('Sign in failed', { timeout: 10000 }).should('be.visible');
    cy.url().should('include', '/login');
  });
});
