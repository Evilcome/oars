/**
 * Module dependencies
 */
var restify = require('restify');

/**
 * Oars.prototype.initialize()
 *
 * Start the Oars server
 * NOTE: oars.load() should be run first.
 *
 * @api private
 */

module.exports = function initialize(cb) {

  var oars = this;

  // Callback is optional
  cb = cb || function(err) {
    if (err) oars.log.error(err);
  };

  oars.server = restify.createServer();

  // custom app's timeout
  oars.server.server.timeout = 6000;

  oars.server.listen(oars.config.port);

  oars.server.get('/', function(req, res) {
    res.send('haha');
  });

  // Indicate that server is starting
  oars.log.verbose('Starting app at ' + oars.config.appPath + '...');

  // Add "beforeShutdown" events
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

  cb(null, oars);
};
