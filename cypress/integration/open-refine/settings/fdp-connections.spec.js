describe('OpenRefine-ext: Settings - FDP connections', () => {
    const projectName = 'Cypress settings test'
    const dialogTitle = 'Create metadata in FAIR Data Point'

    before(() => {
        cy.refineCleanup()
        cy.refineCreateProject(projectName)
    })

    beforeEach(() => {
        cy.refineOpenProject(projectName)
        cy.refineClearConfig()
        cy.refineReloadConfig()
    })

    it('can use predefined FDP connections', () => {
        // Change settings.yaml configuration file
        cy.refineUseSettingsConfig('openrefine-cfg/settings1.yaml')
        cy.refineReloadConfig()
        // Open metadata dialog
        cy.refineMetadataOpen(dialogTitle)
        // Get select field
        cy.refineGetBind('fdpConnectionSelect').select('My local FDP #01 (Albert Einstein) @ http://localhost')
        cy.refineGetBind('connectButton').click()
        cy.refineGetBind('catalogSelect').should('be.visible')
    })

    it('can switch predefined FDP connections', () => {
        // Change settings.yaml configuration file
        cy.refineUseSettingsConfig('openrefine-cfg/settings1.yaml')
        cy.refineReloadConfig()
        // Open metadata dialog
        cy.refineMetadataOpen(dialogTitle)
        // Get select field
        cy.refineGetBind('fdpConnectionSelect').select('My local FDP #01 (Nikola Tesla) @ http://localhost')
        cy.refineGetBind('connectButton').click()
        cy.refineGetBind('catalogSelect').should('be.visible')
        cy.refineGetBind('fdpConnectionSelect').select('My local FDP #01 (Albert Einstein) @ http://localhost')
        cy.refineGetBind('catalogSelect').should('not.be.visible')
        cy.refineGetBind('connectButton').click()
        cy.refineGetBind('catalogSelect').should('be.visible')
    })

    it('can still use custom FDP connections', () => {
        const fdpUri = Cypress.env('api_url')
        const email = Cypress.env('admin_username')
        const password = Cypress.env('admin_password')
        // Change settings.yaml configuration file
        cy.refineUseSettingsConfig('openrefine-cfg/settings1.yaml')
        cy.refineReloadConfig()
        // Open metadata dialog
        cy.refineMetadataOpen(dialogTitle)
        // Get select field
        cy.refineGetBind('fdpConnectionSelect').select('Custom FDP connection')
        cy.refineMetadataConnect(fdpUri, email, password)
        cy.refineGetBind('catalogSelect').should('be.visible')
    })

    it('can forbid custom FDP connections', () => {
        // Change settings.yaml configuration file
        cy.refineUseSettingsConfig('openrefine-cfg/settings2.yaml')
        cy.refineReloadConfig()
        // Open metadata dialog
        cy.refineMetadataOpen(dialogTitle)
        // Get select field
        cy.refineGetBind('fdpConnectionSelect').get('Custom FDP connection').should('not.exist')
    })

    it('can preselect specific FDP connection', () => {
        // Change settings.yaml configuration file
        cy.refineUseSettingsConfig('openrefine-cfg/settings2.yaml')
        cy.refineReloadConfig()
        // Open metadata dialog
        cy.refineMetadataOpen(dialogTitle)
        // Get select field
        cy.refineGetBind('fdpConnectionSelect').find(':selected').contains('My local FDP #01 (Nikola Tesla) @ http://localhost')
    })
})
