/**
 * Draw an ASCII image of a ship
 */
module.exports = function _drawShip(log) {
  log = log || console.log;

  return function() {
    log('');
    log('       (`-,-, ');
    log('       (\'(_,( ) ');
    log('        _   `_\' ');
    log('     __|_|__|_|_ ');
    log('   _|___________|__ ');
    log('  |o o o o o o o o\/ ');
    log(' ~\'`~\'`~\'`~\'`~\'`~\'`~ ');
  }
};
