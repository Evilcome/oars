module.exports = function (oars) {

	/**
	 * Module dependencies.
	 */

	var async			= require('async');


	return function startServer (cb) {

		// Used to warn about possible issues if starting the server is taking a very long time
		var liftAbortTimer;
		var liftTimeout = oars.config.liftTimeout || 500;

		async.auto({

			// Start Express server
			start: function (cb) {

				var explicitHost = oars.config.explicitHost;

				// If host is explicitly declared, include it in express's listen() call
				if (explicitHost) {
					oars.log.verbose('Restricting access to explicit host: '+explicitHost);
					oars.hooks.http.server.listen(oars.config.port, explicitHost, cb);
				}
				else {
					oars.hooks.http.server.listen(oars.config.port, cb);
				}

				// Start timer in case this takes suspiciously long...
				liftAbortTimer = setTimeout(function failedToStart() {

					// Figure out if this user is on Windows
					var isWin = !!process.platform.match(/^win/);

					// If server isn't starting, provide general troubleshooting information,
					// sharpened with a few simple heuristics:
					console.log('');
					oars.log.error('Server doesn\'t seem to be starting.');
					oars.log.error();
					oars.log.error('Troubleshooting tips:');
					oars.log.error();
					

					// 1. Unauthorized 
					if (oars.config.port < 1024) {
						oars.log.error(
						' -> Do you have permission to use port ' + oars.config.port + ' on this system?',
						// Don't mention `sudo` to Windows users-- I hear you guys get touchy about that sort of thing :)
						(isWin) ? '' : '(you might try `sudo`)'
						);
						
						oars.log.error();
					}

					// 2. Invalid or unauthorized explicitHost configuration.
					if (explicitHost) {
						oars.log.error(
						' -> You might remove your explicit host configuration and try lifting again (you specified',
						'`'+explicitHost+'`',
						'.)');

						oars.log.error();
					}

					// 3. Something else is running on this port
					oars.log.error(
					' -> Is something else already running on port', oars.config.port,
					(explicitHost ? (' with hostname ' + explicitHost) : '') + '?'
					);
					oars.log.error();

					// 4. invalid explicitHost
					if (!explicitHost) {
						oars.log.error(
						' -> Are you deploying on a platform that requires an explicit hostname,',
						'like OpenShift?');
						oars.log.error(
						'    (Try setting the `explicitHost` config to the hostname where the server will be accessible.)'
						);
						oars.log.error(
						'    (e.g. `mydomain.com` or `183.24.244.42`)'
						);
					}
					console.log('');
				}, liftTimeout);
			},

			verify: ['start', function (cb) {
				var explicitHost = oars.config.explicitHost;

				// Check for port conflicts
				// Ignore this check if explicit host is set, since other more complicated things might be going on.
				if( !explicitHost && !oars.hooks.http.server.address() ) {
					var portBusyError = '';
					portBusyError += 'Trying to start server on port ' + oars.config.port + ' but can\'t...';
					portBusyError += 'Something else is probably running on that port!' + '\n';
					portBusyError += 'Please disable the other server, or choose a different port and try again.';
					oars.log.error(portBusyError);
					throw new Error(portBusyError);
				}

				cb();
			}]

		}, function expressListening (err) {
			clearTimeout(liftAbortTimer);
			
			if (err) return cb(err);

			// Announce that express is now listening on a port
			oars.emit('hook:http:listening');

			cb && cb(err);
		});
	};

};
