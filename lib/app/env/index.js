/**
 * Module dependencies.
 */

var _ = require('lodash');
var dotenv = require('dotenv');
var path = require('path');
var fs = require('fs');

var DEFAULT_ENV_FILE = 'default.env';
var USER_ENV_FILE = '.env';

module.exports = function(oars) {

	function Env() {

		this.load = function(cb) {

			// default env file
			var defaultEnvPath = path.join(__dirname, DEFAULT_ENV_FILE);
			var defaultEnv = dotenv.parse(fs.readFileSync(defaultEnvPath));

			// user's env file
			var userEnvPath = path.join(oars.info.appPath, USER_ENV_FILE);
			var userEnv = dotenv.parse(fs.readFileSync(userEnvPath));

			var mergedEnv = _.merge(defaultEnv, userEnv);
			oars.log.verbose('load merged env:')
			oars.log.verbose(mergedEnv);

			// IMPORTANT: write into process without override 
			_.defaults(process.env, mergedEnv);

			if(cb) cb();
		};

		_.bindAll(this);

	}

	return new Env();
};