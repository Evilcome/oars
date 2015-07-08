/**
 * Module dependencies
 */
var path = require('path');
var async = require('async');
var _ = require('lodash');
var buildDictionary = require('sails-build-dictionary');

/**
 * Oars.prototype._prepare()
 *
 * Prepare for load user config, and bind config and routes
 *
 * @api private
 */
module.exports = function (oars) {

  // TODO: find a more safe way
  function findAppPath() {
    if (oars._appPath) return oars._appPath;

    var cwd = process.cwd();
    var argv = process.argv;

    var index = _.findIndex(argv, function(value) {
      return _.startsWith(value, cwd);
    });

    if (index === -1) {
      return cwd;
    } else {
      return path.dirname(argv[index]);
    }
  }

  function Prepare() {

    this.prepareInfo = function(cb) {

      // prepare for oars info
      var appPath = findAppPath();

      oars.info = {
        appPath: appPath,
        paths: {
          tmp: path.resolve(appPath, '.tmp'),

          // for user's config
          config: path.resolve(appPath, 'config'),

          // server side code
          // for controllers
          controllers: path.resolve(appPath, 'api/controllers'),
          // for policies
          policies: path.resolve(appPath, 'api/policies'),
          // for services
          services: path.resolve(appPath, 'api/services')
        }
      };

      if(cb) cb();
    };

    // prepare user's server-side code
    this.prepareModules = function(cb) {
      var prepare = this;

      async.parallel({
        controllers: prepare.loadControllers,
        policies: prepare.loadPolicies,
        services: prepare.loadServices
      }, function(err, results) {
        if(err) return cb(err);

        oars.modules = results;
        cb(null, oars.modules);
      });
    };

    // load user config from app
    this.loadUserConfig = function (cb) {
      buildDictionary.aggregate({
        dirname   : oars.info.paths.config,
        exclude   : ['locales', 'local.js', 'local.json', 'local.coffee', 'local.litcoffee'],
        excludeDirs: /(locales|env)$/,
        filter    : /(.+)\.(js|json|coffee|litcoffee)$/,
        identity  : false
      }, cb);
    };

    // load app controllers
    this.loadControllers = function (cb) {
      buildDictionary.optional({
        dirname: oars.info.paths.controllers,
        filter: /(.+)Controller\.(js|coffee|litcoffee)$/,
        flattenDirectories: true,
        keepDirectoryPath: true,
        replaceExpr: /Controller/
      }, cb);
    };

    // load app policies
    this.loadPolicies = function (cb) {
      buildDictionary.optional({
        dirname: oars.info.paths.policies,
        filter: /(.+)\.(js|coffee|litcoffee)$/,
        replaceExpr: null,
        flattenDirectories: true,
        keepDirectoryPath: true,
        identity: false
      }, cb);
    },

    // load app services
    this.loadServices = function (cb) {
      buildDictionary.optional({
        dirname : oars.info.paths.services,
        filter : /(.+)\.(js|coffee|litcoffee)$/,
        depth : 1,
        caseSensitive : true,
        identity: false
      }, cb);
    };

    _.bindAll(this);
  }

  Prepare.prototype.bindMiddleware = require('./bind/middleware')(oars);

  Prepare.prototype.bindRoutes = require('./bind/routes')(oars);

  return new Prepare();
};
