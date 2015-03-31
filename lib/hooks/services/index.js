/**
 * Module dependencies
 */

var _ = require('lodash');




module.exports = function(oars) {

	/**
	 * Module loader
	 *
	 * Load a module into memory
	 */
	return {


		// Default configuration
		defaults: {

			globals: {
				services: true
			}
		},


		/**
		 * Fetch relevant modules, exposing them on `oars` subglobal if necessary,
		 */
		loadModules: function (cb) {

			oars.log.verbose('Loading app services...');
			oars.modules.loadServices(function (err, modules) {
				if (err) {
					oars.log.error('Error occurred loading modules ::');
					oars.log.error(err);
					return cb(err);
				}

				// Expose modules on `oars`
				oars.services = modules;

				// Expose globals (if enabled)
				if (oars.config.globals.services) {
					_.each(oars.services,function (service,identity) {
						var globalName = service.globalId || service.identity;
						global[globalName] = service;
					});
				}

				cb();
			});
		}
	};
};
