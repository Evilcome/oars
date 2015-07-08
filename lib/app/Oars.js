var _ = require('lodash');

/**
 * Construct a Oars (app) instance.
 *
 * @constructor
 */

function Oars() {
  // Public methods ------------------------------------------------
  // after app start, this will be restify server instance
  this.server = null;

  // IMPORTANT: start the app use this method
  this.row = require('./row');

  // this method will prepare for all runtime enviroment of app
  this.load = require('./load')(this);

  // when process on error, this method will be call
  this.lower = require('./lower');


  // Private methods -----------------------------------------------
  // start restify server, add event listener on process
  // save app root dirname here
  this._appPath = "";

  this._init = require('./private/init');

  // expose useful vars into global
  this._global = require('./private/global');

  // during server start, this method will prepare for the middleware and routes
  this._prepare = require('./private/prepare')(this);


  _.bindAll(this);


  // level log avaliable
  this.log = require('captains-log')();
}

Oars.prototype.setAppPath = function(appPath) {
  this._appPath = appPath;
}

// Expose Oars constructor
module.exports = Oars;
