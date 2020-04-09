const openrefineUrl = (url) => `${Cypress.env('open_refine_url')}${url}`

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

Cypress.Commands.add('refineCleanup', () => {
    cy.refineCleanProjects()
    cy.refineClearConfig()
    cy.refineReloadConfig()
})

Cypress.Commands.add('refineReloadConfig', () => cy.request({
        method: 'POST',
        url: openrefineUrl('/command/metadata/service'),
        body: {
            task: 'RELOAD_CONFIG'
        }
    })
)

Cypress.Commands.add('refineClearConfig', () => {
    cy.writeFile(Cypress.env('open_refine_settings'), '# empty file\n')
    cy.writeFile(Cypress.env('open_refine_storages'), '# empty file\n')
})

Cypress.Commands.add('refineUseSettingsConfig', (fixtureName) => {
    cy.fixture(fixtureName).then((fixtureData) => {
        cy.writeFile(Cypress.env('open_refine_settings'), fixtureData)
    })
})

Cypress.Commands.add('refineUseStoragesConfig', (fixtureName) => {
    cy.fixture(fixtureName).then((fixtureData) => {
        cy.writeFile(Cypress.env('open_refine_storages'), fixtureData)
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
