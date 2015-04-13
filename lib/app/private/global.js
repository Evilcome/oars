/**
 * Module dependencies.
 */

var _ = require('lodash');
var async = require('async');
var restify = require('restify');


/**
 * exposeGlobals()
 *
 * Expose certain global variables
 * (if config says so)
 *
 * @api private
 */

module.exports = function (cb) {
  var oars = this;

  oars.log.verbose('Exposing global variables... (you can disable this by modifying the properties in `oars.config.globals`)');

  // Globals explicitly disabled
  if (oars.config.globals === false) {
    return;
  }

  oars.config.globals = oars.config.globals || {};

  // Provide global access (if allowed in config)
  if (oars.config.globals._ !== false) {
    global['_'] = _;
  }
  if (oars.config.globals.async !== false) {
    global['async'] = async;
  }
  if (oars.config.globals.oars !== false) {
    global['oars'] = oars;
  }
  if (oars.config.globals.restify !== false) {
    global['restify'] = restify;
  }

  // `services` hook takes care of globalizing services (if enabled)
  
  if(cb) cb(null, oars);
};
