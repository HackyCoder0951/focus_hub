describe('Resources - File Upload', () => {
  it('uploads a dummy file using fixture and shows it in the list', () => {
    // Login via UI
    cy.visit('/login');
    cy.get('input#email').type('priyakumari@gmail.com');
    cy.get('input#password').type('User@123');
    cy.get('button[type=submit]').click();

    // Wait for redirect to app and go to resources page
    cy.url({ timeout: 10000 }).should('include', '/app');
    cy.visit('/app/resources');

    // Stub storage upload request so the storage call succeeds
    cy.intercept('POST', 'https://hfiltwodcwlqwxrwfjyp.supabase.co/storage/v1/object/**', {
      statusCode: 200,
      body: {}
    }).as('storageUpload');

    // Stub DB insert for filemodels to return the created record
    const createdAt = new Date().toISOString();
    const fileRecord = {
      id: 123456,
      user_id: '1319be79-c9ec-450f-8115-4445c9da6d98',
      file_url: 'https://hfiltwodcwlqwxrwfjyp.supabase.co/storage/v1/object/public/uploads/1319be79-c9ec-450f-8115-4445c9da6d98/testfile.txt',
      file_name: 'testfile.txt',
      file_type: 'text/plain',
      file_size: 12,
      description: 'Cypress test file',
      is_public: true,
      created_at: createdAt,
      profiles: { id: 1, full_name: 'Cypress Tester', avatar_url: null }
    };

    cy.intercept('POST', '**/rest/v1/filemodels', (req) => {
      req.reply({ statusCode: 201, body: [fileRecord] });
    }).as('insertFile');

    // Stub GET for filemodels so the UI shows the uploaded file in the list
    cy.intercept('GET', '**/rest/v1/filemodels*', (req) => {
      req.reply({ statusCode: 200, body: [fileRecord] });
    }).as('getFiles');

    // Open Upload File dialog
    cy.contains('button', 'Upload File', { timeout: 10000 }).should('be.visible').click();

    // Attach fixture file (cypress-file-upload is available via support/commands.js)
    cy.get('input#file').attachFile('testfile.txt');

    // Fill description and mark public
    cy.get('textarea#description').type('Cypress test file');
    cy.get('input#isPublic').check();

    // Submit upload (button inside dialog)
    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', 'Upload File').click();
    });

    // Wait for storage + insert and for the UI to refresh
    cy.wait('@storageUpload');
    cy.wait('@insertFile');
    cy.wait('@getFiles');

    // Expect success state in the dialog
    cy.contains('File uploaded successfully!', { timeout: 5000 }).should('be.visible');

    // Close the dialog
    cy.contains('button', 'Close').click();

    // Confirm the uploaded file is visible in the resources list
    cy.contains('testfile.txt', { timeout: 5000 }).should('be.visible');
    cy.contains('Cypress test file').should('be.visible');
  });
});
