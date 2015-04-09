module.exports = function(oars) {

	/**
	 * Module dependencies.
	 */

	var _ = require('lodash'),
		CaptainsLog = require('captains-log'),
		buildShipFn	= require('./ship');


	/**
	 * Expose `logger` hook definition
	 */

	return {

		defaults: {
			log: {
				level: 'info'
			}
		},

		initialize: function(cb) {
			
			// Get basic log functions
			var log = CaptainsLog(oars.config.log);

			// Mix in log.ship() method
			log.ship = buildShipFn(log.info);

			// Expose log on oars object
			oars.log = log;
			cb();
		}
	};
};
