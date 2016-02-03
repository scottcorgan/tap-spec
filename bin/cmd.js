#!/usr/bin/env node
var argv = require('yargs').argv;

if (argv.h || argv.help) {
  var usage = [
    'Usage: tap-spec [--nosuccess] [-h, --help]',
    '',
    'Options:',
    '  --nosuccess\t\t\t\tDiscard success messages',
    '  -h, --help \t\t\t\tDisplay this help message'
  ].join('\n');
  console.log(usage);
  process.exit(0);
}

var tapSpec = require('../');
var stream = tapSpec({
  noSuccess: argv.nosuccess
});

process.stdin
  .pipe(stream)
  .pipe(process.stdout);

process.on('exit', function (status) {

  if (status === 1) {
    process.exit(1);
  }

  if (tapSpec.failed) {
    process.exit(1);
  }
});
