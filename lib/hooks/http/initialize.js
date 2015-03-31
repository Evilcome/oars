/**
 * Module dependencies.
 */

var _ = require('lodash'),
    async = require('async');



module.exports = function(oars) {

    /**
     * Configure the encapsulated Express server that will be used to serve actual HTTP requests
     */

    return function loadExpress(cb) {

        // In order for an existent and correct `oars.config`
        // to be passed in, these requires should be here,
        // not above:  ||
        //             \/
        var startServer = require('./start')(oars);

        // Provides support for undocumented `express.loadMiddleware` config
        // (should no longer be relevant in most cases thanks to new `http.middleware` conf)
        var installHTTPMiddleware = oars.config.http.loadMiddleware || require('./middleware/load');

        // Required to be here due to dynamic NODE_ENV settings via command line args
        // (i.e. if we `require` this above w/ everything else, the NODE_ENV might not be set properly yet)
        var express = require('express');



        // Create express server
        var app = oars.hooks.http.app = express();

        // (required by Express 3.x)
        var usingSSL = oars.config.ssl.key && oars.config.ssl.cert;

        // Merge SSL into server options
        var serverOptions = oars.config.http.serverOptions || {};
        _.extend(serverOptions, oars.config.ssl);

        // Get the appropriate server creation method for the protocol
        var createServer = usingSSL ?
            require('https').createServer :
            require('http').createServer;

        // Use serverOptions if they were specified
        // Manually create http server using Express app instance
        if (oars.config.http.serverOptions || usingSSL) {
            oars.hooks.http.server = createServer(serverOptions, oars.hooks.http.app);
        } else oars.hooks.http.server = createServer(oars.hooks.http.app);


        // Configure views if hook enabled
        if (oars.hooks.views) {

            oars.after('hook:views:loaded', function() {
                var View = require('./view');

                // Use View subclass to allow case-insensitive view lookups
                oars.hooks.http.app.set('view', View);

                // Set up location of server-side views and their engine
                oars.hooks.http.app.set('views', oars.config.paths.views);

                // Teach Express how to render templates w/ our configured view extension
                app.engine(oars.config.views.engine.ext, oars.config.views.engine.fn);

                // Set default view engine
                oars.log.verbose('Setting default Express view engine to ' + oars.config.views.engine.ext + '...');
                oars.hooks.http.app.set('view engine', oars.config.views.engine.ext);
            });
        }

        // When Oars binds routes, bind them to the internal Express router
        oars.on('router:bind', function(route) {

            route = _.cloneDeep(route);

            // TODO: Add support for error domains..?

            app[route.verb || 'all'](route.path, route.target);
        });

        // When Oars unbinds routes, remove them from the internal Express router
        oars.on('router:unbind', function(route) {
            var newRoutes = [];
            _.each(app.routes[route.method], function(expressRoute) {
                if (expressRoute.path != route.path) {
                    newRoutes.push(expressRoute);
                }
            });
            app.routes[route.method] = newRoutes;

        });

        // When Oars is ready, start the express server
        oars.on('ready', startServer);

        // app.use() the configured express middleware
        var defaultMiddleware = require('./middleware/defaults')(oars, app);
        installHTTPMiddleware(app, defaultMiddleware, oars);
        // TODO: investigate sharing http middleware with sockets hook..?
        // (maybe not-- this is an open question with direct impact on sessions)
        // (this would be a v0.11.x thing)

        return cb();
    };

};
