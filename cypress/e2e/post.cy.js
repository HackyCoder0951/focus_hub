describe('Post Creation Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input#email').type('priyakumari@gmail.com');
    cy.get('input#password').type('User@123');
    cy.get('button[type=submit]').click();
    cy.url({ timeout: 10000 }).should('include', '/app/feed');
    cy.contains('Loading posts...').should('not.exist');
  });

  it('creates a new text post and shows it at the top of the feed', () => {
    const postContent = `Cypress test post ${Date.now()}`;

    cy.contains('button', 'Share something…').click();
    cy.get('textarea[placeholder="Share something…"]').type(postContent);
    cy.contains('button', 'Post').click();

    cy.get('[data-cy=post-card]', { timeout: 10000 })
      .first()
      .should('contain.text', postContent);
  });
});
