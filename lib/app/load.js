var async = require('async');
var _ = require('lodash');
var path = require('path');

module.exports = function(oars) {

	var Env = require('./env')(oars);
	var Configuration = require('./configuration')(oars);
	var Hook = require('./hook')(oars);

	return function(cb) {
		async.series([

			// first prepare important info
			oars._prepare.prepareInfo,

			// load NODE_ENV PORT 
			Env.load,

			// load configuration
			Configuration.load,

			// set global vars
			oars._global,

			// load modules under `api/`
			oars._prepare.prepareModules,

			// bind some inner hook
			// TODO: support user hook later
			Hook.load

		], cb);
	}
}