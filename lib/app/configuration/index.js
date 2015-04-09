/**
 * Module dependencies.
 */

var _ = require('lodash');
var path = require('path');
var async = require('async');

var DEFAULT_CONFIG_FILE = 'default.config.js';

module.exports = function(oars) {

	function Configuration() {

		this.load = function(cb) {

			async.parallel({
				
				// default config
				loadDefault: function(done) {
					var defaultConfigFile = path.join(__dirname, DEFAULT_CONFIG_FILE);
					var defaultConfig = require(defaultConfigFile);

					done(null, defaultConfig);
				},

				// user's config
				loadUser: function(done) {
					oars._prepare.loadUserConfig(done);
				}
			}, function(err, results) {
				if(err) return cb(err);

				oars.config = _.merge(results.loadDefault, results.loadUser);
				oars.log.verbose(oars.config);

				if(cb) cb(null, oars);
			});
		};

		_.bindAll(this);
	}

	return new Configuration();
};