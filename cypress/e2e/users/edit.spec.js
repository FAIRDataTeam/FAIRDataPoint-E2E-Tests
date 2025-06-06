describe('Users Edit', () => {
    const user = {
        firstName: 'Emma',
        lastName: 'Young',
        email: 'emma.young@example.com',
        role: 'USER',
        password: 'passw0rd'
    }
    const newEmail = 'emma.elizabeth.mcyoung@example.com'

    const getUserItem = (identifier) => {
        return cy.getCy('user-item').contains(identifier).closest('[data-cy=user-item]')
    }

    const openUser = (identifier) => {
        getUserItem(identifier).find('[data-cy=user-link]').click()
    }

    beforeEach(() => {
        cy.task('mongo:delete', {
            collection: 'user',
            args: { email: { $in: [user.email, newEmail] } }
        })
        cy.createUser(user)
        cy.loginAs('admin')
        cy.visitClient('/users')
    })

    it('can edit profile', () => {
        const newUser = {
            email: newEmail,
            firstName: 'Emma Elizabeth',
            lastName: 'McYoung',
            s_role: 'ADMIN'
        }

        // open and update user profile
        openUser(user.email)
        cy.url().should('match', /\/users\/.+/)
        cy.fillFields(newUser)
        cy.getCy('save-profile').click()

        // check that the user has been updated in the list view
        cy.visitClient('/users')
        getUserItem(newEmail)
            .should('contain', newUser.firstName)
            .and('contain', newUser.lastName)
            .and('contain', newUser.s_role)

        // check correct data in detail from
        openUser(newUser.email)
        cy.checkFields(newUser)
    })

    it('can edit password', () => {
        const password = 'newPassw0rd'
        
        // open user and update password
        openUser(user.email)
        cy.url().should('match', /\/users\/.+/)
        cy.fillFields({
            password,
            passwordConfirmation: password
        })
        cy.getCy('update-password').click()

        // logout and try to login with updated password
        cy.logout()
        cy.visitClient('/login')
        cy.fillFields({
            email: user.email,
            password
        })
        cy.getCy('login').click()
        cy.getCy('user-menu').should('exist')
    })
})
