module.exports = function(oars) {


	/**
	 * Module dependencies.
	 */

	var async = require('async');
	var _ = require('lodash');

	// sometimes we should prevent access of one controler
	function _preventAccess(req, res, next) {
		next(new oars.restify.NotAcceptableError());
	}

	/**
	 * Expose `policies` hook definition
	 */

	return  {

		defaults: {

			// Default policy mappings (allow all)
			policies: { '*': true }
		},

		initialize: function(cb) {

			var policies = oars.policies = _.clone(oars.modules.policies);
			var config = _.merge(this.defaults.policies, oars.config.policies);

			policies._preventAccess = _preventAccess;

			// all controller prevent access
			if(!config['*']) {
				policies.globalPreventAccess = true;
			}

			cb();
		},
	}

};
