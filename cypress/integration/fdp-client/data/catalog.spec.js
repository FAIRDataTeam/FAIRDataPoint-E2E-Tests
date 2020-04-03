describe('Catalog', () => {
    const repositoryName = 'My FAIR Data Point'
    const catalogName = 'Catalog for textmining datasets'
    
    let catalogUuid = null
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
        cy.clearCatalogs();
        cy.importCatalog('data/catalog.ttl').then(newCatalogUuid => {
            catalogUuid = newCatalogUuid
        })
    })

    it('displays catalog', () => {
        cy.visitClient('/')
        cy.get('[data-cy=catalogs] [data-cy=item]').contains(catalogName)
    })

    it('displays catalog detail', () => {
        cy.visitClient(`/catalog/${catalogUuid}`)

        // check breadcrumbs
        cy.getCy('breadcrumbs-link').contains(repositoryName)
        cy.getCy('breadcrumbs-current').contains(catalogName)
        
        // content
        cy.get('h1').contains(catalogName)
    })

    const roles = ['Owner', 'Data Provider']
    roles.forEach((role) => {
        it(`can add user as ${role}`, () => {
            // login as admin and navigate to settings
            cy.loginAs('admin')
            cy.visitClient(`/catalog/${catalogUuid}`)
            cy.getCy('settings').click()
            cy.get('h1').contains(`${catalogName} Settings`)

            // invite user with given role
            cy.get('.vs__search').focus()
            cy.get('.vs__dropdown-menu [data-cy=user-item]').contains('Nikola Tesla').click()
            cy.get('#user-role').select(getMembershipUuid(role))
            cy.getCy('invite').click()

            // login as other user and check the access
            cy.logout()
            cy.loginAs('user')
            cy.visitClient(`/catalog/${catalogUuid}`)
            cy.getCy('membership-badge').contains(role)
        })
    })

    it('can edit', () => {
        // login as admin and edit the catalog
        cy.loginAs('admin')
        cy.visitClient(`/catalog/${catalogUuid}`)
        cy.getCy('edit').click()

        // fill in the new data and save
        const newData = {
            title: 'My Catalog',
            description: 'This is a description of my catalog',
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
})
