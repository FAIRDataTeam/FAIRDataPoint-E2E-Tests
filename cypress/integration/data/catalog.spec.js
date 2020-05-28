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

    it('view list', () => {
        cy.visitClient('/')
        cy.get('[data-cy=item-list] [data-cy=item]').contains(catalogName)
    })

    it('view detail', () => {
        cy.visitClient(`/catalog/${catalogUuid}`)

        // check breadcrumbs
        cy.getCy('breadcrumbs-link').contains(repositoryName)
        cy.getCy('breadcrumbs-current').contains(catalogName)
        
        // content
        cy.get('h1').contains(catalogName)
    })

    const roles = ['Owner', 'Data Provider']
    roles.forEach((role) => {
        it(`add user as ${role}`, () => {
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

    it('edit', () => {
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

    it('create', () => {
        cy.loginAs('user')
        cy.visitClient('/')
        cy.getCy('create').click()

        cy.url().should('include', 'create-catalog')
        const data = {
            title: 'My test catalog',
            description: 'This is a description of my test catalog',
            hasVersion: 'v2',
            license: 'http://rdflicense.appspot.com/rdflicense/cc-by-nc-nd4.0',
            language: 'http://id.loc.gov/vocabulary/iso639-1/de',
            name: 'Publisher Name'
        }
        cy.fillFields(data)
        cy.getCy('save').click()
        cy.url().should('not.contain', 'create-catalog')

        cy.get('h1').contains(data.title).should('exist')
        cy.get('.description').contains(data.description).should('exist')
        cy.get('.entity-metadata__item').contains('cc-by-nc-nd4.0').should('have.attr', 'href', data.license)
        cy.get('.entity-metadata__item').contains('de').should('have.attr', 'href', data.language)
        cy.get('.entity-metadata__item').contains(data.hasVersion).should('exist')
    })

    it('delete', () => {
        cy.loginAs('admin')
        cy.visitClient(`/catalog/${catalogUuid}`)
        cy.getCy('delete').click()

        cy.url().should('eq', `${Cypress.env('client_url')}/`)
        cy.get('.item-list__empty').contains('There are no catalogs.').should('exist')
    })

    const formats = ['ttl', 'rdf', 'jsonld']
    formats.forEach((format) => {
        it(`download RDF (${format})`, () => {
            const url = `/catalog/${catalogUuid}`
            const purl = `${Cypress.env('persistent_url')}${url}`

            cy.downloadRDF(url, format).then((respBody) => {
                expect(respBody).to.contain(purl)
                expect(respBody).to.contain(catalogName)
            })
        })
    })
})
