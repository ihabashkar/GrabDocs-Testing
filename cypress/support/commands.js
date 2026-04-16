Cypress.Commands.add('login', () => {

  cy.visit('https://app.grabdocs.com/');

  cy.wait(5000);

  // Fill username
  cy.get('#username', { timeout: 10000 })
    .should('be.visible')
    .clear()
    .type('ihabashkar');

  // Fill password
  cy.get('#password')
    .should('be.visible')
    .clear()
    .type('Grabdocstest!');

  cy.wait(1000);

  // Click "Sign in" button (exact match like Selenium)
  cy.get('button')
    .contains('Sign in')
    .click();

  // Wait for redirect into app
  cy.url({ timeout: 20000 }).should('include', '/upload');

});