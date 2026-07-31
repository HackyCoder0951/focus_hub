describe('Settings Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input#email').type('priyakumari@gmail.com');
    cy.get('input#password').type('User@123');
    cy.get('button[type=submit]').click();
    cy.url({ timeout: 10000 }).should('include', '/app/feed');
    cy.visit('/app/settings');
  });

  it('updates profile info and shows a confirmation (PROFILE-UPDATE-01)', () => {
    const bio = `Cypress test bio ${Date.now()}`;
    cy.get('#bio').clear().type(bio);
    cy.contains('button', 'Save Changes').click();
    cy.contains('Profile updated', { timeout: 10000 }).should('be.visible');
  });

  it('shows an error when changing password with the wrong current password (SETTINGS-UPDATE-02)', () => {
    cy.contains('button', 'Security').click();
    cy.get('#currentPassword').type('definitely-the-wrong-password');
    cy.get('#newPassword').type('newpassword123');
    cy.get('#confirmPassword').type('newpassword123');
    cy.contains('button', 'Change Password').click();
    cy.contains('Password update failed', { timeout: 10000 }).should('be.visible');
  });
});

describe('Settings Access Control', () => {
  it('redirects an unauthenticated visitor away from the settings page (PROFILE-UPDATE-03)', () => {
    cy.visit('/app/settings');
    cy.url({ timeout: 10000 }).should('include', '/login');
  });
});
