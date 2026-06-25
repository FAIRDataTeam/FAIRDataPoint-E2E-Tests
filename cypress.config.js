const { defineConfig } = require('cypress')
const registerMongoDBPlugin = require('./cypress/plugins/index.js')

// https://docs.cypress.io/app/references/configuration
module.exports = defineConfig({
  allowCypressEnv: false,
  expose: {
    client_url: 'http://localhost',
    api_url: 'http://localhost',
    persistent_url: 'http://localhost',
    admin_username: 'albert.einstein@example.com',
    admin_password: 'password',
    admin_first_name: 'Albert',
    admin_last_name: 'Einstein',
    user_username: 'nikola.tesla@example.com',
    user_password: 'password',
    user_first_name: 'Nikola',
    user_last_name: 'Tesla',
    mongoUrl: 'mongodb://localhost:27017',
    mongoDBName: 'fdp',
  },
  screenshotsFolder: 'output/screenshots',
  videosFolder: 'output/videos',
  numTestsKeptInMemory: 1,
  viewportWidth: 1280,
  viewportHeight: 800,
  projectId: '4bva4n',
  e2e: {
    // see https://docs.cypress.io/app/core-concepts/best-practices#Setting-a-Global-baseUrl
    baseUrl: 'http://localhost',
    setupNodeEvents(on, config) {
      registerMongoDBPlugin(on, config)
    },
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
  },
})
