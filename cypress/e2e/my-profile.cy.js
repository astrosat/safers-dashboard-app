/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

const username = 'mmb.221177@gmail.com';
const password = 'HelloWorld1';

describe('My Profile Update Profile', () => {
  it('Updates Profile', () => {
    //uncomment to intercept post request
    // cy.intercept('POST', 'https://safers-dashboard.herokuapp.com/*', { fixture: 'user.json' });

    cy.visit('http://localhost:3000/auth/sign-in');

    cy.get('[data-testid="sign-in-email"]').type(username);
    cy.get('[data-testid="sign-in-email"]').should('have.value', username);
    cy.get('[data-testid="sign-in-password"]').type(password);
    cy.get('[data-testid="sign-in-password"]').should('have.value', password);

    cy.get('[data-testid="signInButton"]').click();

    cy.visit('http://localhost:3000/user/select-aoi');

    cy.get('[data-testid="select-default-aoi-on-helper1"]').click();

    cy.get('[data-testid="save-default-aoi-btn"]').click();

    cy.visit('http://localhost:3000/my-profile/view');

    cy.get('[data-testid="update-profile-firstName"]').type('john');
    cy.get('[data-testid="update-profile-lastName"]').type('doe');
    cy.get('[data-testid="update-profile-country"]').select('japan');

    cy.get('[data-testid="update-profile-role"]').select('Decision Maker');
    cy.get('[data-testid="update-profile-org"]').select(
      'HRT - Hellenic Rescue Team',
    );

    cy.get('[data-testid="updateProfileButton"]').click();

    cy.get('[data-testid="updateProfilePasswordBtn"]').click();
    cy.get('[data-testid="old_password"]').type('john');
    cy.get('[data-testid="new_password"]').type('doe');
    cy.get('[data-testid="confirm_password"]').select('japan');
    cy.get('[data-testid="changePasswordUpdateBtn"]').click();
  });
});
