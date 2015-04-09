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

module.exports = function row(cb) {
  var oars = this;

  // Callback is optional
  cb = cb || function(err) {
    if (err) return oars.log.error(err);
  };

  async.series([

    oars.load,
    
    oars._init

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
    oars.log.info(('Server rowed in `' + oars.info.appPath + '`'));
    oars.log.blank();
    oars.log('--------------------------------------------------------'.grey);
    oars.log((':: ' + new Date()).grey);
    oars.log.blank();
    oars.log('Environment : ' + process.env.NODE_ENV);
    oars.log('Port        : ' + process.env.PORT); // 12 - 4 = 8 spaces
    oars.log('--------------------------------------------------------'.grey);
  }
}
