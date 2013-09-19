/*jshint maxlen: false*/
var message = [
  'CLI tool for personal cloud storage services',
  '',
  'Usage:',
  '',
  '    baohe help \t\t\t\t\t Show this message',
  '    baohe current \t\t\t\t Show the service name currently using',
  '    baohe all \t\t\t\t\t Show all the supported services',
  '    baohe use <service> \t\t\t Select the service you want',
  '    baohe pwd \t\t\t\t\t Show the current remote path name',
  '    baohe ls \t\t\t\t\t Show the files in current remote path name',
  '    baohe cd <path> \t\t\t\t Change the current remote path',
  '    baohe cp <file1 [file2 ...]> \t\t Store file1, file2 ... to current remote path',
  '    baohe cp [--to <path>] <file1 [file2 ...]> \t Store file1, file2 ... to the specific path',
  ''
].join('\n');

exports.execute = function() {
  console.log(message);
};
