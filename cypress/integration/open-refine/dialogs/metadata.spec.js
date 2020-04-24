describe.skip('OpenRefine-ext: Create metadata dialog', () => {
    const projectName = 'Cypress metadata-dialog test'
    const dialogTitle = 'Create metadata in FAIR Data Point'

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

    it('contains title and FDP form', () => {
        // Open
        cy.refineMetadataOpen(dialogTitle)
        // Check title
        cy.refineGetBind('fdpPostForm').should('be.visible')
    })
})
