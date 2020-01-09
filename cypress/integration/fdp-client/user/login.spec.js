describe('Login', () => {
    beforeEach(() => {
        cy.visitClient('/login')
    })

    const roles = [{
        role: 'admin',
        adminMenu: true
    }, {
        role: 'user',
        adminMenu: false
    }]

    roles.forEach(({ role, adminMenu }) => {
        it(`can login as ${role}`, () => {
            // login
            cy.fillFields({
                email: Cypress.env(`${role}_username`),
                password: Cypress.env(`${role}_password`)
            })
            cy.getCy('login').click()
            cy.getCy('user-menu').as('user-menu')

            // check correct initials in the user menu
            const firstName = Cypress.env(`${role}_first_name`)
            const lastName = Cypress.env(`${role}_last_name`)
            const initials = firstName[0] + lastName[0]
            cy.get('@user-menu').contains(initials).should('exist')

            // open menu and check correct sections
            cy.get('@user-menu').find('button').click()
            cy.getCy('user-menu-admin').should(adminMenu ? 'be.visible' : 'not.be.visible')
            cy.getCy('user-menu-user').should('be.visible')
        })
    })

    // it('can login as user', () => {
    //     cy.fillFields({
    //         email: Cypress.env('user_username'),
    //         password: Cypress.env('user_password')
    //     })
    //     cy.getCy('login').click()
    //     cy.getCy('user-menu').should('exist').find('button').click()
    //     cy.getCy('user-menu-admin').should('not.visible')
    //     cy.getCy('user-menu-user').should('be.visible')
    // })
})
