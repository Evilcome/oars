/**
 * Module dependencies
 */

var util = require('util');
var _ = require('lodash');



/**
 * Oars.prototype.inspect()
 *
 * The string that should be returned when this `Oars` instance
 * is passed to `util.inspect()` (i.e. when logged w/ `console.log()`)
 *
 * @return {String}
 */

module.exports = function inspect () {
  var oars = this;

  return util.format('\n'+
  '|>   %s', this.toString()) + '\n' +
  '\n\n' +
  'Tip: Use `oars.config` to access your app\'s runtime configuration.'+
  '\n\n' +
  util.format('%d Controllers:\n', _(oars.controllers).toArray().value().length)+
  _(oars.controllers).toArray().pluck('globalId').map(function (it) {return it+'Controller';}).value() +
  '\n\n' +
  // 'Routes:\n'+
  // _(oars.routes).toArray().filter(function (it) {return !it.junctionTable;}).pluck('globalId').map(function (it) {return it+'Controller';}).value() +
  // '\n\n' +
  util.format('%d Hooks:\n', _(oars.hooks).toArray().value().length)+
  _(oars.hooks).toArray().pluck('identity').value() +
  '\n' +
  '';
};
