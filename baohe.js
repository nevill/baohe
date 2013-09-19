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

var Supports = ['baidu'];

function Baohe() { }

Baohe.prototype.getCommand = function(name) {
  var command = 'help';
  if (Commands.indexOf(name) !== -1) {
    command = name;
  }
  return require('./lib/' + command);
};

exports = module.exports = new Baohe();

exports.Version = version;
exports.Commands = Commands;
exports.Supports = Supports;
