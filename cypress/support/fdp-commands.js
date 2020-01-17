const apiUrl = (url) => `${Cypress.env('api_url')}${url}`

const graphDbUrl = (url) => `${Cypress.env('graphdb_url')}${url}`

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
    const prefix = apiUrl === clientUrl ? '' : apiUrl
    return `${prefix}/session`
}


// Authentication

Cypress.Commands.add('loginAs', (role) => {
    getTokenFor(role).then((resp) => {
        const token = resp.body.token

        cy.request({
            method: 'GET',
            url: apiUrl('/users/current'),
            headers: createHeaders(token)
        }).then((resp) => {
            console.log(sessionKey())
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

// Users 

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


// Memberships

Cypress.Commands.add('getMemberships', () => {
    getTokenFor('admin')
        .then((resp) => {
            return cy.request({
                method: 'GET',
                url: apiUrl('/memberships'),
                headers: createHeaders(resp.body.token),
            })
        })
        .then((resp) => {
            return resp.body
        })
})


// Catalogs

Cypress.Commands.add('clearCatalogs', () => {
    cy.request({
        method: 'GET',
        url: apiUrl('/?format=json')
    }).then((resp) => {
        resp.body.catalogs.forEach((catalog) => {
            cy.request({
                method: 'POST',
                url: graphDbUrl('/repositories/fdp/statements'),
                form: true,
                body: {
                    update: `CLEAR GRAPH <${catalog.uri}>`
                }
            })
        })
    })
})

const importData = (fixtureName, fixtureMapper, postUrl) => {
    let data = null
    return cy.fixture(fixtureName)
        .then((fixtureData) => {
            data = fixtureMapper(fixtureData)
            return getTokenFor('admin')
        })
        .then((resp) => {
            return cy.request({
                method: 'POST',
                url: apiUrl(postUrl),
                headers: {
                    ...createHeaders(resp.body.token),
                    'Accept': 'application/json',
                    'Content-Type': 'text/turtle'
                },
                body: data
            })
        })
        .then((resp) => {
            return resp.body.identifier.uri.localName
        })
}


Cypress.Commands.add('importCatalog', (catalogFixture) => {
    return importData(catalogFixture, f => f, '/catalog')
})


Cypress.Commands.add('importDataset', (datasetFixture, catalogId) => {
    const fixtureMapper = (dataset) => dataset
        .replace('{FDP_HOST}', Cypress.env('api_url'))
        .replace('{CATALOG_ID}', catalogId)

    return importData(datasetFixture, fixtureMapper, '/dataset')
})


Cypress.Commands.add('importDistribution', (distributionFixture, datasetId) => {
    const fixtureMapper = (distribution) => distribution
        .replace('{FDP_HOST}', Cypress.env('api_url'))
        .replace('{DATASET_ID}', datasetId)

    return importData(distributionFixture, fixtureMapper, '/distribution')
})
