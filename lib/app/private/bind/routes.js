/**
 * Module dependencies
 */
var async = require('async');
var _ = require('lodash');

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

		var splitPath = path.split(/\s+/);
		if(!splitPath.length) return result;
		
		splitPath = splitPath.map(function(n) {
			return n.trim();
		});

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

		result.rawControllerId = parsedTarget[1];
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

	function _pushPolicy(ret, config, policies) {
		if(config === false) {
			ret.push(policies._preventAccess);
		}

		if(config && _.isString(config) && _.isFunction(policies[config])) {
			ret.push(policies[config]);
		}

		if(config && _.isArray(config)) {
			_.map(config, function(each) {
				if(each && _.isFunction(policies[each])) {
					ret.push(policies[each]);
				}
			})
		}
	}

	function findPolicy(rawControllerId, actionId) {
		var ret = [];
		var policies = oars.policies;
		var config = oars.config.policies || {};

		if(policies.globalPreventAccess) {
			ret.push(policies._preventAccess);
		}

		config = config[rawControllerId];
		if(config) {
			
			// for global
			_pushPolicy(ret, config['*'], policies);
			
			// for action
			_pushPolicy(ret, config[actionId], policies);
		}

		return ret;
	}

	return function(cb) {
		var routes = oars.config.routes;
		var server = oars.server;
		var controllers = oars.modules.controllers;
		var errors = oars.config.errors;

		// convert routes object to array
		// from: { '/': [ {a: b}, {c: d} ], '/a': {e: f}}
		// to:   [ {key: '/', value: {a: b}}, {key: '/', value: {c: d}}, {key: '/a', value: {e: f} ]
		routes = convertToArray(routes);

		function bindController(each, done) {
			var path = each.key;
			var target = each.value;

			var result = parseRoute(path, target);
			var ctrl = controllers[result.controllerId][result.actionId];

			// IMPORTANT: policy should be an array
			var policy = findPolicy(result.rawControllerId, result.actionId);

			if(!ctrl) {
				return done(new Error('RouteLoader: Can not find controller for ' + path));
			}

			if(!server[result.method]) {
				return done(new Error('RouteLoader: Can not find method for ' + path));
			}

			var _ctrl = ctrl;

			// merge some extra data into ctrl's arguments, here is errors
			if(errors) {
				var mergedError = errors[result.rawControllerId];
				if(_.isObject(errors['*'])) {
					mergedError = mergedError || {};
					mergedError = _.merge(mergedError, errors['*']);
				}

				if(mergedError) {
					var mergedCtrl = function() {
						var mainArguments = Array.prototype.slice.call(arguments);
						mainArguments.push(mergedError);

						ctrl.apply(null, mainArguments);
					}

					_ctrl = mergedCtrl;
				}
			}

			// concat policy with ctrl
			var ctrls = policy.concat(_ctrl);

			oars.log.silly('bind route: ' + result.method + ' ' + result.url +
					(result.version ? ' [' + result.version + ']' : ''));

			if(result.version) {
				server[result.method]({
					path: result.url,
					version: result.version
				}, ctrls);
			} else {
				// SUCH AS: server.get('/hi', [Function])
				server[result.method](result.url, ctrls);
			}

			done();
		}

		async.map(routes, bindController, cb);
	};
}
