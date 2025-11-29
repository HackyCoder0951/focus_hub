describe('Q&A Flow', () => {
  beforeEach(() => {
    // Log in first using existing credentials
    cy.visit('/login');
    cy.get('input#email').type('priyakumari@gmail.com');
    cy.get('input#password').type('user@123');
    cy.get('button[type=submit]').click();
    // Wait for the app to redirect after login (or time out)
    cy.url({ timeout: 10000 }).should('include', '/app');

    // Ensure on Q&A page (visit directly if redirect bypassed)
    cy.location('pathname').then((path) => {
      if (!path.includes('/app/qa')) {
        cy.visit('/app/qa');
      }
    });
    // Wait for the page header to appear and questions to load
    cy.contains('Q&A Community', { timeout: 10000 }).should('be.visible');
    cy.contains('Loading questions...').should('not.exist');
  });

  it('allows an authenticated user to ask a question', () => {
    const title = `E2E test question ${Date.now()}`;
    const body = 'This is a test question created by Cypress.';

    // Intercept the Supabase insert to questions so the test is deterministic
    cy.intercept('POST', '**/rest/v1/questions', (req) => {
      req.reply({
        statusCode: 201,
        body: [{ id: 99999, title, body, user_id: 1, created_at: new Date().toISOString() }]
      });
    }).as('createQuestion');

    // Stub the GET for questions so the newly created question appears in the list
    cy.intercept('GET', '**/rest/v1/questions*', (req) => {
      req.reply({
        statusCode: 200,
        body: [
          {
            id: 99999,
            title,
            body,
            user_id: 1,
            created_at: new Date().toISOString(),
            profiles: { id: 1, full_name: 'Cypress Tester', avatar_url: null },
            answers: [{ count: 0 }]
          }
        ]
      });
    }).as('getQuestions');

    // Ensure Ask Question button is visible, then open dialog
    cy.contains('button', 'Ask Question', { timeout: 10000 }).should('be.visible').click();

    // Fill title and body
    cy.get('input[placeholder="What\'s your question? Be specific."]').type(title);
    cy.get('textarea[placeholder="Provide more context about your question..."]').type(body);

    // Post the question
    cy.contains('button', 'Post Question').click();

    // Wait for network and expect success toast
    cy.wait('@createQuestion');
    cy.contains('Question posted!', { timeout: 5000 }).should('be.visible');

    // Confirm the question appears in the list
    cy.contains(title, { timeout: 5000 }).should('be.visible');
  });
});
