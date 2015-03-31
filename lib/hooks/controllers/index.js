/**
 * Public dependencies.
 */

var _ = require('lodash'),
	util = require('sails-util');


/**
 * Expose `controllers` hook definition
 */
module.exports = function(oars) {

	/**
	 * Private dependencies.
	 */
	var onRoute = require('./onRoute')(oars);



	return {

		defaults: {},

		// Don't allow oars to lift until ready
		// is explicitly set below
		ready: false,


		/**
		 * Initialize is fired first thing when the hook is loaded
		 *
		 * @api public
		 */

		initialize: function(cb) {

			// Register route syntax for binding controllers.
			oars.on('route:typeUnknown', onRoute);

			// Load controllers from app and register their actions as middleware.
			this.loadAndRegisterControllers(cb);
		},

    explicitActions: {},

		/**
		 * Wipe everything and (re)load middleware from controllers
		 *
		 * @api private
		 */

		loadAndRegisterControllers: function(cb) {
			var self = this;

			// Load app controllers
			oars.modules.loadControllers(function modulesLoaded (err, modules) {

				if (err) return cb(err);

				oars.controllers = modules;

				// Register controllers
				_.each(oars.controllers, function(controller, controllerId) {

					// Override whatever was here before
					if ( !util.isDictionary(self.middleware[controllerId]) ) {
						self.middleware[controllerId] = {};
					}

					// Mix in middleware from blueprints
					// ----removed----
					//
					// TODO: MAKE SURE THIS IS OK
					// self.middleware[controllerId].find = Controller.find;
					// self.middleware[controllerId].create = Controller.create;
					// self.middleware[controllerId].update = Controller.update;
					// self.middleware[controllerId].destroy = Controller.destroy;
					//
					// -----/removed------


					// Register this controller's actions
					_.each(controller, function(action, actionId) {


						// action ids are case insensitive
						actionId = actionId.toLowerCase();


						// If the action is set to `false`, explicitly disable it
						if (action === false) {
							delete self.middleware[controllerId][actionId];
							return;
						}

						// Ignore non-actions (special properties)
						//
						// TODO:
						// Some of these properties are injected by `moduleloader`
						// They should be hidden in the prototype or omitted instead.
						if (_.isString(action) || _.isBoolean(action)) {
							return;
						}

						// Otherwise mix it in (this will override CRUD blueprints from above)
            action._middlewareType = 'ACTION: '+controllerId+'/'+actionId;
						self.middleware[controllerId][actionId] = action;
            self.explicitActions[controllerId] = self.explicitActions[controllerId] || {};
            self.explicitActions[controllerId][actionId] = true;

					});

				});

				// Done!
				return cb();
			});
		}
	};


};
