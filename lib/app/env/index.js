/**
 * Module dependencies.
 */

var _ = require('lodash');
var dotenv = require('dotenv');
var path = require('path');
var fs = require('fs');

var DEFAULT_ENV_PATH = './default.env';

module.exports = function(oars) {
	
	function Env() {

		this.load = function(cb) {
			var vars = fs.readFileSync(DEFAULT_ENV_PATH);
		};

		_.bindAll(this);

	}

	return new Env();
};