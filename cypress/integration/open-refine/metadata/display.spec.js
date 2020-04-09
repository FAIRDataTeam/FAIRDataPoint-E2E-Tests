describe('OpenRefine-ext: Metadata Display', () => {
    const projectName = 'Cypress metadata-display test'
    const dialogTitle = 'Create metadata in FAIR Data Point'
    const fdpUri = Cypress.env('api_url')
    const catalogName = 'Catalog for textmining datasets'
    const datasetName = 'Gene disease association (LUMC)'
    const distributionName = 'GDA lumc SPARQL endpoint'
    let catalogUuid = null
    let datasetUuid = null

    before(() => {
        cy.refineCleanup()
        cy.refineCreateProject(projectName)
    })

    beforeEach(() => {
        cy.clearCatalogs()
        cy.importCatalog('data/catalog.ttl').then(newCatalogUuid => {
            catalogUuid = newCatalogUuid
            cy.importDataset('data/dataset.ttl', newCatalogUuid).then(newDatasetUuid => {
                datasetUuid = newDatasetUuid
                cy.importDistribution('data/distribution.ttl', newDatasetUuid)
            })
        })

        cy.refineOpenProject(projectName)
        cy.refineMetadataOpen(dialogTitle)
    })

    it('shows existing metadata to admin', () => {
        const email = Cypress.env(`admin_username`)
        const password = Cypress.env(`admin_password`)
        cy.refineMetadataConnect(fdpUri, email, password)

        cy.refineGetBind('catalogLayer').should('be.visible')
        cy.refineGetBind('datasetLayer').should('not.be.visible')
        cy.refineGetBind('distributionLayer').should('not.be.visible')

        cy.refineGetBind('catalogSelect').select(catalogName).should('have.value', `${fdpUri}/catalog/${catalogUuid}`)
        cy.refineGetBind('catalogLayer').should('be.visible')
        cy.refineGetBind('datasetLayer').should('be.visible')
        cy.refineGetBind('distributionLayer').should('not.be.visible')

        cy.refineGetBind('datasetSelect').select(datasetName).should('have.value', `${fdpUri}/dataset/${datasetUuid}`)
        cy.refineGetBind('catalogLayer').should('be.visible')
        cy.refineGetBind('datasetLayer').should('be.visible')
        cy.refineGetBind('distributionLayer').should('be.visible')

        cy.get('.distribution-item').should('have.length', 1).and('contain.text', distributionName)
    })

    it('does not show metadata to non-owner user', () => {
        const email = Cypress.env(`user_username`)
        const password = Cypress.env(`user_password`)
        cy.refineMetadataConnect(fdpUri, email, password)

        cy.refineGetBind('catalogLayer').should('be.visible')
        cy.refineGetBind('datasetLayer').should('not.be.visible')
        cy.refineGetBind('distributionLayer').should('not.be.visible')

        cy.refineGetBind('catalogSelect').find('option').not('[disabled]').should('have.length', 0)
    })
})
