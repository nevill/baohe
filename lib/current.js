var baohe = require('../');

exports.execute = function() {
  var config = baohe.getConfig();
  if (config.current) {
    console.log(config.current);
  } else {
    console.error('Please select a service, see: baohe use');
  }
};
