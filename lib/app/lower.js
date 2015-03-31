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

    // Shut down HTTP server
    // TODO: defer this to the http and sockets hooks-- use oars.emit('lowering')
    // Shut down Socket server
    // wait for all attached servers to stop
    oars.emit('lower');
    var log = oars.log.verbose;

    async.series([

      function shutdownSockets(cb) {
        if (!oars.hooks.sockets) {
          return cb();
        }

        try {
          log('Shutting down socket server...');
          var timeOut = setTimeout(cb, 100);
          oars.io.server.unref();
          oars.io.server.close();
          oars.io.server.on('close', function() {
            log('Socket server shut down successfully.');
            clearTimeout(timeOut);
            cb();
          });
        } catch (e) {
          clearTimeout(timeOut);
          cb();
        }
      },

      function shutdownHTTP(cb) {

        if (!oars.hooks.http) {
          return cb();
        }

        try {
          log('Shutting down HTTP server...');
          var timeOut = setTimeout(cb, 100);
          oars.hooks.http.server.unref();
          oars.hooks.http.server.close();
          oars.hooks.http.server.on('close', function() {
            log('HTTP server shut down successfully.');
            clearTimeout(timeOut);
            cb();
          });
        } catch (e) {
          clearTimeout(timeOut);
          cb();
        }
      },

      function removeListeners(cb) {
        // Manually remove all event listeners
        for (var key in oars._events) {
          oars.removeAllListeners(key);
        }

        // If `oars.config.process.removeAllListeners` is set, do that.
        if (oars.config.process && oars.config.process.removeAllListeners) {
          process.removeAllListeners();

          // TODO:
          // investigate- there is likely a more elegant way to do this.
          // Instead of doing removeAllListeners, we should be manually removing
          // those listeners that we actual attach. See the `processeventsstuff`
          // branch for some first steps in that direction. ~mm
        }

        cb();
      }
    ], cb);

  });

};
