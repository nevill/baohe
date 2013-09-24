var util = require('util');

var baohe = require('../'),
    availableServices = baohe.Services,
    debug = baohe.debug;

var service;

function readFromStdin(cb) {
  var result = '';

  var input = process.stdin;
  input.setEncoding('utf8');

  var onData = function(chunk) {
    result += chunk;
    if (result.slice(-1) === '\n') {
      input.pause();
      input.removeListener('data', onData);
      cb(result.trim());
    }
  };

  input.on('data', onData);
  input.resume();
}

function processLogin() {
  util.print('user name: ');
  readFromStdin(function(user) {
    util.print('password: ');
    readFromStdin(function(password) {
      service.login(user, password, function() {
        if (service.loginRequired) {
          process.nextTick(function() {
            processLogin();
          });
        } else {
          debug('Login sucessfully');
        }
      });
    });
  });
}

exports.execute = function(actions) {
  if (actions.length === 0) {
    console.error('Plese specify the service name, ' +
      'usage: baohe use <service>');
  } else if (-1 === availableServices.indexOf(actions[0])) {
    console.error('Please use a supported service name, ' +
      'see: baohe all');
  } else {
    var serviceName = actions[0];
    service = baohe.getService(serviceName);

    var config = baohe.getConfig();
    config.current = serviceName;

    service.init(function() {
      if (service.loginRequired) {
        processLogin();
      } else {
        debug('Already logged in');
      }
    });

    process.on('exit', function() {
      debug('Exiting ... about to write to config file');
      baohe._writeConfigFile();
    });
  }
};
