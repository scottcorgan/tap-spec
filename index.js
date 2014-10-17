var through = require('through2');
var parser = require('tap-parser');
var duplexer = require('duplexer');
var chalk = require('chalk');

var symbols = {
    ok: '\u2713',
    err: '\u2717'
};

// win32 console default output fonts don't support tick/cross
if (process && process.platform === 'win32') {
  symbols = {
    ok: '\u221A',
    err: '\u00D7'
  };
}

module.exports = function() {
  var out = through();
  var tap = parser();
  var dup = duplexer(tap, out);
  var currentTestName = '';
  var errors = [];
  var res;

  out.push('\n');

  tap.on('comment', function (comment) {
    currentTestName = comment;

    if (/^tests\s+[1-9]/gi.test(comment)) comment = chalk.white(comment);
    else if (/^pass\s+[1-9]/gi.test(comment)) comment = chalk.green(comment);
    else if (/^fail\s+[1-9]/gi.test(comment)) comment = chalk.red(comment);
    else if (/^ok$/gi.test(comment)) return;
    else out.push('\n');

    out.push('  ' + comment + '\n');
  });

  tap.on('assert', function (res) {
    var output = (res.ok)
      ? chalk.green(symbols.ok)
      : chalk.red(symbols.err);

    if (!res.ok) errors.push(currentTestName + ' ' + res.name);

    out.push('    ' + output + ' ' + chalk.gray(res.name) + '\n');
  });

  tap.on('extra', function (extra) {
    out.push('   ' + extra + '\n');
  });

  tap.on('results', function (_res) {
    res = _res
    if (errors.length) {
      var past = (errors.length == 1) ? 'was' : 'were';
      var plural = (errors.length == 1) ? 'failure' : 'failures';

      out.push('  ' + chalk.red('Failed Tests: '));
      out.push('There ' + past + ' ' + chalk.red(errors.length) + ' ' + plural + '\n\n');

      errors.forEach(function (error) {
        out.push('    ' + chalk.red(symbols.err) + ' ' + chalk.red(error) + '\n');
      });
    }
    else if (!res.ok) {
      out.push('  ' + chalk.red('Fail!') + '\n');
    }
    else{
      out.push('  ' + chalk.green('Pass!') + '\n');
    }
    
    out.push('\n');

    // Expose errors and res on returned dup stream
    dup.errors = errors;
    dup.results = res;
  });

  return dup;
}
