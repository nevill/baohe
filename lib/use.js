var baohe = require('../');

var service;

function readFromStdin(cb) {
  var result = '';

  var input = process.stdin;
  input.setEncoding('utf8');

  var onData = function(chunk) {
    result += chunk;
    if (result.slice(-1) === '\n') {
      input.removeListener('data', onData);
      input.pause();
      cb(result.trim());
    }
  };

  input.on('data', onData);
  input.resume();
}

function processLogin() {
  process.stdout.write('user name: ');
  readFromStdin(function(user) {
    process.stdout.write('password: ');
    readFromStdin(function(password) {
      service.login(user, password, function() {
        if (service.loginRequired) {
          processLogin();
        }
        else {
          console.log('Logged in, write to config file');
        }
      });
    });
  });
}

exports.execute = function(actions) {
  if (actions.length === 0) {
    console.error('Plese specify the service name');
    console.error('Usage: baohe use <service>');
  } else {
    var serviceName = actions[0];
    service = baohe.getService(serviceName);
    if (service.loginRequired) {
      processLogin();
    }
  }
};
