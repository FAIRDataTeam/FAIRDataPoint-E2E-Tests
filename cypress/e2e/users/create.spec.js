describe('Users Create', () => {
    const user = {
        firstName: 'Noah',
        lastName: 'Hamilton',
        email: 'noah.hamilton@example.com',
        s_role: 'USER',
        password: 'passw0rd',
        passwordConfirmation: 'passw0rd'
    }

    beforeEach(() => {
        cy.task('mongo:delete', {
            collection: 'user',
            args: { email: user.email }
        })
        cy.loginAs('admin')
        cy.visitClient('/users')
    })

    it('can be created', () => {
        // create a new user
        cy.getCy('create-user').click()
        cy.fillFields(user)
        cy.getCy('create-user').click()

        // check that the new user has been created
        cy.url().should('match', /\/users$/)
        cy.get('.item-list__item').contains(`${user.firstName} ${user.lastName}`).should('exist')

        // check that the new user can log in
        cy.logout()
        cy.visitClient('/login')
        cy.fillFields({
            email: user.email,
            password: user.password
        })
        cy.getCy('login').click()
        cy.getCy('user-menu').should('exist')
    })
})
