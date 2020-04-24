describe.skip('OpenRefine-ext: Store data dialog', () => {
    const projectName = 'Cypress storage-dialog test'
    const dialogTitle = 'Store data to FAIR storage'

    before(() => {
        cy.refineCleanup()
        cy.refineCreateProject(projectName)
    })

    beforeEach(() => {
        cy.refineOpenProject(projectName)
    })

    it('can be opened and closed', () => {
        // Open
        cy.refineMetadataOpen(dialogTitle)
        // Should be opened
        cy.get('.metadata-dialog').should('be.visible')
        // Close
        cy.refineGetBind('closeButton').contains('Close').click()
        // Should be closed
        cy.get('.metadata-dialog').should('not.be.visible')
    })

    it('contains title and storage form', () => {
        // Open
        cy.refineMetadataOpen(dialogTitle)
        // Check title
        cy.refineGetBind('storeDataForm').should('be.visible')
    })
})
