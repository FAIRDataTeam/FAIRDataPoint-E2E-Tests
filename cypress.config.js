const { defineConfig } = require('cypress')

module.exports = defineConfig({
  env: {
    client_url: 'http://localhost',
    api_url: 'http://localhost',
    persistent_url: 'http://example.com/fdp/e2e',
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
  videoUploadOnPasses: false,
  numTestsKeptInMemory: 1,
  viewportWidth: 1280,
  viewportHeight: 800,
  projectId: '4bva4n',
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
  },
})
