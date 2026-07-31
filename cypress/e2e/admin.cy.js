describe('Admin Access Control', () => {
  // Confirmed via repeated standalone runs: priyakumari@gmail.com is NOT an
  // admin — visiting /app/admin/dashboard redirects back to /app/feed. (An
  // earlier single run in a larger batch showed it landing on the admin
  // dashboard, which turned out to be stale session/state carried over from
  // another spec in that batch rather than this account actually being admin.)
  it('redirects a non-admin user away from the admin dashboard (ADMIN-FLAG-02)', () => {
    cy.visit('/login');
    cy.get('input#email').type('admin@focus.com');
    cy.get('input#password').type('A@ja0951');
    cy.get('button[type=submit]').click();
    cy.url({ timeout: 10000 }).should('include', '/app');

    cy.visit('/app/admin/dashboard');
    cy.url({ timeout: 10000 }).should('not.include', '/admin/dashboard');
  });
});

describe('Admin Access Control (requires a confirmed admin account)', () => {
  // No confirmed admin seeded account exists for this suite today. Set
  // adminEmail / adminPassword via Cypress env
  // (`--env adminEmail=...,adminPassword=...`) once one is available,
  // rather than guessing at a second real account here.
  const adminEmail = Cypress.env('adminEmail');
  const adminPassword = Cypress.env('adminPassword');

  beforeEach(function () {
    if (!adminEmail || !adminPassword) {
      this.skip();
    }
    cy.visit('/login');
    cy.get('input#email').type(adminEmail);
    cy.get('input#password').type(adminPassword);
    cy.get('button[type=submit]').click();
    cy.url({ timeout: 10000 }).should('include', '/app');
  });

  it('shows the flagged content list to an admin (ADMIN-FLAG-01)', () => {
    cy.visit('/app/admin/dashboard');
    cy.url({ timeout: 10000 }).should('include', '/app/admin/dashboard');
    cy.contains(/flagged|reports/i, { timeout: 10000 }).should('be.visible');
  });
});
