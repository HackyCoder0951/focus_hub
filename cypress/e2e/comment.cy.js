describe('Commenting Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input#email').type('priyakumari@gmail.com');
    cy.get('input#password').type('User@123');
    cy.get('button[type=submit]').click();
    // Wait until the app redirects to feed and posts have loaded
    cy.url({ timeout: 10000 }).should('include', '/app/feed');
    // If the app redirect was bypassed, ensure we are on the feed route
    cy.location('pathname').then((path) => {
      if (!path.includes('/app/feed')) {
        cy.visit('/app/feed');
      }
    });

    // Wait for the loading indicator to disappear (Feed shows "Loading posts...")
    cy.contains('Loading posts...').should('not.exist');
    // Ensure at least one post-card is present before proceeding
    cy.get('[data-cy=post-card]', { timeout: 15000 }).should('exist');
  });

  it('adds a comment to the first post', () => {
    cy.get('[data-cy=post-card]').first().within(() => {
      // Focus and type the comment, then click the Post button
      cy.get('input[placeholder="Add a comment..."]')
        .should('be.visible')
        .clear()
        .type('This is a test comment!');

      // Use contains with selector to avoid matching unrelated buttons
      cy.contains('button', 'Post').click();

      // Wait for the comment to appear in the post's comment thread
      cy.contains('This is a test comment!', { timeout: 5000 }).should('be.visible');
    });
  });
}); 