describe('Swagger', () => {
    it('works', () => {
        cy.visit('/swagger-ui.html')
        cy.get('h1.title').contains('FAIR Data Point API')

        cy.get('a').contains('Client').click()
        cy.get('a').contains('configs').click()
        cy.get('.btn').contains('Try it out').click()
        cy.get('.btn').contains('Execute').click()
        cy.get('h4')
            .contains('Responses')
            .parent()
            .get('table .response-col_status')
            .contains('200')
    })
})
