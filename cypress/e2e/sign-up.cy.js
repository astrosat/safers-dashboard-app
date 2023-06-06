/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

const username = 'mmb.221177@gmail.com';
const password = 'HelloWorld1';

describe('Sign user up', () => {
  it('Sign up in user', () => {
    //uncomment to intercept post request
    // cy.intercept('POST', 'https://safers-dashboard.herokuapp.com/*', { fixture: 'user.json' });

    cy.visit('http://localhost:3000/auth/sign-up');

    const usernameEl = cy.findByLabelText(/email address:/i);
    usernameEl.type(username);
    usernameEl.should('have.value', username);
    cy.findByLabelText(/first name:/i).type('test');
    cy.findByLabelText(/last name:/i).type('user');
    const passwordEl = cy.findByLabelText(/password:/i);
    passwordEl.type(password);
    passwordEl.should('have.value', password);
    cy.findByLabelText(/select your role:/i).select('Decision Maker');
    cy.findByLabelText(/select your organisation:/i).select(
      'Test Organization',
    );
    cy.findByRole('checkbox').check();
    cy.findByRole('button', { name: /sign up/i }).click();

    // Verify the app redirected you to the dashboard
    cy.location('pathname', { timeout: 10000 }).should('eq', '/dashboard');
  });
});
