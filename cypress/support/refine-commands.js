Cypress.Commands.add('refineCreateProject', (name) => {
    cy.visitOpenRefine('/')
    cy.get('.create-project-ui-source-selection-tab').contains('Clipboard').click()
    cy.get('#default-importing-clipboard-textarea').type('Dummy data')
    cy.get('#default-importing-clipboard-textarea').parents('form').find('button').click()
    cy.refineGetBind('projectNameInput').clear().type(name)
    cy.get('.default-importing-wizard-header').find('button').contains('Create Project').click()
    cy.url().should('include', '/project').then((url) => {
        cy.visit(url.replace('/__/', '/'))
    })
})

Cypress.Commands.add('refineOpenProject', (name) => {
    cy.visitOpenRefine('/')
    cy.get('.action-area-tab').contains('Open Project').click()
    cy.get('a.project-name').contains(name).click()
    cy.url().should('include', '/project')
})

Cypress.Commands.add('refineCleanProjects', () => {
    cy.visitOpenRefine('')
    cy.on('window:confirm', (str) => {
        return true;
    });
    cy.get('.action-area-tab').contains('Open Project').click()
    cy.get('#projects-container').then(() => {
        if (Cypress.$('.delete-project').length > 0) {
            cy.get('.delete-project').each(() => {
                cy.get('.delete-project').first().click()
            })
        }
    })
})

Cypress.Commands.add('refineGetBind', (key) => {
    return cy.get(`[bind=${key}]`)
})

Cypress.Commands.add('refineMetadataOpen', (name) => {
    cy.get('#extension-bar').find('a').contains('FAIR Metadata').click()
    cy.get('a.menu-item').contains(name).should('be.visible').click()
})

Cypress.Commands.add('refineMetadataConnect', (fdpUri, email, password) => {
    cy.refineGetBind('baseURI').type(fdpUri)
    cy.refineGetBind('email').type(email)
    cy.refineGetBind('password').type(password)
    cy.refineGetBind('connectButton').click()
})
