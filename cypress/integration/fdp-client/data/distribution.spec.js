describe('Distribution', () => {
    const repositoryName = 'My FAIR Data Point'
    const catalogName = 'Catalog for textmining datasets'
    const datasetName = 'Gene disease association (LUMC)'
    const distributionName = 'GDA lumc SPARQL endpoint'

    let catalogUuid = null
    let datasetUuid = null
    let distributionUuid = null
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
                cy.importDistribution('data/distribution.ttl', datasetUuid).then(newDistributionUuid => {
                    distributionUuid = newDistributionUuid            
                })
            })
        })
    })

    it('displays distribution', () => {
        cy.visitClient(`/dataset/${datasetUuid}`)
        cy.get('[data-cy=distributions] [data-cy=item]').contains(distributionName)
    })

    it('display distribution detail', () => {
        cy.visitClient(`/distribution/${distributionUuid}`)

        // check breadcrumbs
        cy.getCy('breadcrumbs-link').contains(repositoryName)
        cy.getCy('breadcrumbs-link').contains(catalogName)
        cy.getCy('breadcrumbs-link').contains(datasetName)
        cy.getCy('breadcrumbs-current').contains(distributionName)

        // content
        cy.get('h1').contains(distributionName)
    })

    it('can add user as Owner', () => {
        // login as admin and navigate to settings
        cy.loginAs('admin')
        cy.visitClient(`/distribution/${distributionUuid}`)
        cy.getCy('settings').click()
        cy.get('h1').contains(`${distributionName} Settings`)

        // invite user with given role
        cy.get('.vs__search').focus()
        cy.get('.vs__dropdown-menu [data-cy=user-item]').contains('Nikola Tesla').click()
        cy.get('#user-role').select(getMembershipUuid('Owner'))
        cy.getCy('invite').click()

        // login as other user and check the access
        cy.logout()
        cy.loginAs('user')
        cy.visitClient(`/distribution/${distributionUuid}`)
        cy.getCy('membership-badge').contains('Owner')
    })

    it('can edit', () => {
        // login as admin and edit the distribution
        cy.loginAs('admin')
        cy.visitClient(`/distribution/${distributionUuid}`)
        cy.getCy('edit').click()

        // fill in the new data and save
        const newData = {
            title: 'My Distribution',
            description: 'This is a description of my distribution',
            version: '1.2.3',
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
})
