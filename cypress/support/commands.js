// Navigation commands

Cypress.Commands.add('visitClient', (url) => {
    cy.visit(`${Cypress.env('client_url')}${url}`)
})


// Selection commands

Cypress.Commands.add('getCy', (key) => {
    return cy.get(`[data-cy=${key}]`)
})


// Form commands

Cypress.Commands.add('fillFields', (fields) => {
    Object.entries(fields).forEach(([key, value]) => {
        if (key.startsWith('s_')) {
            key = key.replace(/^s_/, '')
            cy.get(`[name="${key}"]`).select(value)
        } else {
            if (value.length > 0) {
                cy.get(`[name="${key}"]`).clear().type(value)
            } else {
                cy.get(`[name="${key}"]`).clear()
            }
        }
    })
})
