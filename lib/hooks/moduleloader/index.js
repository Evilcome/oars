module.exports = function(oars) {


  /**
   * Module dependencies
   */

  var path = require('path');
  var async = require('async');
  var _ = require('lodash');
  var buildDictionary = require('sails-build-dictionary');



  /**
   * Module loader
   *
   * Load a module into memory
   */
  return {


    // Default configuration
    defaults: function (config) {

      return {

        // The path to the application
        appPath: config.appPath ? path.resolve(config.appPath) : process.cwd(),

        // Paths for application modules and key files
        // If `paths.app` not specified, use process.cwd()
        // (the directory where this Oars process is being initiated from)
        paths: {

          // Configuration
          //
          // For `userconfig` hook
          config: path.resolve(config.appPath, 'config'),

          // Server-Side Code
          //
          // For `controllers` hook
          controllers: path.resolve(config.appPath, 'api/controllers'),
          // For `policies` hook
          policies: path.resolve(config.appPath, 'api/policies'),
          // For `services` hook
          services: path.resolve(config.appPath, 'api/services'),
          // For `responses` hook
          responses: path.resolve(config.appPath, 'api/responses'),

        }
      };
    },


    initialize: function(cb) {

      // Expose self as `oars.modules` (for backwards compatibility)
      oars.modules = oars.hooks.moduleloader;

      return cb();
    },

    configure: function() {
      
      oars.config.appPath = oars.config.appPath ? path.resolve(oars.config.appPath) : process.cwd();

      _.extend(oars.config.paths, {

        // Configuration
        //
        // For `userconfig` hook
        config: path.resolve(oars.config.appPath, oars.config.paths.config),

        // Server-Side Code
        //
        // For `controllers` hook
        controllers: path.resolve(oars.config.appPath, oars.config.paths.controllers),
        // For `policies` hook
        policies: path.resolve(oars.config.appPath, oars.config.paths.policies),
        // For `services` hook
        services: path.resolve(oars.config.appPath, oars.config.paths.services),
        // For `responses` hook
        responses: path.resolve(oars.config.appPath, oars.config.paths.responses)
      });
    },

    /**
     * Load user config from app
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadUserConfig: function (cb) {
      buildDictionary.aggregate({
        dirname   : oars.config.paths.config || oars.config.appPath + '/config',
        exclude   : ['locales', 'local.js', 'local.json', 'local.coffee', 'local.litcoffee'],
        excludeDirs: /(locales|env)$/,
        filter    : /(.+)\.(js|json|coffee|litcoffee)$/,
        identity  : false
      }, cb);
    },



    /**
     * Load app controllers
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadControllers: function (cb) {
      buildDictionary.optional({
        dirname: oars.config.paths.controllers,
        filter: /(.+)Controller\.(js|coffee|litcoffee)$/,
        flattenDirectories: true,
        keepDirectoryPath: true,
        replaceExpr: /Controller/
      }, cb);
    },



    /**
     * Load app services
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadServices: function (cb) {
      buildDictionary.optional({
        dirname     : oars.config.paths.services,
        filter      : /(.+)\.(js|coffee|litcoffee)$/,
        depth     : 1,
        caseSensitive : true
      }, cb);
    },



    /**
     * Load app policies
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadPolicies: function (cb) {
      buildDictionary.optional({
        dirname: oars.config.paths.policies,
        filter: /(.+)\.(js|coffee|litcoffee)$/,
        replaceExpr: null,
        flattenDirectories: true,
        keepDirectoryPath: true
      }, cb);
    },



    /**
     * Load custom API responses.
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadResponses: function (cb) {
      buildDictionary.optional({
        dirname: oars.config.paths.responses,
        filter: /(.+)\.(js|coffee|litcoffee)$/,
        useGlobalIdForKeyName: true
      }, cb);
    },

    optional: buildDictionary.optional,
    required: buildDictionary.required,
    aggregate: buildDictionary.aggregate,
    exits: buildDictionary.exists

  };

};
