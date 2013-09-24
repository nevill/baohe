var supports = require('../').Services;

exports.execute = function() {
  supports.forEach(function(platform) {
    console.log(platform);
  });
};
