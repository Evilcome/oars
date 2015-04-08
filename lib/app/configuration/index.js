/**
 * Module dependencies.
 */

var _ = require('lodash');
var path = require('path');
var DEFAULT_HOOKS = require('./defaultHooks');

module.exports = function(oars) {

  /**
   * Expose new instance of `Configuration`
   */

  return new Configuration();


  function Configuration() {


    /**
     * Oars default configuration
     *
     * @api private
     */
    this.defaults = function defaultConfig(appPath) {

      var defaultEnv = oars.config.environment || "development";

      // If `appPath` not specified, unfortunately, this is a fatal error,
      // since reasonable defaults cannot be assumed
      if (!appPath) {
        throw new Error('No `appPath` specified!');
      }

      // Set up config defaults
      return {

        environment: defaultEnv,

        // Default hooks
        // TODO: remove hooks from config to avoid confusion
        // (because you can't configure hooks in `userconfig`-- only in `overrides`)
        hooks: _.reduce(DEFAULT_HOOKS, function (memo, hookName) {
          memo[hookName] = require('../../hooks/'+hookName);
          return memo;
        }, {}) || {},

        // Save appPath in implicit defaults
        // appPath is passed from above in case `oars lift` was used
        // This is the directory where this Oars process is being initiated from.
        // (  usually this means `process.cwd()`  )
        appPath: appPath,

        // Built-in path defaults
        paths: {
          tmp: path.resolve(appPath, '.tmp')
        },

        // Start off `routes` and `middleware` as empty objects
        routes: {},
        middleware: {}

      };
    },



    /**
     * Load the configuration modules
     *
     * @api private
     */

    this.load = require('./load')(oars);

    // Bind the context of all instance methods
    _.bindAll(this);

  }

};
