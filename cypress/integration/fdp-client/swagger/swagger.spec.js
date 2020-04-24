describe('Swagger', () => {
    it('works', () => {
        cy.visitClient('/swagger-ui.html')
        cy.get('h2.title').contains('FAIR Data Point API')

        cy.get('a').contains('config-controller').click()
        cy.get('#operations-config-controller-getBootstrapConfigUsingGET').click()
        cy.get('.btn').contains('Try it out').click()
        cy.get('.btn').contains('Execute').click()
        cy.get('h4')
            .contains('Server response')
            .parent()
            .get('table .response-col_status')
            .contains('200')
    })
})
