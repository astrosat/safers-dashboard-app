/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

const username = 'mmb.221177@gmail.com';
const password = '123456';

xdescribe('Sign in in', () => {
  it('Logn in user', () => {
    cy.intercept('GET', 'https://safers-dashboard.herokuapp.com/*', {
      fixture: 'user.json',
    });

    cy.visit('http://localhost:3000/auth/sign-in');

    cy.get('[data-testid="sign-in-email"]').type(username);
    cy.get('[data-testid="sign-in-email"]').should('have.value', username);
    cy.get('[data-testid="sign-in-password"]').type(password);
    cy.get('[data-testid="sign-in-password"]').should('have.value', password);

    cy.get('[data-testid="signInButton"]').click();
    // Verify the app redirected you to the dashboard
    cy.location('pathname', { timeout: 10000 }).should('eq', '/dashboard');
  });
});
