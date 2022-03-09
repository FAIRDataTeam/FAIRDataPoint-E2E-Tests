describe('Login', () => {
    beforeEach(() => {
        cy.visitClient('/login')
    })

    const roles = [{
        role: 'admin',
        shouldSeeAdminMenu: true
    }, {
        role: 'user',
        shouldSeeAdminMenu: false
    }]
    roles.forEach(({ role, shouldSeeAdminMenu }) => {
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
            cy.getCy('user-menu-admin').should(shouldSeeAdminMenu ? 'be.visible' : 'not.exist')
            cy.getCy('user-menu-user').should('be.visible')
        })
    })
})
