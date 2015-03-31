/**
 * Calculate the base URL
 * @return {String} [description]
 */
module.exports = function getBaseurl() {
  var oars = this;

  var usingSSL = oars.config.ssl && oars.config.ssl.key && oars.config.ssl.cert;
  var port = oars.config.proxyPort || oars.config.port;
  var localAppURL =
    (usingSSL ? 'https' : 'http') + '://' +
    (oars.getHost() || 'localhost') +
    (port == 80 || port == 443 ? '' : ':' + port);

  return localAppURL;
};
