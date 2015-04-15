/**
 * Module dependencies.
 */

var _ = require('lodash');
var path = require('path');
var async = require('async');

var DEFAULT_HOOK_FILE = 'default.hook.js';
var HOOK_PATH = '../../hooks';

module.exports = function(oars) {

	function Hook() {

		this.load = function(cb) {

			var defaultHookFile = path.join(__dirname, DEFAULT_HOOK_FILE);
			var defaultHooks = require(defaultHookFile);

			if(defaultHooks && defaultHooks.length) {
				oars.hooks = {};
			}

			function loadHook(hookName, done) {
				var hookPath = path.join(__dirname, HOOK_PATH, hookName);
				var hook = require(hookPath)(oars);

				oars.hooks[hookName] = hook;
				hook.initialize(function(err, results) {
					if(err) return done(err, results);

					done(null, hook);
				});
			}

			async.map(defaultHooks, loadHook, function(err, results) {
				if(err) return cb(err);

				oars.log.verbose('Load inner hooks...');
				oars.log.verbose(oars.hooks);

				if(cb) cb(null, oars);
			});
		};

		_.bindAll(this);
	}

	return new Hook();
};