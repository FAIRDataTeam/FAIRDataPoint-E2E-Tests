describe('Users Delete', () => {
    const user = {
        firstName: 'Aaron',
        lastName: 'Harper',
        email: 'aaron.harper@example.com',
        role: 'USER',
        password: 'passw0rd'
    }

    const getUserItem = (identifier) => {
        return cy.getCy('user-item').contains(identifier).closest('[data-cy=user-item]')
    }

    beforeEach(() => {
        cy.task('mongo:delete', {
            collection: 'user',
            args: { email: user.email }
        })
        cy.createUser(user)
        cy.loginAs('admin')
        cy.visitClient('/users')
    })

    it('can be deleted', () => {
        getUserItem(user.email).find('.dropdown > button').click()
        cy.contains('Remove').click()
        cy.contains(user.email).should('not.exist')
    })
})
