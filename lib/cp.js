var fs = require('fs');
var baohe = require('../'),
    debug = baohe.debug;

exports.execute = function(files) {
  var config = baohe.getConfig();
  if (!config.current) {
    return console.error('Please select a service, see: baohe use');
  }
  else if (files.length === 0) {
    return console.error('Plese specify a file name');
  }

  try {
    files.forEach(function(file) {
      var stats = fs.statSync(file);
      if (!stats.isFile()) {
        throw new Error('Not supported file \'' + file + '\'');
      }
    });
  }
  catch (e) {
    return console.error(e.toString());
  }

  var service = baohe.getService(config.current);
  service.init(function() {
    files.forEach(function(file) {
      service.upload(file, function() {
        debug('Sucessfully processed %s', file);
      });
    });
  });
};
