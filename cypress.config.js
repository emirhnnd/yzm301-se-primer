const { defineConfig } = require('cypress');

// Uygulama linkini BASE_URL ile ver:  $env:CYPRESS_BASE_URL="https://....run.app"
module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    video: true,
    defaultCommandTimeout: 8000,
    viewportWidth: 390,
    viewportHeight: 844,
  },
});
