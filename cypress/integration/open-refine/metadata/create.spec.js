describe.skip('OpenRefine-ext: Metadata Create', () => {
    const projectName = 'Cypress metadata-create test'
    const dialogTitle = 'Create metadata in FAIR Data Point'
    const fdpUri = Cypress.env('api_url')
    const catalogName = 'Catalog for textmining datasets'
    const datasetName = 'Gene disease association (LUMC)'

    const newCatalogMinimal = {
        'title': 'My catalog 001',
        'version': 'v1.0.0',
        'publisher': 'http://publisher',
        'publisherName': 'Publisher',
        'themeTaxonomies[0]': 'http://taxonomy0'
    }

    const newCatalogComplex = {
        'title': 'My catalog 002',
        'version': 'v1.0.0',
        'publisher': 'http://publisher',
        'publisherName': 'Publisher',
        'description': 'My catalog description',
        'language': 'http://id.loc.gov/vocabulary/iso639-1/eng',
        'license': 'http://purl.org/NET/rdflicense/MIT1.5',
        'rights': 'http://rights123',
        'homepage': 'http://catalog-homepage.com',
        'themeTaxonomies[0]': 'http://taxonomy0',
        'themeTaxonomies[1]': 'http://taxonomy1',
        'themeTaxonomies[2]': 'http://taxonomy2',
    }

    const newDatasetMinimal = {
        'title': 'My dataset 001',
        'version': 'v1.0.0',
        'publisher': 'http://publisher',
        'publisherName': 'Publisher',
        'themes[0]': 'http://theme0'
    }

    const newDatasetComplex = {
        'title': 'My dataset 002',
        'version': 'v1.0.0',
        'publisher': 'http://publisher',
        'publisherName': 'Publisher',
        'description': 'My dataset description',
        'language': 'http://id.loc.gov/vocabulary/iso639-1/eng',
        'license': 'http://purl.org/NET/rdflicense/MIT1.1',
        'rights': 'http://rights123',
        'themes[0]': 'http://theme0',
        'themes[1]': 'http://theme1',
        'themes[2]': 'http://theme2',
        'contactPoint': 'http://dataset.com/contact',
        'keywords[1]': 'Keyword 1',
        'keywords[2]': 'Keyword 2',
        'keywords[3]': 'Keyword 3',
        'landingPage': 'http://dataset.com/landing',
    }

    const newDistributionMinimal = {
        'title': 'My dataset 001',
        'license': 'http://purl.org/NET/rdflicense/MIT1.1',
        'version': 'v1.0.0',
        'publisher': 'http://publisher',
        'publisherName': 'Publisher',
        'mediaType': 'text/x-turtle',
        'downloadUrl': 'http://download'
    }

    const newDistributionComplex = {
        'title': 'My dataset 002',
        'license': 'http://purl.org/NET/rdflicense/MIT1.1',
        'version': 'v1.0.0',
        'rights': 'http://rights123',
        'description': 'My dataset description',
        'format': 'My custom format',
        'bytesize': '1024',
        'publisher': 'http://publisher',
        'publisherName': 'Publisher',
        'mediaType': 'text/x-turtle',
        'accessUrl': 'http://access'
    }

    before(() => {
        cy.refineCleanProjects()
        cy.refineCreateProject(projectName)
    })

    beforeEach(() => {
        cy.clearCatalogs()
        cy.importCatalog('data/catalog.ttl').then(newCatalogUuid => {
            cy.importDataset('data/dataset.ttl', newCatalogUuid).then(newDatasetUuid => {
                cy.importDistribution('data/distribution.ttl', newDatasetUuid)
            })
        })

        cy.refineOpenProject(projectName)
        cy.refineMetadataOpen(dialogTitle)
        
        const email = Cypress.env(`admin_username`)
        const password = Cypress.env(`admin_password`)
        cy.refineMetadataConnect(fdpUri, email, password)
    })

    it('can create minimal catalog', () => {
        cy.refineGetBind('catalogAddButton').click()
        cy.contains('Add new catalog to FAIR Data Point')

        cy.refineGetBind('metadataForm').should('be.visible')
        cy.fillFields(newCatalogMinimal)
        cy.get('button[type=submit]').contains('Add catalog').click()

        cy.refineGetBind('metadataForm').should('not.be.visible')
        cy.refineGetBind('catalogSelect').should('be.visible')
        cy.refineGetBind('catalogSelect').contains(`${newCatalogMinimal.title} [new]`)

        // TODO: Verify fields
    })

    it('can create complex catalog', () => {
        cy.refineGetBind('catalogAddButton').click()
        cy.contains('Add new catalog to FAIR Data Point')

        cy.refineGetBind('metadataForm').should('be.visible')
        // Display optional fields
        cy.get('textarea#description').should('not.be.visible')
        cy.refineGetBind('optionalShowButton').should('be.visible')
        cy.refineGetBind('optionalHideButton').should('not.be.visible')
        cy.refineGetBind('optionalShowButton').click()
        cy.get('textarea#description').scrollIntoView().should('be.visible')
        cy.refineGetBind('optionalShowButton').should('not.be.visible')
        cy.refineGetBind('optionalHideButton').should('be.visible')
        // Add fields for more taxonomies
        cy.get('#themeTaxonomies').within(() => {
            cy.get('button.button-multiple-add').last().click()
            cy.get('button.button-multiple-add').last().click()
            cy.get('button.button-multiple-add').last().click()
            cy.get('button.button-multiple-delete').last().click()
        })

        cy.fillFields(newCatalogComplex)
        cy.get('button[type=submit]').contains('Add catalog').click()

        cy.refineGetBind('metadataForm').should('not.be.visible')
        cy.refineGetBind('catalogSelect').should('be.visible')
        cy.refineGetBind('catalogSelect').contains(`${newCatalogComplex.title} [new]`)

        // TODO: Verify fields
    })

    it('can create minimal dataset', () => {
        cy.refineGetBind('catalogSelect').select(catalogName)
        cy.refineGetBind('datasetAddButton').click()
        cy.contains('Add new dataset to catalog')

        cy.refineGetBind('metadataForm').should('be.visible')
        cy.fillFields(newDatasetMinimal)
        cy.get('button[type=submit]').contains('Add dataset').click()

        cy.refineGetBind('metadataForm').should('not.be.visible')
        cy.refineGetBind('datasetSelect').should('be.visible')
        cy.refineGetBind('datasetSelect').contains(`${newDatasetMinimal.title} [new]`)

        // TODO: Verify fields
    })

    it('can create complex dataset', () => {
        cy.refineGetBind('catalogSelect').select(catalogName)
        cy.refineGetBind('datasetAddButton').click()
        cy.contains('Add new dataset to catalog')

        cy.refineGetBind('metadataForm').should('be.visible')
        // Display optional fields
        cy.get('textarea#description').should('not.be.visible')
        cy.refineGetBind('optionalShowButton').should('be.visible')
        cy.refineGetBind('optionalHideButton').should('not.be.visible')
        cy.refineGetBind('optionalShowButton').click()
        cy.get('textarea#description').scrollIntoView().should('be.visible')
        cy.refineGetBind('optionalShowButton').should('not.be.visible')
        cy.refineGetBind('optionalHideButton').should('be.visible')
        // Add fields for more taxonomies
        cy.get('#themes').within(() => {
            cy.get('button.button-multiple-add').last().click()
            cy.get('button.button-multiple-add').last().click()
        })
        cy.get('#keywords').within(() => {
            cy.get('button.button-multiple-add').last().click()
            cy.get('button.button-multiple-add').last().click()
            cy.get('button.button-multiple-add').last().click()
            cy.get('button.button-multiple-delete').first().click()
        })

        cy.fillFields(newDatasetComplex)
        cy.get('button[type=submit]').contains('Add dataset').click()

        cy.refineGetBind('metadataForm').should('not.be.visible')
        cy.refineGetBind('datasetSelect').should('be.visible')
        cy.refineGetBind('datasetSelect').contains(`${newDatasetComplex.title} [new]`)

        // TODO: Verify fields
    })

    it('can create minimal distribution', () => {
        cy.refineGetBind('catalogSelect').select(catalogName)
        cy.refineGetBind('datasetSelect').select(datasetName)
        cy.refineGetBind('distributionAddButton').click()
        cy.contains('Add new distribution to dataset')

        cy.refineGetBind('metadataForm').should('be.visible')
        cy.get('input#targetUrl-downloadUrl').check()
        cy.fillFields(newDistributionMinimal)
        cy.get('button[type=submit]').contains('Add distribution').click()

        cy.refineGetBind('metadataForm').should('not.be.visible')
        cy.refineGetBind('distributionsList').should('be.visible')
        cy.refineGetBind('distributionsList').contains(`${newDistributionMinimal.title} [new]`)

        // TODO: Verify fields
    })

    it('can create complex distribution', () => {
        cy.refineGetBind('catalogSelect').select(catalogName)
        cy.refineGetBind('datasetSelect').select(datasetName)
        cy.refineGetBind('distributionAddButton').click()

        cy.contains('Add new distribution to dataset')
        // Display optional fields
        cy.get('textarea#description').should('not.be.visible')
        cy.refineGetBind('optionalShowButton').should('be.visible')
        cy.refineGetBind('optionalHideButton').should('not.be.visible')
        cy.refineGetBind('optionalShowButton').click()
        cy.get('textarea#description').scrollIntoView().should('be.visible')
        cy.refineGetBind('optionalShowButton').should('not.be.visible')
        cy.refineGetBind('optionalHideButton').should('be.visible')
        
        cy.get('input#targetUrl-accessUrl').check()
        cy.fillFields(newDistributionComplex)
        cy.get('button[type=submit]').contains('Add distribution').click()


        cy.refineGetBind('metadataForm').should('not.be.visible')
        cy.refineGetBind('distributionsList').should('be.visible')
        cy.refineGetBind('distributionsList').contains(`${newDistributionComplex.title} [new]`)

        // TODO: Verify fields
    })
})
