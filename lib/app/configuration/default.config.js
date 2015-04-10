/**
 * app's default config
 */

module.exports = {

	globals: {
		_: true,
		async: true,
		oars: true
	},

	middleware: {
		order: [
			'acceptParser',
			'queryParser',
			'bodyParser',
			'CORS'
		]
	},

	// policies: {},

	// routes: {},

	server: {
		attributes: {
			name: 'An Oars Server',
			//version: '1.0.0'
		}
	}
};