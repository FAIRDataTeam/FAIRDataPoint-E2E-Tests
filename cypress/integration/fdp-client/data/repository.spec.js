describe('Repository', () => {
    it('can edit', () => {
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
})