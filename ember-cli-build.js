/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app')
var mergeTrees = require('broccoli-merge-trees')
var pickFiles = require('broccoli-static-compiler')

module.exports = function (defaults) {
  var app = new EmberApp(defaults, {
    // Add options here
  })

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.
  app.import('bower_components/bootstrap/dist/js/bootstrap.js')
  app.import('bower_components/blueimp-md5/js/md5.js')
  app.import('bower_components/ansi_up/ansi_up.js')

  var glyphs = pickFiles('bower_components/bootstrap/dist/fonts', {
    srcDir: '/',
    files: ['**/*'],
    destDir: '/fonts'
  })

  // Copy fontawesome fonts
  var fonts = pickFiles('bower_components/font-awesome/fonts', {
    srcDir: '/',
    files: ['**/*'],
    destDir: '/assets/fonts'
  })

  return app.toTree([app.toTree(), fonts, glyphs])
}
