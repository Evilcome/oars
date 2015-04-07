/**
 * Oars.prototype.getHost()
 *
 * @return {String} the configured hostname of the server
 * (IMPORTANT: returns undefined if not specifically configured)
 */

module.exports = function getHost() {
  var oars = this;

  var hasExplicitHost = oars.config.explicitHost;
  var host = oars.config.proxyHost || hasExplicitHost || oars.config.host;
  return host;
};
