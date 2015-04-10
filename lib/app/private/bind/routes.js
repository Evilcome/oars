/**
 * Module dependencies
 */
var async = require('async');

module.exports = function(oars) {

	function normalizeControllerId(controllerId) {
		if (!_.isString(controllerId)) {
			return null;
		}
		controllerId = controllerId.replace(/(.+)Controller$/i, '$1');
		controllerId = controllerId.toLowerCase();
		return controllerId;
	};

	function parsePath(path) {
		var result = {};

		var splitPath = path.split(' ');
		if(!splitPath.length) return result;

		if(splitPath.length === 1) {
			result.method = 'all';
			result.url = path;
		}

		if(splitPath.length > 1) {
			result.method = splitPath[0];
			result.url = splitPath[1];
		}

		return result;
	}

	function parseTarget(target) {
		var result = {};

		if(!target) return result;
		if(!target.controller && !_.isString(target)) return result;

		if(target.controller) {
			result._controller = target.controller;
		}

		if(target.version) {
			result.version = target.version;
		}

		// string
		if(_.isString(target)){
			result._controller = target;
		}

		// Handle dot notation
		var parsedTarget = result._controller.match(/^([^.]+)\.?([^.]*)?$/);

		// If target matches a controller
		// go ahead and assume that this is a dot notation route
		var controllerId = normalizeControllerId(parsedTarget[1]);
		if(!controllerId) return result;

		result.controllerId = controllerId;
		result.actionId = _.isString(parsedTarget[2]) ? parsedTarget[2] : 'index';

		return result;
	}

	function parseRoute(path, target) {
		var result = {
			path: path,
			target: target
		};
		
		// parse path
		var pathResult = parsePath(path);
		if(Object.keys(pathResult).length === 0) {
			throw new Error('RouteLoader: Can not parse path');
		}

		// parse target
		var targetResult = parseTarget(target);
		if(Object.keys(targetResult).length === 0) {
			throw new Error('RouteLoader: Can not parse target');
		}

		result = _.merge(result, pathResult);
		result = _.merge(result, targetResult);

		return result;
	}

	function convertToArray(routes) {
		var ret = [];
		_.forEach(Object.keys(routes), function(key) {
			var oneRecord = routes[key];
			if(_.isArray(oneRecord)) {
				_.map(oneRecord, function(each) {
					ret.push({
						key: key,
						value: each
					});
				})
			} else {
				ret.push({
					key: key,
					value: oneRecord
				});
			}
		});

		return ret;
	}

	return function(cb) {
		var routes = oars.config.routes;
		var server = oars.server;
		var controllers = oars.modules.controllers;

		// convert routes object to array
		// from: { '/': [ {a: b}, {c: d} ], '/a': {e: f}}
		// to:   [ {key: '/', value: {a: b}}, {key: '/', value: {c: d}}, {key: '/a', value: {e: f} ]
		routes = convertToArray(routes);

		function bindController(each, done) {
			var path = each.key;
			var target = each.value;

			var result = parseRoute(path, target);
			var ctrl = controllers[result.controllerId][result.actionId];

			if(!ctrl) {
				return done(new Error('RouteLoader: Can not find controller for %s', path));
			}

			if(!server[result.method]) {
				return done(new Error('RouteLoader: Can not find method for %s', path));
			}

			if(result.version) {
				server[result.method]({
					path: result.url,
					version: result.version
				}, ctrl);
			} else {
				// server.get('/hi', [Function])
				server[result.method](result.url, ctrl);
			}

			done();
		}

		async.map(routes, bindController, cb);
	};
}