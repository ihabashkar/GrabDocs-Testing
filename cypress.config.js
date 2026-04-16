const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://app.grabdocs.com',
    experimentalSessionAndOrigin: true
  }
});