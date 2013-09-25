var path = require('path');
var baohe = require('../');

exports.execute = function() {
  var config = baohe.getConfig();
  if (!config.current) {
    return console.error('Please select a service, see: baohe use');
  }

  var service = baohe.getService(config.current);
  service.init(function() {
    service.list(function(results) {
      results.forEach(function(fileInfo) {
        console.log(path.basename(fileInfo.path));
      });
    });
  });
};
