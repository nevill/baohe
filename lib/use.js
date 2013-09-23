var baohe = require('../');

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
      if (!baohe.login(user, password)) {
        processLogin();
      }
    });
  });
}

exports.execute = function(actions) {
  if (actions.length === 0) {
    console.error('Plese specify the service name');
    console.error('Usage: baohe use <service>');
  }
  else {
    var service = actions[0];
    var config = baohe.getConfig();
    if (!config[service]) {
      processLogin();
    }
  }
};
