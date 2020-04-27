describe('OpenRefine-ext: FDP Connection', () => {
    const projectName = 'Cypress fdp-connect test'
    const dialogTitle = 'Create metadata in FAIR Data Point'
    const repositoryName = 'My FAIR Data Point'
    const repositoryPublisher = 'localhost'
    const roles = [{ name: 'admin' }, { name: 'user' }]

    before(() => {
        cy.refineCleanup()
        cy.refineCreateProject(projectName)
    })

    beforeEach(() => {
        cy.refineOpenProject(projectName)
        cy.refineMetadataOpen(dialogTitle)
    })

    roles.forEach((role) => {
        const fdpUri = Cypress.env('api_url')
        const email = Cypress.env(`${role.name}_username`)
        const password = Cypress.env(`${role.name}_password`)

        it(`can be custom with ${role.name} credentials`, () => {
            cy.refineMetadataConnect(fdpUri, email, password)

            cy.refineGetBind('fdpMetadata').should('be.visible')
            cy.refineGetBind('fdpMetadata').contains(repositoryName)
            cy.refineGetBind('fdpMetadata').contains(repositoryPublisher)
            cy.refineGetBind('catalogLayer').should('be.visible')
        })
    })
})
