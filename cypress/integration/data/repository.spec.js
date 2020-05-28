describe('Repository', () => {
    it('edit', () => {
        cy.loginAs('admin')
        cy.visitClient('/')
        cy.getCy('edit').click()

        // fill `in the new data and save
        const newData = {
            description: 'This is a description of my repository',
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

    const formats = ['ttl', 'rdf', 'jsonld']
    formats.forEach((format) => {
        it(`download RDF (${format})`, () => {
            const url = ''
            const purl = `${Cypress.env('persistent_url')}${url}`

            cy.downloadRDF(url, format).then((respBody) => {
                expect(respBody).to.contain(purl)
                expect(respBody).to.contain('My FAIR Data Point')
            })
        })
    })
})