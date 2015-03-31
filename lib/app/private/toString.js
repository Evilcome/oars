/**
 * Module dependencies
 */

var util = require('util');


/**
 * Oars.prototype.toString()
 *
 * e.g.
 * ('This is how `oars` looks when toString()ed: ' + oars)
 *
 * @return {String}
 */
module.exports = function toString () {
  return util.format('[An %sOars app%s]', this.isRowed ? 'rowed ' : '', this.isRowed && this.config.port ? ' on port '+this.config.port : '');
};
