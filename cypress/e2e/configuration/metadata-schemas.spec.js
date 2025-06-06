describe('Metadata Schemas', () => {
    const extraSchemaNames = [
        'Repository Extra',
        'Catalog Extra',
        'Dataset Extra',
        'Distribution Extra',
    ]

    let originalResourceDefinitions
    let catalogUuid
    let datasetUuid
    let distributionUuid

    const dummy = {
        "uuid" : "137e2f29-b2f9-4153-9e89-a963cfc2e806",
        "name" : "Dummy",
        "urlPrefix" : "dummy",
        "targetClassUris" : [ 
            "http://www.w3.org/ns/dcat#Resource", 
            "http://www.w3.org/ns/dcat#Catalog"
        ],
        "metadataSchemaUuids": [
            "2aa7ba63-d27a-4c0e-bfa6-3a4e250f4660"
        ],
        "children" : [],
        "externalLinks" : [],
        "_class" : "nl.dtls.fairdatapoint.entity.resource.ResourceDefinition"
    }

    const restoreResourceDefinitions = () => {
        // We add dummy resource definition and delete it using API to prevent cache issues
        cy.task('mongo:delete', {
            collection: 'resourceDefinition',
            args: {}
        }).then(() => {
            return cy.task('mongo:insert', {
                collection: 'resourceDefinition',
                objects: [dummy, ...originalResourceDefinitions]
            })
        }).then(() => {
            cy.deleteResourceDefinition(dummy.uuid)
        })
    }

    const createSchema = (schemaName, shacl) => {
        cy.getCy('create-schema').click()
        cy.url().should('contain', 'schemas/create')
        cy.fillFields({ name: schemaName})
        cy.fixture(`shacl/${shacl}.ttl`).then((fixture) => {
            cy.get('#schema-definition pre').focus().type(fixture, { delay: 0 })
        })
        cy.getCy('save-release').click()
        cy.url().should('contain', 'release')
        cy.fillFields({
            description: 'This is a description',
            major: '1',
            minor: '0',
            patch: '0'
        })
        cy.getCy('save').click()
        cy.url().should('not.contain', 'release')

        cy.getCy('schema-link').contains(schemaName).should('exist')
    }

    const addSchema = (schemaName, resourceName, schemaIndex = 1) => {
        cy.visitClient('/resource-definitions')
        cy.getCy('resource-definition-link').contains(resourceName).click()
        cy.getCy('add-metadata-schema').click()
        cy.get(`[name="metadataSchemaUuids.${schemaIndex}.uuid"]`).select(schemaName)
        cy.getCy('save').click()
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

    const deleteExtraSchemas = () => {
        cy.task('mongo:delete', {
            collection: 'metadataSchema',
            args: {
                 name: { 
                     $in: extraSchemaNames
                }
            }
        })
        cy.task('mongo:delete', {
            collection: 'metadataSchemaDraft',
            args: {
                 name: { 
                     $in: extraSchemaNames
                }
            }
        })
    }

    before(() => {
        cy.task('mongo:find', {
            collection: 'resourceDefinition',
            args: {}
        }).then((resourceDefinitions) => {
            originalResourceDefinitions = resourceDefinitions.map((definition) => {
                delete definition['_id']
                return definition
            })
        })
    })

    beforeEach(() => {
        restoreResourceDefinitions()
        deleteExtraSchemas()
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
        cy.visitClient('/schemas')
    })

    after(() => {
        restoreResourceDefinitions()
        deleteExtraSchemas()
    })

    it('repository extra shape', () => {
        const extraUrl = 'http://example.com/extra'
        const extraLiteral = 'Extra Literal'

        createSchema('Repository Extra', 'repository-extra')
        addSchema('Repository Extra', 'FAIR Data Point', 3)
        editEntity('/', { extraUrl, extraLiteral})
        
        checkMetadataLiteral('Extra literal', extraLiteral)
        checkMetadataUri('Extra url', extraUrl, 'extra')
    })

    it('catalog extra shape', () => {
        const entityPage = `/catalog/${catalogUuid}`
        const extraUrl = 'http://example.com/extra'

        createSchema('Catalog Extra', 'catalog-extra')
        addSchema('Catalog Extra', 'Catalog')

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

        createSchema('Dataset Extra', 'dataset-extra')
        addSchema('Dataset Extra', 'Dataset')
        editEntity(`/dataset/${datasetUuid}`, { extraUrl, extraLiteral})
        
        checkMetadataLiteral('Extra literal', extraLiteral)
        checkMetadataUri('Extra url', extraUrl, 'extra')
    })

    it('distribution extra shape', () => {
        const extraUrl = 'http://example.com/extra'
        const extraLiteral = 'Extra Literal'

        createSchema('Distribution Extra', 'distribution-extra')
        addSchema('Distribution Extra', 'Distribution')
        editEntity(`/distribution/${distributionUuid}`, { extraUrl, extraLiteral})
        
        checkMetadataLiteral('Extra literal', extraLiteral)
        checkMetadataUri('Extra url', extraUrl, 'extra')
    })
})
