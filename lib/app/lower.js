/**
 * Module dependencies.
 */

var async = require('async');
var _ = require('lodash');


/**
 * Oars.prototype.lower()
 *
 * The inverse of `row()`, this method
 * shuts down all attached servers.
 *
 * It also unbinds listeners and terminates child processes.
 *
 * @api public
 */

module.exports = function lower(cb) {
  var oars = this;

  oars.log.verbose('Lowering oars...');
  // Callback is optional
  cb = cb || function(err) {
    if (err) return oars.log.error(err);
  };
  oars._exiting = true;

  var beforeShutdown = oars.config.beforeShutdown || function(cb) {
      return cb();
    };

  // Wait until beforeShutdown logic runs
  beforeShutdown(function(err) {

    // If an error occurred, don't stop-- still try to kill the child processes.
    if (err) {
      oars.log.error(err);
    }

    // Kill all child processes
    _.each(oars.childProcesses, function kill(childProcess) {
      oars.log.verbose('Sent kill signal to child process (' + childProcess.pid + ')...');
      try {
        childProcess.kill('SIGINT');
      } catch (e) {
        oars.log.warn('Error received killing child process: ', e.message);
      }
    });

    cb();

  });

};
