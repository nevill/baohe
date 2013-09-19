var supports = require('../').Supports;

exports.execute = function() {
  supports.forEach(function(platform) {
    console.log(platform);
  });
};
