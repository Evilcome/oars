/**
 * Module dependencies
 */
var restify = require('restify');
var async = require('async');

function startServer(oars) {
  var config = oars.config.server;

  oars.restify = restify;
  oars.server = restify.createServer(config.attributes);

  // override the default timeout.
  if(config.timeout) {
    oars.server.server.timeout = config.timeout;
  }

  async.series([
    oars._prepare.bindMiddleware,
    oars._prepare.bindRoutes        // this will bind routes and POLICIES
  ], function(err, results) {
    if(err) throw err;

    oars.server.listen(process.env.PORT);

    // Indicate that server is starting
    oars.log.verbose('Starting app at ' + oars.info.appPath + '...');
  });
}

function listenProcess(oars) {
  process.once('SIGUSR2', function() {
    oars.lower(function() {
      process.kill(process.pid, 'SIGUSR2');
    });
  });
  process.on('SIGINT', function() {
    oars.log.error('SIGINT');
    oars.lower(process.exit);
  });
  process.on('SIGTERM', function() {
    oars.log.error('SIGTERM');
    oars.lower(process.exit);
  });
  process.on('exit', function() {
    oars.log.error('exit');
    if (!oars._exiting) oars.lower();
  });
}

/**
 * Oars.prototype._init()
 *
 * Start the Oars server
 * NOTE: oars.load() should be run first.
 *
 * @api private
 */

module.exports = function (cb) {

  var oars = this;

  // Callback is optional
  cb = cb || function(err) {
    if (err) oars.log.error(err);
  };

  startServer(oars);

  listenProcess(oars);

  cb(null, oars);
};
