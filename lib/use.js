var baohe = require('../'),
    availableServices = baohe.Services,
    debug = baohe.debug;

exports.execute = function(actions) {
  if (actions.length === 0) {
    console.error('Plese specify the service name, ' +
      'usage: baohe use <service>');
  } else if (-1 === availableServices.indexOf(actions[0])) {
    console.error('Please use a supported service name, ' +
      'see: baohe all');
  } else {
    var serviceName = actions[0];
    var service = baohe.getService(serviceName);

    var config = baohe.getConfig();
    config.current = serviceName;

    service.init(function() {
      debug('Already logged in');
    });

    process.on('exit', function() {
      debug('Exiting ... about to write to config file');
      baohe._writeConfigFile();
    });
  }
};
