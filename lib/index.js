var Oars = require('./app');

// Instantiate and expose a Oars singleton
module.exports = new Oars();

// Expose constructor for convenience/tests
module.exports.Oars = Oars;