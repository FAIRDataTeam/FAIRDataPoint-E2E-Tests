describe('Dataset', () => {
    const repositoryName = 'My FAIR Data Point'
    const catalogName = 'Catalog for textmining datasets'
    const datasetName = 'Gene disease association (LUMC)'

    let catalogUuid = null
    let datasetUuid = null
    let memberships = null

    const getMembershipUuid = (name) => {
        return memberships.filter(m => m.name === name)[0].uuid
    }

    before(() => {
        cy.getMemberships().then(newMemberships => {
            memberships = newMemberships
        })
    })

    beforeEach(() => {
        cy.clearCatalogs()
        cy.importCatalog('data/catalog.ttl').then(newCatalogUuid => {
            catalogUuid = newCatalogUuid

            cy.importDataset('data/dataset.ttl', catalogUuid).then(newDatasetUuid => {
                datasetUuid = newDatasetUuid            
            })
        })
    })

    it('view list', () => {
        cy.visitClient(`/catalog/${catalogUuid}`)
        cy.get('[data-cy=item-list] [data-cy=item]').contains(datasetName)
    })

    it('view detail', () => {
        cy.visitClient(`/dataset/${datasetUuid}`)

        // check breadcrumbs
        cy.getCy('breadcrumbs-link').contains(repositoryName)
        cy.getCy('breadcrumbs-link').contains(catalogName)
        cy.getCy('breadcrumbs-current').contains(datasetName)

        // content
        cy.get('h1').contains(datasetName)
    })

    it('add user as Owner', () => {
        // login as admin and navigate to settings
        cy.loginAs('admin')
        cy.visitClient(`/dataset/${datasetUuid}`)
        cy.getCy('settings').click()
        cy.get('h1').contains(`${datasetName} Settings`)

        // invite user with given role
        cy.get('.vs__search').focus()
        cy.get('.vs__dropdown-menu [data-cy=user-item]').contains('Nikola Tesla').click()
        cy.get('#user-role').select(getMembershipUuid('Owner'))
        cy.getCy('invite').click()

        // login as other user and check the access
        cy.logout()
        cy.loginAs('user')
        cy.visitClient(`/dataset/${datasetUuid}`)
        cy.getCy('membership-badge').contains('Owner')
    })

    it('edit', () => {
        // login as admin and edit the dataset
        cy.loginAs('admin')
        cy.visitClient(`/dataset/${datasetUuid}`)
        cy.getCy('edit').click()

        // fill in the new data and save
        const newData = {
            title: 'My Dataset',
            description: 'This is a description of my dataset',
            hasVersion: '1.2.3',
            license: 'http://rdflicense.appspot.com/rdflicense/cc-by-nc-nd4.0',
            language: 'http://id.loc.gov/vocabulary/iso639-1/de'
        }
        cy.fillFields(newData)
        cy.getCy('save').click()
        cy.url().should('not.contain', 'edit')

        // open edit again and check the values
        cy.getCy('edit').click()
        cy.checkFields(newData)
    })

    it('create', () => {
        cy.loginAs('admin')
        cy.visitClient(`/catalog/${catalogUuid}`)
        cy.getCy('create').click()

        cy.url().should('include', 'create-dataset')
        const data = {
            title: 'My test dataset',
            description: 'This is a description of my test dataset',
            hasVersion: 'v2',
            license: 'http://rdflicense.appspot.com/rdflicense/cc-by-nc-nd4.0',
            language: 'http://id.loc.gov/vocabulary/iso639-1/de',
            name: 'Publisher Name',
            theme: 'http://example.com/theme'
        }
        cy.fillFields(data)
        cy.getCy('save').click()
        cy.url().should('not.contain', 'create-dataset')

        cy.get('h1').contains(data.title).should('exist')
        cy.get('.description').contains(data.description).should('exist')
        cy.get('.entity-metadata__item').contains('cc-by-nc-nd4.0').should('have.attr', 'href', data.license)
        cy.get('.entity-metadata__item').contains('de').should('have.attr', 'href', data.language)
        cy.get('.entity-metadata__item').contains(data.hasVersion).should('exist')
    })

    it('delete', () => {
        cy.loginAs('admin')
        cy.visitClient(`/dataset/${datasetUuid}`)
        cy.getCy('delete').click()

        cy.url().should('include', `/catalog/${catalogUuid}`)
        cy.get('.item-list__empty').contains('There are no datasets.').should('exist')
    })
})
