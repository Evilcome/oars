/**
 * Module dependencies.
 */

var async = require('async');
var _ = require('lodash');


/**
 * Oars.prototype.row()
 *
 * Loads the app, then starts all attached servers.
 *
 * @api public
 */

module.exports = function row(configOverride, cb) {
  var oars = this;

  // Callback is optional
  cb = cb || function(err) {
    if (err) return oars.log.error(err);
  };

  async.series([

    function(cb) {
      oars.load(configOverride, cb);
    },

    oars.initialize

  ], function (err) {

    if (err) {
      return oars.lower(function (errorLoweringOars){

        cb(err);

        if (errorLoweringOars) {
          oars.log.error('When trying to lower the app as a result of a failed row, encountered an error:', errorLoweringOars);
        }
      });
    }

    _printSuccessMsg(oars);

    oars.isRowed = true;
    return cb(null, oars);
  });
};

// Gather app meta-info and log startup message (the boat).
function _printSuccessMsg(oars) {

  // If `config.noShip` is set, skip the startup message.
  if (!(oars.config.log && oars.config.log.noShip)) {

    oars.log.ship && oars.log.ship();
    oars.log.info(('Server rowed in `' + oars.config.appPath + '`'));
    oars.log.info(('To see your app, visit ' + (oars.visit() || '').underline));
    oars.log.blank();
    oars.log('--------------------------------------------------------'.grey);
    oars.log((':: ' + new Date()).grey);
    oars.log.blank();
    oars.log('Environment : ' + oars.config.environment);

    // Only log the host if an explicit host is set
    if (oars.getHost()) {
      oars.log('Host        : ' + oars.getHost()); // 12 - 4 = 8 spaces
    }
    oars.log('Port        : ' + oars.config.port); // 12 - 4 = 8 spaces
    oars.log('--------------------------------------------------------'.grey);
  }
}
