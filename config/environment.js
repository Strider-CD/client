module.exports = function (environment) {
  var ENV = {
    modulePrefix: 'client',
    podModulePrefix: 'client/pods',
    environment: environment,
    baseURL: '/',
    locationType: 'hash',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  }

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true
    ENV.APP.LOG_ACTIVE_GENERATION = true
    // ENV.APP.LOG_TRANSITIONS = true
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true
    ENV.APP.LOG_VIEW_LOOKUPS = true
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/'
    ENV.locationType = 'none'

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false
    ENV.APP.LOG_VIEW_LOOKUPS = false

    ENV.APP.rootElement = '#ember-testing'
  }

  if (environment === 'production') {
  }
  ENV.CORE_URL = 'http://localhost:8000'
  ENV.CORE_API_PREFIX = '/api/v1'
  ENV.PRIMUS_CLIENT_URL = ENV.CORE_URL + '/primus/primus.js'
  if (process.env.CORE_URL) {
    ENV.CORE_URL = process.env.CORE_URL
  }
  if (process.env.CORE_API_PREFIX) {
    ENV.CORE_API_PREFIX = process.env.CORE_API_PREFIX
  }
  if (process.env.PRIMUS_CLIENT_URL) {
    ENV.PRIMUS_CLIENT_URL = process.env.PRIMUS_CLIENT_URL
  }
  ENV.CORE_FULL_URL = ENV.CORE_URL + ENV.CORE_API_PREFIX

  ENV.contentSecurityPolicy = {
    'default-src': "'none'",
    'script-src': "'self' http://localhost:8000 https://cdn.mxpnl.com", // Allow scripts from https://cdn.mxpnl.com
    'font-src': "'self' http://fonts.gstatic.com", // Allow fonts to be loaded from http://fonts.gstatic.com
    'connect-src': "'self' ws://localhost:8000 http://localhost:8000",
    'img-src': "'self'",
    'style-src': "'self' 'unsafe-inline' http://fonts.googleapis.com", // Allow inline styles and loaded CSS from http://fonts.googleapis.com
    'media-src': "'self'"
  }

  return ENV
}
