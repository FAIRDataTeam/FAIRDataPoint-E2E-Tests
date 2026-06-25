const N3 = require('n3');

const createHeaders = (token) => ({ Authorization: 'Bearer ' + token })

const getTokenFor = (role) => cy.request({
    method: 'POST',
    url: '/tokens',
    body: {
        email: Cypress.expose(role + '_username'),
        password: Cypress.expose(role + '_password')
    }
})

const sessionKey = () => {
    const apiUrl = Cypress.expose('api_url')
    const clientUrl = Cypress.expose('client_url')
    const prefix = apiUrl === clientUrl ? '' : apiUrl
    return `${prefix}/session`
}


// Authentication

Cypress.Commands.add('loginAs', (role) => {
    getTokenFor(role).then((resp) => {
        const token = resp.body.token

        cy.request({
            method: 'GET',
            url: '/users/current',
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

// Configuration

Cypress.Commands.add('getBootstrapConfig', () => {
    return cy.request({
        method: 'GET',
        url: '/configs/bootstrap'
    }).then(resp => resp.body)
})

Cypress.Commands.add('putResourceDefinition', (definition) => {
    getTokenFor('admin')
        .then((resp) => {
            return cy.request({
                method: 'PUT',
                url: `/resource-definitions/${definition.uuid}`,
                headers: createHeaders(resp.body.token),
                body: definition
            })
        })
})

Cypress.Commands.add('deleteResourceDefinition', (uuid) => {
    getTokenFor('admin')
        .then((resp) => {
            return cy.request({
                method: 'DELETE',
                url: `/resource-definitions/${uuid}`,
                headers: createHeaders(resp.body.token),
            })
        })
})

// Users 

Cypress.Commands.add('createUser', (user) => {
    getTokenFor('admin').then((resp) => {
        cy.request({
            method: 'POST',
            url: '/users',
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
                url: '/memberships',
                headers: createHeaders(resp.body.token),
            })
        })
        .then((resp) => {
            return resp.body
        })
})


// Catalogs

Cypress.Commands.add('clearCatalogs', () => {
    let headers = null

    getTokenFor('admin')
        .then((resp) => {
            headers = createHeaders(resp.body.token)
        })
        .then(() => {
            cy.request({
                headers,
                method: 'GET',
                url: '/'
            })
        })
        .then((resp) => {
            // parse response body into graph
            const parser = new N3.Parser();
            const store = new N3.Store(parser.parse(resp.body))
            // check catalogs
            const persistentUrl = Cypress.expose('persistent_url')
            const subject = N3.DataFactory.namedNode(persistentUrl)
            const predicate = N3.DataFactory.namedNode('https://w3id.org/fdp/fdp-o#metadataCatalog')
            const catalogs = store.match(subject, predicate)
            catalogs.forEach((catalog) => {
                const url = catalog.object.value.replace(persistentUrl, '')
                cy.request({
                    method: 'DELETE',
                    url,
                    headers
                })
            })
        })
})

// Import data

const importData = (fixtureName, fixtureMapper, postUrl) => {
    let data = null
    let uuid = null
    let headers = null
    return cy.fixture(fixtureName)
        .then((fixtureData) => {
            data = fixtureMapper(fixtureData)
            return getTokenFor('admin')
        })
        .then((resp) => {
            headers = createHeaders(resp.body.token)
            return cy.request({
                method: 'POST',
                url: postUrl,
                headers: {
                    ...headers,
                    'Accept': 'text/turtle',
                    'Content-Type': 'text/turtle'
                },
                body: data
            })
        })
        .then((resp) => {
            const parts = resp.headers.location.split('/')
            uuid = parts[parts.length - 1]

            return cy.request({
                method: 'PUT',
                url: `${postUrl}/${uuid}/meta/state`,
                headers: {
                    ...headers,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: { current: "PUBLISHED" }
            })
        })
        .then(() => {
            return uuid
        })
}


Cypress.Commands.add('importCatalog', (catalogFixture) => {
    const fixtureMapper = (distribution) => distribution
        .replace('{FDP_HOST}', Cypress.expose('persistent_url'))

    return importData(catalogFixture, fixtureMapper, '/catalog')
})


Cypress.Commands.add('importDataset', (datasetFixture, catalogId) => {
    const fixtureMapper = (dataset) => dataset
        .replace('{FDP_HOST}', Cypress.expose('persistent_url'))
        .replace('{CATALOG_ID}', catalogId)

    return importData(datasetFixture, fixtureMapper, '/dataset')
})


Cypress.Commands.add('importDistribution', (distributionFixture, datasetId) => {
    const fixtureMapper = (distribution) => distribution
        .replace('{FDP_HOST}', Cypress.expose('persistent_url'))
        .replace('{DATASET_ID}', datasetId)

    return importData(distributionFixture, fixtureMapper, '/distribution')
})


// Download RDF

Cypress.Commands.add('downloadRDF', (url, format) => {
    return cy.request({
        method: 'GET',
        url: `${url}?format=${format}`
    }).then((resp) => {
        if (Array.isArray(resp.body)) {
            return JSON.stringify(resp.body)
        }
        return resp.body
    })
})
