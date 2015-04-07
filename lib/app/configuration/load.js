/**
 * Module dependencies.
 */

var _ = require('lodash');
var async = require('async');
var path = require('path');


module.exports = function(oars) {

  /**
   * Expose Configuration loader
   *
   * Load command-line overrides
   *
   * TODO: consider merging this into the `app` directory
   *
   * For reference, config priority is:
   * --> implicit defaults
   * --> environment variables
   * --> user config files
   */

  return function loadConfig(cb) {

    // Save reference to context for use in closures
    var self = this;

    // Commence with loading/validating/defaulting all the rest of the config
    async.auto({


        /**
         * This step clones this into an "overrides" object, negotiating cmdline
         * shortcuts into the properly namespced oars configuration options.
         */
        mapOverrides: function(cb) {

          // Clone the `overrides` that were passed in.
          var overrides = _.cloneDeep(oars.config || {});

          // Map Oars options from overrides
          overrides = _.merge(overrides, {

            // `--port=?` command-line argument
            port: overrides.port || 3000,

            // `--prod` command-line argument
            environment: overrides.prod ? 'production' : (overrides.dev ? 'development' : undefined)

          });


          // Pass on overrides object
          cb(null, overrides);
        },


        /**
         * Ensure that environment variables are applied to important configs
         */
        mixinDefaults: ['mapOverrides',
          function(cb, results) {

            // Get overrides
            var overrides = results.mapOverrides; //_.cloneDeep(results.mapOverrides);

            // Apply environment variables
            // (if the config values are not set in overrides)
            overrides.environment = overrides.environment || process.env.NODE_ENV;
            overrides.port = overrides.port || process.env.PORT;

            // Generate implicit, built-in framework defaults for the app
            var implicitDefaults = self.defaults(overrides.appPath || process.cwd());

            // Extend copy of implicit defaults with user config
            var mergedConfig = _.merge(_.cloneDeep(implicitDefaults), overrides);

            // Setting an environment var explicitly to "undefined" sets it to the
            // *string* "undefined".  So we have to check if there's something to set first.
            if (mergedConfig.environment) {
              process.env['NODE_ENV'] = mergedConfig.environment;
            }

            cb(null, mergedConfig);
          }
        ]

      },


      function configLoaded(err, results) {
        if (err) {
          oars.log.error('Error encountered loading config ::\n', err);
          return cb(err);
        }

        // Override the previous contents of oars.config with the new, validated
        // config w/ defaults and overrides mixed in the appropriate order.
        oars.config = results.mixinDefaults;

        cb();
      });
  };

};
