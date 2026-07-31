describe('Chat Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input#email').type('priyakumari@gmail.com');
    cy.get('input#password').type('User@123');
    cy.get('button[type=submit]').click();
    cy.url({ timeout: 10000 }).should('include', '/app/feed');
    cy.visit('/app/chat');
    // Select the first existing chat, if there is one. These specs assume at
    // least one chat/conversation already exists for the seeded test account.
    cy.get('[data-cy=chat-list-item]', { timeout: 10000 }).first().click();
  });

  it('sends a message and sees it appear in the conversation (CHAT-SEND-01)', () => {
    const message = `Cypress chat message ${Date.now()}`;
    cy.get('textarea[placeholder="Type a message..."]', { timeout: 10000 })
      .should('be.visible')
      .type(message);
    cy.get('button[aria-label="Send message"]').click();

    cy.contains(message, { timeout: 10000 }).should('be.visible');
  });

  it('disables the send button while the message box is empty (CHAT-SEND-02)', () => {
    cy.get('button[aria-label="Send message"]', { timeout: 10000 }).should('be.disabled');
  });
});

describe('Chat Access Control', () => {
  it('redirects an unauthenticated visitor away from the chat page (CHAT-SEND-03)', () => {
    cy.visit('/app/chat');
    cy.url({ timeout: 10000 }).should('include', '/login');
  });
});
