describe('Workspace Flow', () => {

  it('logs in once and creates a workspace, then creates a file request link', () => {

    //  Step 1: Manual login (your custom command)
    cy.login();

    //  Step 2: Go to Workspaces
    cy.get('a[title="Workspace"]')
      .should('be.visible')
      .click({ force: true });

    //  Step 3: Verify Workspaces page
    cy.contains('h1', 'Workspaces')
      .should('be.visible');

    cy.wait(1000);

    //  Step 4: Open Create Workspace modal
    cy.contains('button', 'Create Workspace')
      .should('be.visible')
      .click({ force: true });

    cy.wait(1000);

    //  Step 5: Fill workspace modal
    cy.get('.fixed.inset-0')
      .should('be.visible')
      .within(() => {

        cy.get('input[type="text"]')
          .first()
          .type('Test Workspace');

        cy.wait(500);

        cy.get('textarea')
          .type('This is a Cypress test workspace');

        cy.wait(500);

        cy.contains('button', 'Create')
          .should('not.be.disabled')
          .click();
      });

    //  Step 6: Confirm workspace exists
    cy.contains('Test Workspace')
      .should('exist');

    cy.wait(1000);

    //  Step 7: Go to File Request
    cy.get('a[title="File Request"]')
      .should('be.visible')
      .click();

    //  Step 8: Open New Link modal
    cy.contains('button', 'New Link')
      .should('be.visible')
      .click();

    //  Step 9: Fill File Request modal
    cy.get('.fixed.inset-0')
  .should('be.visible')
  .within(() => {

        cy.get('input[type="text"]')
          .first()
          .type('Test Upload Link');

        cy.get('input[type="datetime-local"]')
          .type('2026-05-01T12:00');

        cy.get('input[type="number"]')
          .first()
          .clear()
          .type('5');

        cy.get('input[type="number"]')
          .eq(1)
          .clear()
          .type('10');

        cy.contains('button', 'Create Link')
          .should('not.be.disabled')
          .click();
      });

    //  Step 10: Final assertion (basic success check)
    cy.contains('Test Upload Link')
      .should('exist');

// Step 11: Go to Drafts
cy.get('a[title="Drafts"]')
  .should('be.visible')
  .click();

cy.url().should('include', '/drafts');

// Step 12: Prevent new tab
cy.window().then((win) => {
  cy.stub(win, 'open').callsFake((url) => {
    win.location.href = url;
  });
});

// Step 13: Click New Draft
cy.contains('button', /new draft/i)
  .should('be.visible')
  .click();

// Step 14: Verify editor opened
cy.url().should('include', '/drafts/edit');
cy.contains('Draft').should('be.visible');

  });

});