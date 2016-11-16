var fs = require('fs');

var tapOut = require('tap-parser');
var through = require('through2');
var duplexer = require('duplexer');
var format = require('chalk');
var prettyMs = require('pretty-ms');
var _ = require('lodash');
var repeat = require('repeat-string');
var symbols = require('figures');

var lTrimList = require('./lib/utils/l-trim-list');

module.exports = function (spec) {

  spec = spec || {};

  var OUTPUT_PADDING = spec.padding || '  ';

  var output = through();
  var parser = tapOut();
  var stream = duplexer(parser, output);
  var startTime = new Date().getTime();

  var errorSummary = {};
  var currTest = '';

  output.push('\n');

  parser.on('comment', function (comment) {
    comment = comment.replace(/^#\s+|[\n\s]+$/g, '');
    if(/^(tests|pass|fail)/.test(comment)) { return; }
    output.push('\n' + pad(format.underline(comment)) + '\n\n');

    currTest = comment;
    errorSummary[currTest] = [];
  });

  parser.on('assert', function (assertion) {

    if(assertion.skip || assertion.todo) { return; }

    var name = assertion.name;

    if(assertion.ok) {
      // Passing assertions
      var glyph = format.green(symbols.tick);

      output.push(pad('  ' + glyph + ' ' + format.dim(name) + '\n'));
    } else {
      // Failing assertions
      var glyph = symbols.cross;
      var title =  glyph + ' ' + name;
      var raw = format.cyan(prettifyError(assertion.diag));
      var divider = _.fill(
        new Array((title).length + 1),
        '-'
      ).join('');

      errorSummary[currTest].push(name);

      output.push('\n' + pad('  ' + format.red(title) + '\n'));
      output.push(pad('  ' + format.red(divider) + '\n'));
      output.push(raw);

      markFailed();
    }
  });

  parser.on('extra', function (comment) {

    output.push(pad('  ' + format.yellow(comment.raw)) + '\n');
  });

  // All done
  parser.on('complete', function (results) {

    output.push('\n\n');

    // Most likely a failure upstream
    if (results.plan.end < 1) {
      return markFailed();
    }

    if (results.fail > 0) {
      output.push(formatErrors(results));
      output.push('\n');
      markFailed();
    }

    output.push(formatTotals(results));
    output.push('\n\n\n');

    // Exit if no tests run. This is a result of 1 of 2 things:
    //  1. No tests were written
    //  2. There was some error before the TAP got to the parser
    if (results.count === 0) {
      markFailed();
    }
  });

  // Utils

  function markFailed() {

    stream.failed = true;
  }

  function prettifyError (diag) {

    return pad('operator: ' + diag.operator, 3) + '\n'
      + pad('expected: ' + diag.expected, 3) + '\n'
      + pad('actual: ' + diag.actual, 3) + '\n'
      + pad('at: ' + diag.at, 3) + '\n\n';
  }

  function formatErrors (results) {

    var failCount = results.fail;
    var past = (failCount === 1) ? 'was' : 'were';
    var plural = (failCount === 1) ? 'failure' : 'failures';

    var out = '\n' + pad(format.red.bold('Failed Tests:') + ' There ' + past + ' ' + format.red.bold(failCount) + ' ' + plural + '\n');
    out += formatFailedAssertions(results);

    return out;
  }

  function formatTotals (results) {

    if (results.count === 0) {
      return pad(format.red(symbols.cross + ' No tests found'));
    }

    return _.filter([
      pad('total:     ' + results.count),
      pad(format.green('passing:   ' + results.pass)),
      results.fail > 0 ? pad(format.red('failing:   ' + results.fail)) : undefined,
      pad('duration:  ' + prettyMs(new Date().getTime() - startTime))
    ], _.identity).join('\n');
  }

  function formatFailedAssertions (results) {

    var out = '';

    for(var test in errorSummary) {
      var errors = errorSummary[test];
      if(!errors.length) { continue; }

      out += '\n' + pad('  ' + test + '\n\n');

      _.each(errors, function (name) {

        out += pad('    ' + format.red(symbols.cross) + ' ' + format.red(name)) + '\n';
      });
    }

    return out;
  }

  function pad (str, times) {
    if(!times) { times = 1; }

    return _.fill(new Array(times), OUTPUT_PADDING).join('') + str;
  }

  return stream;
};
