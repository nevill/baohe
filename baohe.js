var read = require('read'),
    path = require('path'),
    util = require('util'),
    fs = require('fs');

var version = require('./package.json').version;

var Commands = [
  'all',
  'cd',
  'cp',
  'current',
  'help',
  'ls',
  'pwd',
  'use',
  'version',
];

var Services = ['baidu'];
var ConfigFileName = '.baohe.json';

var debug = function() { };
if (/\bbaohe\b/.test(process.env.NODE_DEBUG)) {
  debug = function() {
    console.error('[BAOHE] %s', util.format.apply(util, arguments));
  };
}

function getConfigFile() {
  var configDir = process.env.HOME || process.env.TMPDIR;
  return path.join(configDir, ConfigFileName);
}

function Baohe() {}

Baohe.prototype.getCommand = function(name) {
  var command = 'help';
  if (Commands.indexOf(name) !== -1) {
    command = name;
  }
  return require('./lib/' + command);
};

Baohe.prototype.getService = function(serviceName) {
  return require('./lib/' + serviceName);
};

Baohe.prototype.getConfig = function(service) {
  if (!this.config) {
    var configFile = getConfigFile();
    if (fs.existsSync(configFile)) {
      this.config = require(configFile);
    } else {
      this.config = {};
    }
  }

  var result = this.config;

  if (service) {
    if (!this.config[service]) {
      this.config[service] = {};
    }
    result = this.config[service];
  }

  return result;
};

Baohe.prototype.processLogin = function(onLogin, onSuccess) {

  function promptLoginInfo(callback) {
    read({ prompt: 'user name:', silent: false },
      function(err, user) {
        read({ prompt: 'password:', silent: true },
          function(err, password) {
            process.nextTick(function() {
              callback(user, password);
            });
          });
      });
  }

  var self = this;

  promptLoginInfo(function(user, password) {
    onLogin(user, password, function(success) {
      if (success) {
        debug('Login sucessfully');
        self._writeConfigFile();
        process.nextTick(onSuccess);
      } else {
        process.nextTick(function() {
          self.processLogin(onLogin, onSuccess);
        });
      }
    });
  });
};

Baohe.prototype.debug = debug;

Baohe.prototype._writeConfigFile = function() {
  fs.writeFileSync(getConfigFile(),
    JSON.stringify(this.config, null, 2));
};

exports = module.exports = new Baohe();

exports.Version = version;
exports.Commands = Commands;
exports.Services = Services;
