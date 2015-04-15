var Oars = require('./app/Oars.js');
var restify = require('restify');

// Instantiate and expose a Oars singleton
module.exports = new Oars();

// expose restify for inherits usage
module.exports.restify = restify;