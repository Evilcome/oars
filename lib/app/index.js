/**
 * Module dependencies.
 */
var Oars = require('./Oars');
var _ = require('lodash');

function OarsFactory() {
  return new Oars();
}

module.exports = OarsFactory;
