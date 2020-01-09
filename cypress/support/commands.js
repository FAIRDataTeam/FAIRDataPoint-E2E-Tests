const apiUrl = (url) => `${Cypress.env('api_url')}${url}`

const createHeaders = (token) => ({ Authorization: 'Bearer ' + token })

const getTokenFor = (role) => cy.request({
    method: 'POST',
    url: apiUrl('/tokens'),
    body: {
        email: Cypress.env(role + '_username'),
        password: Cypress.env(role + '_password')
    }
})

const sessionKey = () => {
    const apiUrl = Cypress.env('api_url')
    const clientUrl = Cypress.env('client_url')
    const prefix = apiUrl === clientUrl ? '/' : apiUrl
    return `${prefix}/session`
}


// Authentication commands

Cypress.Commands.add('loginAs', (role) => {
    getTokenFor(role).then((resp) => {
        const token = resp.body.token

        cy.request({
            method: 'GET',
            url: apiUrl('/users/current'),
            headers: createHeaders(token)
        }).then((resp) => {
            window.localStorage.setItem(sessionKey(), JSON.stringify({
                auth: {
                    session: {
                        user: resp.body,
                        token
                    }
                }
            }))
        })
    })
})

Cypress.Commands.add('logout', () => {
    window.localStorage.removeItem(sessionKey())
})


// Users commands

Cypress.Commands.add('createUser', (user) => {
    getTokenFor('admin').then((resp) => {
        cy.request({
            method: 'POST',
            url: apiUrl('/users'),
            headers: createHeaders(resp.body.token),
            body: user
        })
    })
})


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

Cypress.Commands.add('checkFields', (fields) => {
    Object.entries(fields).forEach(([key, value]) => {
        key = key.replace(/^s_/, '')
        cy.get(`[name=${key}]`).should('have.value', value.replace('{{}', '{'))
    })
})
