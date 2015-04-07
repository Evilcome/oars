/**
 * Module dependencies.
 */

var async = require('async');
var _ = require('lodash');

var _Env = require('./env');
var _Configuration = require('./configuration');


module.exports = function(oars) {
  // var Env = _Env(oars);
  var Configuration = _Configuration(oars);

  /**
   * Expose loader start point.
   * (idempotent)
   *
   * @api public
   */

  return function load(configOverride, cb) {

    // configOverride is optional
    if (_.isFunction(configOverride)) {
      cb = configOverride;
      configOverride = {};
    }

    // Ensure override is an object and clone it (or make an empty object if it's not)
    configOverride = configOverride || {};
    oars.config = _.cloneDeep(configOverride);


    // If host is explicitly specified, set `explicitHost`
    // (otherwise when host is omitted, Express will accept all connections via INADDR_ANY)
    if (configOverride.host) {
      configOverride.explicitHost = configOverride.host;
    }

    async.auto({

      // Apply core defaults and hook-agnostic configuration,
      // esp. overrides including command-line options, environment variables,
      // and options that were passed in programmatically.
      config: [Configuration.load],

      // Apply core env vars of app runtime
      // env: ['config', Env.load],

      // Optionally expose services, oars, _, async, etc. as globals as soon as the
      // globals: ['config', oars.exposeGlobals],

      // Load hooks into memory, with their middleware and routes
      hooks: ['config', loadHooks],

      // Populate the "registry"
      // Houses "middleware-esque" functions bound by various hooks and/or Oars core itself.
      // (i.e. `function (req, res [,next]) {}`)
      //
      // (Basically, that means we grab an exposed `middleware` object,
      // full of functions, from each hook, then make it available as
      // `oars.middleware.[HOOK_ID]`.)
      //
      // TODO: finish refactoring to change "middleware" nomenclature
      // to avoid confusion with the more specific (and more common)
      // usage of the term.
      registry: ['hooks',
        function populateRegistry(cb) {

          oars.log.verbose('Instantiating registry...');

          // Iterate through hooks and absorb the middleware therein
          // Save a reference to registry and expose it on
          // the Oars instance.
          oars.middleware = oars.registry =
          // Namespace functions by their source hook's identity
          _.reduce(oars.hooks, function(registry, hook, identity) {
            registry[identity] = hook.middleware;
            return registry;
          }, {});

          cb();
        }
      ],

      // Load the router and bind routes in `oars.config.routes`
      // router: ['registry', oars.router.load]

    }, ready__(cb));

    // Makes `app.load()` chainable
    return oars;
  };



  /**
   * Load hooks in parallel
   * let them work out dependencies themselves,
   * taking advantage of events fired from the oars object
   *
   * @api private
   */

  function loadHooks(cb) {
    oars.hooks = {};

    // If config.hooks is disabled, skip hook loading altogether
    if (!oars.config.hooks) {
      return cb();
    }


    async.series([

      function(cb) {
        loadHookDefinitions(oars.hooks, cb);
      },
      function(cb) {
        initializeHooks(oars.hooks, cb);
      }
    ], function(err) {
      if (err) return cb(err);

      // Inform any listeners that the initial, built-in hooks
      // are finished loading
      oars.log.verbose('Built-in hooks are ready.');
      return cb();
    });
  }



  /**
   * Load built-in hook definitions from `oars.config.hooks`
   * and put them back into `hooks` (probably `oars.hooks`)
   *
   * @api private
   */

  function loadHookDefinitions(hooks, cb) {

    // Mix in user-configured hook definitions
    _.extend(hooks, oars.config.hooks);

    // Make sure these changes to the hooks object get applied
    // to oars.config.hooks to keep logic consistent
    // (I think we can get away w/o this, but leaving as a stub)
    // oars.config.hooks = hooks;

    // If user configured `loadHooks`, only include those.
    if (oars.config.loadHooks) {
      if (!_.isArray(oars.config.loadHooks)) {
        return cb('Invalid `loadHooks` config.  ' +
          'Please specify an array of string hook names.\n' +
          'You specified ::' + util.inspect(oars.config.loadHooks));
      }

      _.each(hooks, function(def, hookName) {
        if (!_.contains(oars.config.loadHooks, hookName)) {
          hooks[hookName] = false;
        }
      });
      oars.log.verbose('Deliberate partial load-- will only initialize hooks ::', oars.config.loadHooks);
    }

    return cb();
  }


  /**
   * Returns function which is fired when Oars is ready to go
   *
   * @api private
   */

  function ready__(cb) {
    return function(err) {
      if (err) {
        // oars.log.error('Oars encountered the following error:');
        oars.log.error(err);
        return cb && cb(err);
      }

      // Wait until all hooks are ready
      oars.log.verbose('Waiting for all hooks to declare that they\'re ready...');
      var hookTimeout = setTimeout(function tooLong() {
        var hooksTookTooLongErr = 'Hooks are taking way too long to get ready...  ' +
          'Something is amiss.\nAre you using any custom hooks?\nIf so, make sure the hook\'s ' +
          '`initialize()` method is triggering its callback.';
        oars.log.error(hooksTookTooLongErr);
        process.exit(1);
      }, 10000);

      var WHILST_POLL_INTERVAL = 75;

      async.whilst(
        function checkIfAllHooksAreReady() {
          return _.any(oars.hooks, function(hook) {
            return !hook.ready;
          });
        },
        function waitABit(whilst_cb) {
          setTimeout(whilst_cb, WHILST_POLL_INTERVAL);
        },
        function hooksLoaded(err) {
          clearTimeout(hookTimeout);
          if (err) {
            var msg = 'Error loading hooks.';
            oars.log.error(msg);
            return cb && cb(msg);
          }

          oars.log.verbose('All hooks were loaded successfully.');

          // If userconfig hook is turned off, still load globals.
          if (oars.config.hooks && oars.config.hooks.userconfig === false ||
               (oars.config.loadHooks && oars.config.loadHooks.indexOf('userconfig') == -1)) {
                oars.exposeGlobals();
          }


          cb && cb(null, oars);
        }
      );
    };
  }
};
