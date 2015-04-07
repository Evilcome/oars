var _ = require('lodash');

/**
 * Construct a Oars (app) instance.
 *
 * @constructor
 */

function Oars() {
	this.load = require('./load')(this);
	this.log = require('captains-log')();
  
  // Bind `this` context for all `Sails.prototype.*` methods
  this.load = _.bind(this.load, this);
  this.row = _.bind(this.row, this);
  this.lower = _.bind(this.lower, this);
  this.visit = _.bind(this.visit, this);
  this.initialize = _.bind(this.initialize, this);
  this.exposeGlobals = _.bind(this.exposeGlobals, this);
  this.getHost = _.bind(this.getHost, this);
}

// Private methods:
Oars.prototype.initialize = require('./private/initialize');
Oars.prototype.exposeGlobals = require('./private/exposeGlobals');
Oars.prototype.getHost = require('./private/getHost');

// Public methods
Oars.prototype.row = require('./row');
Oars.prototype.lower = require('./lower');
Oars.prototype.visit = require('./visit');

// Expose Oars constructor
module.exports = Oars;
