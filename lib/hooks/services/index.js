/**
 * Module dependencies
 */
var _ = require('lodash');

module.exports = function(oars) {
	
	/**
	 * Expose `services` hook definition
	 */
	return {

		defaults: {
			globals: {
				services: true
			}
		},

		initialize: function(cb) {
			oars.services = oars.modules.services;

			// Expose globals (if enabled)
			if (oars.config.globals.services) {
				_.each(oars.services,function (service,identity) {
					var globalName = service.globalId || service.identity;
					global[globalName] = service;
				});
			}

			cb();
		}
	};
};
