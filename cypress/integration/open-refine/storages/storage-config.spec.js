describe.skip('OpenRefine-ext: Storages config', () => {
    const projectName = 'Cypress storage test'
    const dialogTitle = 'Store data to FAIR storage'

    before(() => {
        cy.refineCleanProjects()
        cy.refineCreateProject(projectName)
    })

    beforeEach(() => {
        cy.refineOpenProject(projectName)
        cy.refineClearConfig()
        cy.refineReloadConfig()
    })

    it('can define various storages', () => {
        // Change storages.yaml configuration file
        cy.refineUseStoragesConfig('openrefine-cfg/storages1.yaml')
        cy.refineReloadConfig()
        // Open storage dialog
        cy.refineMetadataOpen(dialogTitle)
        cy.refineGetBind('storageSelect').find('option').should('have.length', 5)
    })

    it('can allow all formats', () => {
        // Change storages.yaml configuration file
        cy.refineUseStoragesConfig('openrefine-cfg/storages1.yaml')
        cy.refineReloadConfig()
        // Open storage dialog
        cy.refineMetadataOpen(dialogTitle)
        cy.refineGetBind('storageSelect').select('Example FTP (FTP @ localhost/)')
        cy.refineGetBind('fileFormatSelect').find('option').should('have.length', 8)
    })

    it('can allow specific formats', () => {
        // Change storages.yaml configuration file
        cy.refineUseStoragesConfig('openrefine-cfg/storages2.yaml')
        cy.refineReloadConfig()
        // Open storage dialog
        cy.refineMetadataOpen(dialogTitle)
        cy.refineGetBind('storageSelect').select('Example FTP (FTP @ localhost/)')
        cy.refineGetBind('fileFormatSelect').find('option').should('have.length', 3)
    })

    // Cypress does not support file-download yet: https://github.com/cypress-io/cypress/issues/949
})
