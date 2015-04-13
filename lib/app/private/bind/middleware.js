/**
 * Module dependencies
 */
var async = require('async');

module.exports = function(oars) {

	return function(cb) {
		var middleware = oars.config.middleware;
		var server = oars.server;
		var list = middleware.order;

		// save all middleware into oars.
		oars.middleware = {};

		function useMiddleware(name, done) {

			var method = middleware[name] || oars.restify[name];

			if(!method || !_.isFunction(method)) {
				return done(new Error('Not found middleware named: %s', name));
			}

			if(name === 'acceptParser' && !middleware[name]) {
				method = method(server.acceptable);
			}

			if(name !== 'acceptParser' && method === oars.restify[name]) {
				method = method();
			}

			server.use(method);

			oars.middleware[name] = method;

			done(null, method);
		}

		async.map(list, useMiddleware, cb);
	};
}