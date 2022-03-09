describe('Shapes', () => {
    let catalogUuid
    let datasetUuid
    let distributionUuid

    const createShape = (shapeName, shacl) => {
        cy.getCy('create-shape').click()
        cy.url().should('contain', 'shapes/create')
        cy.fillFields({ name: shapeName})
        cy.fixture(`shacl/${shacl}.ttl`).then((fixture) => {
            cy.get('#shape-definition pre').type(fixture, { delay: 0 })
        })
        cy.getCy('create-shape').click()
        cy.url().should('not.contain', 'create')
        cy.getCy('shape-link').contains(shapeName).should('exist')
    }

    const editEntity = (entityPage, fields) => {
        cy.visitClient(entityPage)
        cy.get('.status-flash__alert--danger').should('not.exist')
        cy.getCy('edit').click()
        cy.fillFields(fields)
        cy.getCy('save').click()
        cy.url().should('contain', entityPage)
    }

    const checkMetadataLiteral = (label, value) => {
        cy.get('.entity-metadata__item h3')
            .contains(label)
            .parent()
            .find('p')
                .should('contain', value)
    }

    const checkMetadataUri = (label, href, value) => {
        cy.get('.entity-metadata__item h3')
            .contains(label)
            .parent()
            .find('a')
                .should('have.attr', 'href', href)
                .and('contain', value)
    }

    const deleteExtraShapes = () => {
        cy.task('mongo:delete', {
            collection: 'shape',
            args: {
                 name: { 
                     $in: [
                        'Repository Extra',
                        'Catalog Extra',
                        'Dataset Extra',
                        'Distribution Extra',
                    ]
                }
            }
        })
    }

    beforeEach(() => {
        deleteExtraShapes()
        cy.clearCatalogs()
        cy.importCatalog('data/catalog.ttl').then((uuid) => {
            catalogUuid = uuid
            cy.importDataset('data/dataset.ttl', catalogUuid).then((uuid) => {
                datasetUuid = uuid
                cy.importDistribution('data/distribution.ttl', datasetUuid).then((uuid) => {
                    distributionUuid = uuid
                })
            })
        })
        cy.loginAs('admin')
        cy.visitClient('/shapes')
    })

    after(() => {
        deleteExtraShapes()
    })

    it('repository extra shape', () => {
        const extraUrl = 'http://example.com/extra'
        const extraLiteral = 'Extra Literal'

        createShape('Repository Extra', 'repository-extra')
        editEntity('/', { extraUrl, extraLiteral})
        
        checkMetadataLiteral('Extra literal', extraLiteral)
        checkMetadataUri('Extra url', extraUrl, 'extra')
    })

    it('catalog extra shape', () => {
        const entityPage = `/catalog/${catalogUuid}`
        const extraUrl = 'http://example.com/extra'

        createShape('Catalog Extra', 'catalog-extra')

        // edit catalog with the new fields
        cy.visitClient(entityPage)
        cy.get('.status-flash__alert--danger').should('not.exist')
        cy.getCy('edit').click()
        cy.get('.form__group .btn-link').contains('Add').click({ force: true })
        cy.fillFields({
            extraUrl,
            animalName: 'Rex',
            animalUrl: 'http://example.com/rex'
        })
        cy.getCy('save').click()
        cy.url().should('contain', entityPage)

        checkMetadataUri('Extra url', extraUrl, 'extra')
    })

    it('dataset extra shape', () => {
        const extraUrl = 'http://example.com/extra'
        const extraLiteral = 'Extra Literal'

        createShape('Dataset Extra', 'dataset-extra')
        editEntity(`/dataset/${datasetUuid}`, { extraUrl, extraLiteral})
        
        checkMetadataLiteral('Extra literal', extraLiteral)
        checkMetadataUri('Extra url', extraUrl, 'extra')
    })

    it('distribution extra shape', () => {
        const extraUrl = 'http://example.com/extra'
        const extraLiteral = 'Extra Literal'

        createShape('Distribution Extra', 'distribution-extra')
        editEntity(`/distribution/${distributionUuid}`, { extraUrl, extraLiteral})
        
        checkMetadataLiteral('Extra literal', extraLiteral)
        checkMetadataUri('Extra url', extraUrl, 'extra')
    })
})
