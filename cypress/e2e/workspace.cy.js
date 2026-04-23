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

    cy.wait(3000);

    //  Step 4: Open Create Workspace modal
    cy.contains('button', 'Create Workspace')
      .should('be.visible')
      .click({ force: true });

    cy.wait(3000);

    //  Step 5: Fill workspace modal
    cy.get('.fixed.inset-0')
      .should('be.visible')
      .within(() => {

        cy.get('input[type="text"]')
          .first()
          .type('Test Workspace');

        cy.wait(1000);

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

    cy.wait(3000);

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
          cy.wait(1000);

        cy.get('input[type="number"]')
          .first()
          .clear()
          .type('5');
          cy.wait(1000);

        cy.get('input[type="number"]')
          .eq(1)
          .clear()
          .type('10');
          cy.wait(1000);

        cy.contains('button', 'Create Link')
          .should('not.be.disabled')
          .click();
          cy.wait(1000);
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
  cy.wait(3000);

// Step 14: Verify editor opened
cy.url().should('include', '/drafts/edit');
cy.contains('Draft').should('be.visible');
cy.wait(3000);
// Step 15: Type into the editor
cy.get('[contenteditable="true"]')
  .should('be.visible')
  .click()              // focus the editor
  .type('This is a Cypress test document.{enter}Adding another line.');
cy.wait(3000);
// Optional: verify text exists inside editor
cy.contains('This is a Cypress test document.')
  .should('exist');
  cy.wait(3000);

// Step 16: Click Save Changes
cy.contains('button', 'Save Changes')
  .should('be.visible')
  .click();
  cy.wait(3000);

// Step 17: Verify save worked (basic check)
cy.contains('This is a Cypress test document.')
  .should('exist');
  cy.wait(3000);

  // Step 18: Open modal
cy.contains('button', 'Invite to Edit')
  .click();
  cy.wait(3000);

// Assert modal exists
cy.get('.fixed.inset-0').should('exist');

// Step 19: Ensure link is generated OR generate it
cy.contains('button', /create link/i).then($btn => {
  if ($btn.is(':visible')) {
    cy.wrap($btn).click();
  }
});
cy.wait(3000);

// Step 20: Handle Share Modal (after "Create Link")
cy.get('.fixed.inset-0')
  .should('be.visible')
  .within(() => {

    // 1. Type email
    cy.get('textarea[placeholder*="user1@example.com"]')
      .should('be.visible')
      .clear()
      .type('ihabashkar3@gmail.com');
      cy.wait(3000);

    // 2. Click "Send Email" (wait until enabled)
    cy.contains('button', 'Send Email')
      .should('not.be.disabled')
      .click();
      cy.wait(3000);

    // Optional: wait for UI feedback (toast / state change)
    cy.wait(500);

    // 3. Click "Done"
cy.contains('button', /^Done$/)
  .click({ force: true });
  });
  cy.wait(3000);

// Confirm modal closed
cy.get('.fixed.inset-0').should('not.exist');

//Step 21: Disable/Enable File Request Link and Delete
cy.get('a[title="File Request"]')
  .should('be.visible')
  .click();
cy.wait(3000);

// Step 1: Open 3-dot menu for a link
cy.get('button[aria-label="Options"]')
  .first()
  .click({ force: true });
  cy.wait(3000);

// Step 2: Click Enable/Disable toggle
cy.contains('button', /enable|disable/i)
  .should('be.visible')
  .click();
  cy.wait(3000);

// Step 3: Wait for UI state update
cy.wait(3000);

// Step 4: Re-open 3-dot menu (IMPORTANT: DOM likely re-rendered)
cy.get('button[aria-label="Options"]')
  .first()
  .click({ force: true });
  cy.wait(3000);

// Step 5: Click Delete
cy.contains('button', /^delete$/i)
  .should('be.visible')
  .click();
  cy.wait(3000);

  });

});
