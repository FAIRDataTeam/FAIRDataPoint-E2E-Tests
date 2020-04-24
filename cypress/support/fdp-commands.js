import * as $rdf from 'rdflib'


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
        url: apiUrl('/')
    })
        .then((resp) => {
            getTokenFor('admin')
                .then((tokenResp) => {
                    const headers = createHeaders(tokenResp.body.token)

                    const apiUrl = Cypress.env('api_url')
                    const persistentUrl = Cypress.env('persistent_url')

                    const store = $rdf.graph()
                    const subject = $rdf.namedNode(persistentUrl)
                    $rdf.parse(resp.body, store, persistentUrl, 'text/turtle')

                    const catalogs = store.match(subject, $rdf.namedNode('http://www.re3data.org/schema/3-0#dataCatalog'))
                    catalogs.forEach((catalog) => {
                        const url = catalog.object.value.replace(persistentUrl, apiUrl)

                        cy.request({
                            method: 'DELETE',
                            url,
                            headers
                        })
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
                    'Accept': 'text/turtle',
                    'Content-Type': 'text/turtle'
                },
                body: data
            })
        })
        .then((resp) => {
            const parts = resp.headers.location.split('/')
            return parts[parts.length - 1]
        })
}


Cypress.Commands.add('importCatalog', (catalogFixture) => {
    const fixtureMapper = (distribution) => distribution
        .replace('{FDP_HOST}', Cypress.env('persistent_url'))

    return importData(catalogFixture, fixtureMapper, '/catalog')
})


Cypress.Commands.add('importDataset', (datasetFixture, catalogId) => {
    const fixtureMapper = (dataset) => dataset
        .replace('{FDP_HOST}', Cypress.env('persistent_url'))
        .replace('{CATALOG_ID}', catalogId)

    return importData(datasetFixture, fixtureMapper, '/dataset')
})


Cypress.Commands.add('importDistribution', (distributionFixture, datasetId) => {
    const fixtureMapper = (distribution) => distribution
        .replace('{FDP_HOST}', Cypress.env('persistent_url'))
        .replace('{DATASET_ID}', datasetId)

    return importData(distributionFixture, fixtureMapper, '/distribution')
})
