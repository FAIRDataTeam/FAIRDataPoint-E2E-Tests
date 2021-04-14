describe('Resource Definitions', () => {
    let originalResourceDefinitions
    let originalMemberships
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

        cy.task('mongo:delete', {
            collection: 'membership',
            args: {}
        }).then(() => {
            return cy.task('mongo:insert', {
                collection: 'membership',
                objects: originalMemberships
            })
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

        cy.task('mongo:find', {
            collection: 'membership',
            args: {}
        }).then((memberships) => {
            originalMemberships = memberships.map((membership) => {
                delete membership['_id']
                return membership
            })
        })
    })

    beforeEach(() => {
        restoreResourceDefinitions()
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
        cy.visitClient('/resource-definitions')
    })

    after(() => {
        restoreResourceDefinitions()
    })

    it('remove child from parent', () => {
        // Edit dataset resource defintion, removing distribution
        cy.getCy('resource-definition-link').contains('Dataset').click()
        cy.getCy('child.0.remove').click()
        cy.getCy('save').click()

        // Check there is no distribution list
        cy.visitClient(`/dataset/${datasetUuid}`)
        cy.get('h1').contains('Gene disease association (LUMC)')
        cy.getCy('item-list').should('not.exist')
    })

    it('add child to parent', () => {
        // Edit repository resource defintion, add dataset as a child
        cy.getCy('resource-definition-link').contains('Repository').click()
        cy.getCy('add-child').click()
        cy.fillFields({
            's_child.1.resource': '2f08228e-1789-40f8-84cd-28e3288c3604',
            'child.1.relationUri': 'http://www.w3.org/ns/dcat#dataset',
            'child.1.listViewTitle': 'Datasets'
        })
        cy.getCy('save').click()

        // Open Repository and check the empty dataset list view
        cy.visitClient('/')
        cy.get('h2').contains('Datasets').should('exist')
    })

    it('delete resource definition', () => {
        // Delete distribution resource definition
        cy.get('.item-list__item')
            .contains('Distribution')
            .parent().parent().parent()
            .find('.dropdown button')
            .click()
        cy.get('.dropdown-item:visible').contains('Remove').click()
        
        // Check that the dataset resource definition has no children
        cy.getCy('resource-definition-link').contains('Dataset').click()
        cy.get('label').contains('Child Resource').should('not.exist')

        // Check that the dataset details contains no distributions
        cy.visitClient(`/dataset/${datasetUuid}`)
        cy.get('h1').contains('Gene disease association (LUMC)')
        cy.get('h2').should('not.exist')
        cy.get('.status-flash__alert--danger').should('not.exist')
    })

    it('remove external link', () => {
        // Edit distribution resource definition, removing the access online link
        cy.getCy('resource-definition-link').contains('Distribution').click()
        cy.getCy('externalLink.0.remove').click()
        cy.getCy('save').click()

        // Check that the link is gone
        cy.visitClient(`/distribution/${distributionUuid}`)
        cy.get('h1').contains('GDA lumc SPARQL endpoint')
        cy.getCy('external-link').should('not.exist')
    })

    it('add external link', () => {
        // Edit catalog resource definition, adding the access online link
        cy.getCy('resource-definition-link').contains('Catalog').click()
        cy.getCy('add-external-link').click()
        cy.fillFields({
            'externalLink.0.title': 'View language',
            'externalLink.0.propertyUri': 'http://purl.org/dc/terms/language'
        })
        cy.getCy('save').click()

        // Check that the link is there
        cy.visitClient(`/catalog/${catalogUuid}`)
        cy.get('h1').contains('Catalog for textmining datasets')
        cy.getCy('external-link')
            .should('have.attr', 'href', 'http://id.loc.gov/vocabulary/iso639-1/en')
            .and('contain', 'View language')
    })

    it('create a new resource definition', () => {
        // Random string so that the test does not interfere with previous runs
        const hash = btoa(+new Date).slice(-7, -2).toLowerCase()
        const urlPrefix = `book-${hash}`

        // Create book resource definition
        cy.getCy('create-resourceDefinition').click()
        cy.getCy('add-target-class').click()
        cy.fillFields({
            name: `Book ${hash}`,
            urlPrefix,
            'targetClass.0.uri': 'http://www.w3.org/ns/dcat#Resource',
        })
        cy.getCy('save').click()

        // Add book as a new child of repository
        cy.getCy('resource-definition-link').contains('Repository').click()
        cy.getCy('add-child').click()
        cy.fillFields({
            's_child.1.resource': `Book ${hash}`,
            'child.1.relationUri': 'http://example.com/book',
            'child.1.listViewTitle': 'Books'
        })
        cy.getCy('save').click()

        // Check we have books on repository and create a new one
        cy.visitClient('/')
        cy.get('h2')
            .contains('Books')
            .parent()
            .find('[data-cy="create"]').click()
        cy.fillFields({
            title: `My Book ${hash}`,
            hasVersion: '1.2.3',
            name: 'Publisher name'
        })
        cy.getCy('save').click()
        cy.url().should('contain', `/${urlPrefix}/`)
        cy.get('h1').contains('My Book')

        // Check the book is visible in repository list
        cy.visitClient('/')
        cy.getCy('item').contains(`My Book ${hash}`).click()
        cy.url().should('contain', `/${urlPrefix}/`)
        cy.get('h1').contains('My Book')

        // Navigate to settings and add user
        cy.getCy('settings').click()
        cy.get('h1').contains(`My Book ${hash} Settings`)
        cy.get('.vs__search').focus()
        cy.get('.vs__dropdown-menu [data-cy=user-item]').contains('Nikola Tesla').click()
        cy.getMemberships().then(memberships => {
            let membership = memberships.filter(m => m.name === 'Owner')[0].uuid
            cy.get('#user-role').select(membership)
            cy.getCy('invite').click()

            // login as other user and check the access
            cy.logout()
            cy.loginAs('user')
            cy.visitClient('/')
            cy.getCy('item').contains(`My Book ${hash}`).click()
            cy.url().should('contain', `/${urlPrefix}/`)
            cy.get('h1').contains(`My Book ${hash}`)
            cy.getCy('membership-badge').contains('Owner')
        })
    })

    // TODO - doesn't work yet
    it.skip('remove target class', () => {
        // Edit dataset resource defintion, removing dataset target class
        cy.getCy('resource-definition-link').contains('Dataset').click()
        cy.getCy('targetClass.1.remove').click()
        cy.getCy('save').click()

        // Edit dataset and check that the fields are no longer there
        cy.visitClient(`/dataset/${datasetUuid}/edit`)
        cy.get('h1').contains('Gene disease association (LUMC)')
        cy.get('label').contains('Theme').should('not.exist')
        cy.get('label').contains('Keyword').should('not.exist')
    })

    // TODO - doesn't work yet
    it.skip('add target class', () => {
        // Edit repository resource defintion, adding dataset target class
        cy.getCy('resource-definition-link').contains('Repository').click()
        cy.getCy('add-target-class').click()
        cy.fillFields({ 'targetClass.2.uri': 'http://www.w3.org/ns/dcat#Dataset' })
        cy.getCy('save').click()

        // Edit repository and check that the new fields are there
        cy.visitClient(`/edit`)
        cy.get('label').contains('Theme').should('exist')
        cy.get('label').contains('Keyword').should('exist')
    })

    // TODO - doesn't work yet
    it.skip('change url prefix', () => {
        // Edit catalog resource definition, changing the url prefix
        cy.getCy('resource-definition-link').contains('Catalog').click()
        cy.fillFields({ 'urlPrefix': 'book' })
        cy.getCy('save').click()

        // Navigate to the catalog through repostiory and check the new url prefix
        cy.visitClient('/')
        cy.get('.item__title').click()
        cy.url().should('be', `/book/${catalogUuid}`)
    })
})
