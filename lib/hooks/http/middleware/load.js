/**
 * Module dependencies
 */

var _ = require('lodash');




/**
 * `use` middleware in the correct order.
 *
 * @param  {express.app} app
 * @param  {Object} wares  - dictionary of preconfigured middleware
 * @param  {oars.app} oars
 */
module.exports = function builtInMiddlewareLoader (app, wares, oars) {

  _.each(oars.config.http.middleware.order, function (middlewareKey) {

    // Special case:
    // allows for injecting a custom function to attach middleware:
    if (middlewareKey === '$custom' && oars.config.http.customMiddleware) {
      oars.config.http.customMiddleware(app);
    }

    // Otherwise, just use the middleware normally.
    if (wares[middlewareKey]) app.use(wares[middlewareKey]);
  });
};
