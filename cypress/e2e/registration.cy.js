describe('Registration Flow', () => {
  it('validates form and allows registration when inputs are correct', () => {
    cy.visit('/register');

    // Fill basic fields
    cy.get('input#name').type('Cypress Tester');
    cy.get('input#email').type('cypress-tester+1@example.com');

    // Enter mismatching passwords -> should show validation message and button disabled
    cy.get('input#password').type('Password123!');
    cy.get('input#confirmPassword').type('Password321!');

    cy.contains('Passwords do not match').should('be.visible');
    cy.get('button[type=submit]').should('be.disabled');

    // Fix confirm password and check terms -> button should enable
    cy.get('input#confirmPassword').clear().type('Password123!');
    cy.get('#terms').click();

    // Now submit should be enabled
    cy.get('button[type=submit]').should('not.be.disabled');

    // Stub Supabase auth signup request to avoid creating real accounts in tests
    cy.intercept('POST', '**/auth/v1/**', {
      statusCode: 200,
      body: { user: null, session: null }
    }).as('signup');

    cy.get('button[type=submit]').click();

    // Wait for the stubbed signup request
    cy.wait('@signup');

    // Expect a success toast (the app shows "Sign up successful!" on success)
    cy.contains('Sign up successful!', { timeout: 5000 }).should('be.visible');
  });
});
