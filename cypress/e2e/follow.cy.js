describe('Follow / Unfollow Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input#email').type('priyakumari@gmail.com');
    cy.get('input#password').type('User@123');
    cy.get('button[type=submit]').click();
    cy.url({ timeout: 10000 }).should('include', '/app/feed');
    // Only the Following list (not Followers) renders a follow/unfollow
    // toggle per row. This spec assumes the seeded account already follows
    // at least one user, so there is a row with a toggle to exercise.
    cy.visit('/app/following');
    cy.get('[data-cy=user-list-item]', { timeout: 10000 }).should('have.length.greaterThan', 0);
  });

  it('toggles a followed user to unfollowed and back', () => {
    cy.get('[data-cy=user-list-item]')
      .first()
      .within(() => {
        cy.contains('button', 'Following', { timeout: 10000 }).click();
        cy.contains('button', 'Follow', { timeout: 10000 }).should('be.visible');
        cy.contains('button', 'Follow').click();
        cy.contains('button', 'Following', { timeout: 10000 }).should('be.visible');
      });
  });
});
