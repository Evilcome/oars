/**
 * Module dependencies.
 */

var events = require('events');
var _ = require('lodash');
var util = require('util');
var mixinAfter = require('./private/after');
// var __Router = require('../router');


/**
 * Construct a Oars (app) instance.
 *
 * @constructor
 */

function Oars() {

  // Inherit methods from EventEmitter
  events.EventEmitter.call(this);

  // Remove memory-leak warning about max listeners
  // See: http://nodejs.org/docs/latest/api/events.html#events_emitter_setmaxlisteners_n
  this.setMaxListeners(0);

  // Ensure CaptainsLog exists
  this.log = require('captains-log')();

  // Build a Router instance (which will attach itself to the oars object)
  // __Router(this);

  // Mixin `load()` method to load the pieces of an Oars app
  this.load = require('./load')(this);

  // Mixin support for `Oars.prototype.after()`
  mixinAfter(this);

  // Bind `this` context for all `Oars.prototype.*` methods
  this.row = _.bind(this.row, this);
  this.lower = _.bind(this.lower, this);
  this.load = _.bind(this.load, this);
  this.visit = _.bind(this.visit, this);
  this.initialize = _.bind(this.initialize, this);
  this.exposeGlobals = _.bind(this.exposeGlobals, this);
  this.runBootstrap = _.bind(this.runBootstrap, this);
  this.getHost = _.bind(this.getHost, this);
  this.inspect = _.bind(this.inspect, this);
  this.toString = _.bind(this.toString, this);
  this.toJSON = _.bind(this.toJSON, this);
}


// Extend from EventEmitter to allow hooks to listen to stuff
util.inherits(Oars, events.EventEmitter);


// Public methods
////////////////////////////////////////////////////////
Oars.prototype.row = require('./row');
Oars.prototype.lower = require('./lower');
Oars.prototype.visit = require('./visit');


// Private methods:
////////////////////////////////////////////////////////
Oars.prototype.initialize = require('./private/initialize');
Oars.prototype.exposeGlobals = require('./private/exposeGlobals');
Oars.prototype.runBootstrap = require('./private/bootstrap');
Oars.prototype.getHost = require('./private/getHost');


// Presentation
Oars.prototype.inspect = require('./private/inspect');
Oars.prototype.toString = require('./private/toString');
Oars.prototype.toJSON = require('./private/toJSON');


// Utilities
// Includes lodash, node's `util`, and a few additional
// static helper methods.
// (may be deprecated in a future release)
Oars.prototype.util = require('sails-util');

// Expose Oars constructor
module.exports = Oars;
