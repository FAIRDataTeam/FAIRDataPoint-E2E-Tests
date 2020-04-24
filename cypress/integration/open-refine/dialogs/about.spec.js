describe.skip('OpenRefine-ext: About dialog', () => {
    const projectName = 'Cypress about-dialog test'
    const menuTitle = 'About extension'
    const dialogTitle = 'About metadata extension'

    before(() => {
        cy.refineCleanup()
        cy.refineCreateProject(projectName)
    })

    beforeEach(() => {
        cy.refineOpenProject(projectName)
    })

    it('can be opened and closed', () => {
        // Open
        cy.refineMetadataOpen(menuTitle)
        // Should be opened
        cy.get('.metadata-dialog.about-dialog').should('be.visible')
        // Close
        cy.refineGetBind('closeButton').contains('Close').click()
        // Should be closed
        cy.get('.metadata-dialog.about-dialog').should('not.be.visible')
    })

    it('contains title and GitHub link', () => {
        // Open
        cy.refineMetadataOpen(menuTitle)
        // Check title
        cy.refineGetBind('dialogTitle').contains(dialogTitle)
        // Check GitHub link
        cy.refineGetBind('dialogBody').contains('github.com/FAIRDataTeam/OpenRefine-metadata-extension')
    })
})
